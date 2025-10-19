import initSqlJs from 'sql.js';
import { Room, Player, Character, Message, StoryStage, InventoryItem, Achievement } from '../types/game';

// Database configuration
const DB_NAME = 'dnd_bolt.db';

// Database service class
export class DatabaseService {
  private db: any = null;
  private SQL: any = null;

  // Initialize the database
  async initialize(): Promise<void> {
    try {
      // Try to initialize with local WASM file first
      try {
        this.SQL = await initSqlJs({
          locateFile: (file: string) => {
            if (file.endsWith('.wasm')) {
              return new URL('sql.js/dist/sql-wasm.wasm', import.meta.url).href;
            }
            return file;
          }
        });
      } catch (localError) {
        console.warn('Failed to load local WASM, falling back to CDN:', localError);
        // Fallback to CDN if local file fails
        this.SQL = await initSqlJs({
          locateFile: (file: string) => `https://sql.js.org/dist/${file}`
        });
      }
      
      // Try to load existing database from localStorage
      const savedDb = localStorage.getItem(DB_NAME);
      console.log('Debug - Loading database from localStorage:', {
        hasSavedDb: !!savedDb,
        savedDbLength: savedDb ? savedDb.length : 0
      });
      
      if (savedDb) {
        try {
          const data = new Uint8Array(JSON.parse(savedDb));
          this.db = new this.SQL.Database(data);
          console.log('Debug - Successfully loaded database from localStorage');
        } catch (parseError) {
          console.warn('Failed to parse saved database, creating new one:', parseError);
          this.db = new this.SQL.Database();
          await this.createTables();
        }
      } else {
        // Create new database
        console.log('Debug - No saved database found, creating new one');
        this.db = new this.SQL.Database();
        await this.createTables();
      }
      
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      // Create a fallback in-memory database
      try {
        this.SQL = await initSqlJs();
        this.db = new this.SQL.Database();
        await this.createTables();
        console.log('Database initialized with fallback method');
      } catch (fallbackError) {
        console.error('Complete database initialization failure:', fallbackError);
        throw new Error('Database initialization failed completely');
      }
    }
  }

  // Create database tables
  private async createTables(): Promise<void> {
    const schema = `
      -- Rooms table
      CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('waiting', 'voting', 'playing', 'finished')),
        max_players INTEGER NOT NULL DEFAULT 6,
        selected_genre TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        host_player_id TEXT,
        current_stage INTEGER DEFAULT 1,
        max_stages INTEGER DEFAULT 5,
        is_game_active BOOLEAN DEFAULT FALSE
      );

      -- Players table
      CREATE TABLE IF NOT EXISTS players (
        id TEXT PRIMARY KEY,
        room_id TEXT NOT NULL,
        nickname TEXT NOT NULL,
        age INTEGER NOT NULL,
        genre TEXT NOT NULL,
        score INTEGER DEFAULT 0,
        titles TEXT DEFAULT '[]',
        is_host BOOLEAN DEFAULT FALSE,
        level INTEGER DEFAULT 1,
        experience INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Characters table
      CREATE TABLE IF NOT EXISTS characters (
        id TEXT PRIMARY KEY,
        player_id TEXT NOT NULL,
        name TEXT NOT NULL,
        class_name TEXT NOT NULL,
        race_name TEXT NOT NULL,
        strength INTEGER DEFAULT 10,
        dexterity INTEGER DEFAULT 10,
        constitution INTEGER DEFAULT 10,
        intelligence INTEGER DEFAULT 10,
        wisdom INTEGER DEFAULT 10,
        charisma INTEGER DEFAULT 10,
        hit_points INTEGER DEFAULT 10,
        max_hit_points INTEGER DEFAULT 10,
        armor_class INTEGER DEFAULT 10,
        speed INTEGER DEFAULT 30,
        backstory TEXT,
        avatar TEXT DEFAULT '🧙‍♂️',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Game sessions table
      CREATE TABLE IF NOT EXISTS game_sessions (
        id TEXT PRIMARY KEY,
        room_id TEXT NOT NULL,
        session_number INTEGER NOT NULL,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ended_at DATETIME,
        total_stages INTEGER NOT NULL,
        completed_stages INTEGER DEFAULT 0,
        final_score INTEGER DEFAULT 0,
        status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'abandoned'))
      );

      -- Story stages table
      CREATE TABLE IF NOT EXISTS story_stages (
        id TEXT PRIMARY KEY,
        game_session_id TEXT NOT NULL,
        stage_number INTEGER NOT NULL,
        stage_description TEXT NOT NULL,
        selected_choice_id INTEGER,
        choice_text TEXT,
        dice_roll INTEGER,
        dice_result TEXT CHECK (dice_result IN ('success', 'failure')),
        dc_required INTEGER,
        stage_started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        stage_completed_at DATETIME
      );

      -- Story choices table
      CREATE TABLE IF NOT EXISTS story_choices (
        id TEXT PRIMARY KEY,
        story_stage_id TEXT NOT NULL,
        choice_id INTEGER NOT NULL,
        choice_text TEXT NOT NULL,
        dc_required INTEGER NOT NULL,
        is_selected BOOLEAN DEFAULT FALSE
      );

      -- Messages table
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        room_id TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('player', 'ai', 'system', 'action')),
        sender TEXT NOT NULL,
        content TEXT NOT NULL,
        dice_roll INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Inventory items table
      CREATE TABLE IF NOT EXISTS inventory_items (
        id TEXT PRIMARY KEY,
        player_id TEXT NOT NULL,
        item_name TEXT NOT NULL,
        description TEXT,
        item_type TEXT NOT NULL,
        rarity TEXT NOT NULL,
        value INTEGER DEFAULT 0,
        weight REAL DEFAULT 0,
        quantity INTEGER DEFAULT 1,
        effects TEXT DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Achievements table
      CREATE TABLE IF NOT EXISTS achievements (
        id TEXT PRIMARY KEY,
        player_id TEXT NOT NULL,
        achievement_name TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        points INTEGER DEFAULT 0,
        category TEXT NOT NULL,
        unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    this.db.exec(schema);
    this.saveDatabase();
  }

  // Save database to localStorage
  private saveDatabase(): void {
    try {
      if (!this.db) {
        console.warn('Database not initialized, cannot save');
        return;
      }
      const data = this.db.export();
      const buffer = Array.from(data);
      localStorage.setItem(DB_NAME, JSON.stringify(buffer));
      console.log('Debug - Database saved to localStorage, size:', buffer.length);
    } catch (error) {
      console.error('Failed to save database to localStorage:', error);
      // Don't throw error to prevent breaking the app
    }
  }

  // Room operations
  async createRoom(room: Omit<Room, 'players'>): Promise<Room> {
    try {
      console.log('Debug - createRoom called with room object:', {
        id: room.id,
        code: room.code,
        codeType: typeof room.code,
        codeLength: room.code ? room.code.length : 'undefined'
      });
      
      // Validate required fields
      if (!room.code || room.code === 'undefined' || room.code === 'null') {
        console.error('Invalid room code:', room.code);
        throw new Error('Room code is required and must be a valid string');
      }
      
      if (!this.db) {
        throw new Error('Database not initialized');
      }
      
      console.log('Creating room with data:', {
        id: room.id,
        code: room.code,
        status: room.status,
        maxPlayers: room.maxPlayers,
        selectedGenre: room.selectedGenre
      });
      
      // Use direct SQL execution instead of prepared statement due to SQL.js parameter binding issue
      const sql = `
        INSERT INTO rooms (id, code, status, max_players, selected_genre, created_at, host_player_id, current_stage, max_stages, is_game_active)
        VALUES ('${room.id}', '${room.code}', '${room.status}', ${room.maxPlayers}, '${room.selectedGenre || 'fantasy'}', '${room.createdAt.toISOString()}', ${room.hostPlayerId ? `'${room.hostPlayerId}'` : 'NULL'}, ${room.currentStage || 1}, ${room.maxStages || 5}, ${room.isGameActive || false})
      `;
      
      console.log('Debug - Using direct SQL execution:', sql);
      
      try {
        this.db.exec(sql);
      } catch (sqlError) {
        console.error('Debug - SQL execution failed with error:', sqlError);
        throw sqlError;
      }
      
      this.saveDatabase();
      
      const createdRoom = await this.getRoomById(room.id);
      if (!createdRoom) {
        throw new Error('Failed to create room');
      }
      
      console.log('Debug - Created room returned:', {
        id: createdRoom.id,
        code: createdRoom.code,
        codeType: typeof createdRoom.code,
        codeLength: createdRoom.code ? createdRoom.code.length : 'undefined'
      });
      
      return createdRoom;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }

  async getRoomById(id: string): Promise<Room | null> {
    try {
      if (!this.db) {
        console.warn('Database not initialized');
        return null;
      }
      // Use direct SQL execution instead of prepared statement
      const sql = `SELECT * FROM rooms WHERE id = '${id}'`;
      const results = this.db.exec(sql);
      
      if (!results || results.length === 0) {
        return null;
      }
      
      const rows = results[0].values;
      const columns = results[0].columns;
      
      if (rows.length === 0) {
        return null;
      }
      
      const result: any = {};
      columns.forEach((col: string, index: number) => {
        result[col] = rows[0][index];
      });
    
      const players = await this.getPlayersByRoomId(id);
      
      return {
        id: result.id,
        code: result.code,
        players,
        status: result.status,
        maxPlayers: result.max_players,
        createdAt: new Date(result.created_at),
        selectedGenre: result.selected_genre,
        hostPlayerId: result.host_player_id,
        currentStage: result.current_stage,
        maxStages: result.max_stages,
        isGameActive: result.is_game_active
      };
    } catch (error) {
      console.error('Error getting room by ID:', error);
      return null;
    }
  }

  async getRoomByCode(code: string): Promise<Room | null> {
    console.log('Debug - getRoomByCode called with:', {
      code,
      codeType: typeof code,
      codeLength: code ? code.length : 'undefined'
    });
    
    // Use direct SQL execution instead of prepared statement
    const sql = `SELECT * FROM rooms WHERE code = '${code}'`;
    const results = this.db.exec(sql);
    
    if (!results || results.length === 0) {
      console.log('Debug - getRoomByCode result: not found');
      return null;
    }
    
    const rows = results[0].values;
    const columns = results[0].columns;
    
    if (rows.length === 0) {
      console.log('Debug - getRoomByCode result: not found');
      return null;
    }
    
    const result: any = {};
    columns.forEach((col: string, index: number) => {
      result[col] = rows[0][index];
    });
    
    console.log('Debug - getRoomByCode result:', {
      found: !!result,
      resultCode: result?.code,
      resultCodeType: typeof result?.code
    });
    
    const players = await this.getPlayersByRoomId(result.id);
    
    const room = {
      id: result.id,
      code: result.code,
      players,
      status: result.status,
      maxPlayers: result.max_players,
      createdAt: new Date(result.created_at),
      selectedGenre: result.selected_genre,
      hostPlayerId: result.host_player_id,
      currentStage: result.current_stage,
      maxStages: result.max_stages,
      isGameActive: result.is_game_active
    };
    
    console.log('Debug - getRoomByCode returning room:', {
      id: room.id,
      code: room.code,
      codeType: typeof room.code
    });
    
    return room;
  }

  async updateRoom(id: string, updates: Partial<Room>): Promise<void> {
    const fields = [];
    const values = [];
    
    if (updates.status) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.selectedGenre) {
      fields.push('selected_genre = ?');
      values.push(updates.selectedGenre);
    }
    if (updates.currentStage !== undefined) {
      fields.push('current_stage = ?');
      values.push(updates.currentStage);
    }
    if (updates.isGameActive !== undefined) {
      fields.push('is_game_active = ?');
      values.push(updates.isGameActive);
    }
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    const stmt = this.db.prepare(`UPDATE rooms SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(values);
    this.saveDatabase();
  }

  // Player operations
  async createPlayer(player: Omit<Player, 'character' | 'achievements'>): Promise<Player> {
    // Use direct SQL execution instead of prepared statement due to SQL.js parameter binding issue
    const sql = `
      INSERT INTO players (id, room_id, nickname, age, genre, score, titles, is_host, level, experience)
      VALUES ('${player.id}', '${player.roomId || ''}', '${player.nickname}', ${player.age}, '${player.genre}', ${player.score}, '${JSON.stringify(player.titles)}', ${player.isHost}, ${player.level}, ${player.experience})
    `;
    
      try {
        this.db.exec(sql);
      } catch (sqlError) {
        console.error('Debug - Player creation SQL failed with error:', sqlError);
        throw sqlError;
      }
    
    this.saveDatabase();
    const createdPlayer = await this.getPlayerById(player.id);
    if (!createdPlayer) {
      throw new Error('Failed to create player');
    }
    return createdPlayer;
  }

  async getPlayerById(id: string): Promise<Player | null> {
    // Use direct SQL execution instead of prepared statement
    const sql = `SELECT * FROM players WHERE id = '${id}'`;
    const results = this.db.exec(sql);
    
    if (!results || results.length === 0) {
      return null;
    }
    
    const rows = results[0].values;
    const columns = results[0].columns;
    
    if (rows.length === 0) {
      return null;
    }
    
    const result: any = {};
    columns.forEach((col: string, index: number) => {
      result[col] = rows[0][index];
    });
    
    const character = await this.getCharacterByPlayerId(id);
    const achievements = await this.getAchievementsByPlayerId(id);
    
    return {
      id: result.id,
      nickname: result.nickname,
      age: result.age,
      genre: result.genre as 'Fantasy' | 'Mystery' | 'Horror' | 'Comedy',
      score: result.score,
      titles: JSON.parse(result.titles),
      isHost: result.is_host,
      character: character || undefined,
      achievements,
      level: result.level,
      experience: result.experience,
      roomId: result.room_id
    };
  }

  async getPlayersByRoomId(roomId: string): Promise<Player[]> {
    // Use direct SQL execution instead of prepared statement
    const sql = `SELECT * FROM players WHERE room_id = '${roomId}'`;
    const results = this.db.exec(sql);
    
    if (!results || results.length === 0) {
      return [];
    }
    
    const players = [];
    const rows = results[0].values;
    const columns = results[0].columns;
    
    for (const row of rows) {
      const result: any = {};
      columns.forEach((col: string, index: number) => {
        result[col] = row[index];
      });
      
      const character = await this.getCharacterByPlayerId(result.id);
      const achievements = await this.getAchievementsByPlayerId(result.id);
      
      players.push({
        id: result.id,
        nickname: result.nickname,
        age: result.age,
        genre: result.genre as 'Fantasy' | 'Mystery' | 'Horror' | 'Comedy',
        score: result.score,
        titles: JSON.parse(result.titles),
        isHost: result.is_host,
        character,
        achievements,
        level: result.level,
        experience: result.experience
      } as Player);
    }
    
    return players;
  }

  async updatePlayer(id: string, updates: Partial<Player>): Promise<void> {
    const fields = [];
    const values = [];
    
    if (updates.score !== undefined) {
      fields.push('score = ?');
      values.push(updates.score);
    }
    if (updates.titles) {
      fields.push('titles = ?');
      values.push(JSON.stringify(updates.titles));
    }
    if (updates.level !== undefined) {
      fields.push('level = ?');
      values.push(updates.level);
    }
    if (updates.experience !== undefined) {
      fields.push('experience = ?');
      values.push(updates.experience);
    }
    
    values.push(id);
    
    const stmt = this.db.prepare(`UPDATE players SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(values);
    this.saveDatabase();
  }

  // Character operations
  async createCharacter(character: Character, playerId: string): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO characters (id, player_id, name, class_name, race_name, strength, dexterity, constitution, intelligence, wisdom, charisma, hit_points, max_hit_points, armor_class, speed, backstory, avatar)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      character.id,
      playerId,
      character.name,
      character.class.name,
      character.race.name,
      character.stats.strength,
      character.stats.dexterity,
      character.stats.constitution,
      character.stats.intelligence,
      character.stats.wisdom,
      character.stats.charisma,
      character.stats.hitPoints,
      character.stats.maxHitPoints,
      character.stats.armorClass,
      character.stats.speed,
      character.backstory,
      character.avatar
    );
    
    this.saveDatabase();
  }

  async getCharacterByPlayerId(playerId: string): Promise<Character | null> {
    // Use direct SQL execution instead of prepared statement
    const sql = `SELECT * FROM characters WHERE player_id = '${playerId}'`;
    const results = this.db.exec(sql);
    
    if (!results || results.length === 0) {
      return null;
    }
    
    const rows = results[0].values;
    const columns = results[0].columns;
    
    if (rows.length === 0) {
      return null;
    }
    
    const result: any = {};
    columns.forEach((col: string, index: number) => {
      result[col] = rows[0][index];
    });
    
    return {
      id: result.id,
      name: result.name,
      class: {
        name: result.class_name,
        description: '',
        hitDie: 8,
        primaryAbility: [],
        savingThrowProficiencies: [],
        skillProficiencies: [],
        features: []
      },
      race: {
        name: result.race_name,
        description: '',
        abilityScoreIncrease: {},
        size: 'Medium',
        speed: result.speed,
        traits: [],
        languages: []
      },
      stats: {
        strength: result.strength,
        dexterity: result.dexterity,
        constitution: result.constitution,
        intelligence: result.intelligence,
        wisdom: result.wisdom,
        charisma: result.charisma,
        hitPoints: result.hit_points,
        maxHitPoints: result.max_hit_points,
        armorClass: result.armor_class,
        speed: result.speed
      },
      inventory: [],
      spells: [],
      equipment: {
        accessories: []
      },
      backstory: result.backstory,
      avatar: result.avatar
    } as Character;
  }

  // Story stage operations
  async createStoryStage(stage: StoryStage, gameSessionId: string): Promise<void> {
    const stageId = `stage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const stmt = this.db.prepare(`
      INSERT INTO story_stages (id, game_session_id, stage_number, stage_description)
      VALUES (?, ?, ?, ?)
    `);
    
    stmt.run(stageId, gameSessionId, stage.stage, stage.description);
    
    // Insert choices
    for (const choice of stage.choices) {
      const choiceId = `choice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const choiceStmt = this.db.prepare(`
        INSERT INTO story_choices (id, story_stage_id, choice_id, choice_text, dc_required)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      choiceStmt.run(choiceId, stageId, choice.id, choice.text, choice.dc);
    }
    
    this.saveDatabase();
  }

  async updateStoryStage(stageId: string, updates: Partial<StoryStage>): Promise<void> {
    const fields = [];
    const values = [];
    
    if (updates.selectedChoice) {
      fields.push('selected_choice_id = ?');
      values.push(updates.selectedChoice.choiceId);
      fields.push('choice_text = ?');
      values.push(updates.selectedChoice.choiceText);
      fields.push('dc_required = ?');
      values.push(updates.selectedChoice.dc);
    }
    if (updates.diceRoll !== undefined) {
      fields.push('dice_roll = ?');
      values.push(updates.diceRoll);
    }
    if (updates.diceResult) {
      fields.push('dice_result = ?');
      values.push(updates.diceResult);
    }
    
    values.push(stageId);
    
    const stmt = this.db.prepare(`UPDATE story_stages SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(values);
    this.saveDatabase();
  }

  // Message operations
  async createMessage(message: Message, roomId: string): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO messages (id, room_id, type, sender, content, dice_roll, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      message.id,
      roomId,
      message.type,
      message.sender,
      message.content,
      message.diceRoll || null,
      message.timestamp.toISOString()
    );
    
    this.saveDatabase();
  }

  async getMessagesByRoomId(roomId: string): Promise<Message[]> {
    // Use direct SQL execution instead of prepared statement
    const sql = `SELECT * FROM messages WHERE room_id = '${roomId}' ORDER BY timestamp ASC`;
    const results = this.db.exec(sql);
    
    if (!results || results.length === 0) {
      return [];
    }
    
    const rows = results[0].values;
    const columns = results[0].columns;
    
    return rows.map((row: any[]) => {
      const result: any = {};
      columns.forEach((col: string, index: number) => {
        result[col] = row[index];
      });
      
      return {
        id: result.id,
        type: result.type as 'player' | 'ai' | 'system' | 'action',
        sender: result.sender,
        content: result.content,
        timestamp: new Date(result.timestamp),
        diceRoll: result.dice_roll
      };
    }) as Message[];
  }

  // Achievement operations
  async createAchievement(achievement: Achievement, playerId: string): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO achievements (id, player_id, achievement_name, description, icon, points, category, unlocked_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      achievement.id,
      playerId,
      achievement.name,
      achievement.description,
      achievement.icon,
      achievement.points,
      achievement.category,
      achievement.unlockedAt.toISOString()
    );
    
    this.saveDatabase();
  }

  async getAchievementsByPlayerId(playerId: string): Promise<Achievement[]> {
    // Use direct SQL execution instead of prepared statement
    const sql = `SELECT * FROM achievements WHERE player_id = '${playerId}' ORDER BY unlocked_at DESC`;
    const results = this.db.exec(sql);
    
    if (!results || results.length === 0) {
      return [];
    }
    
    const rows = results[0].values;
    const columns = results[0].columns;
    
    return rows.map((row: any[]) => {
      const result: any = {};
      columns.forEach((col: string, index: number) => {
        result[col] = row[index];
      });
      
      return {
        id: result.id,
        name: result.achievement_name,
        description: result.description,
        icon: result.icon,
        points: result.points,
        unlockedAt: new Date(result.unlocked_at),
        category: result.category as 'combat' | 'exploration' | 'social' | 'story' | 'special'
      };
    }) as Achievement[];
  }

  // Inventory operations
  async createInventoryItem(item: InventoryItem, playerId: string): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO inventory_items (id, player_id, item_name, description, item_type, rarity, value, weight, quantity, effects)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      item.id,
      playerId,
      item.name,
      item.description,
      item.type,
      item.rarity,
      item.value,
      item.weight,
      item.quantity,
      JSON.stringify(item.effects || [])
    );
    
    this.saveDatabase();
  }

  async getInventoryByPlayerId(playerId: string): Promise<InventoryItem[]> {
    // Use direct SQL execution instead of prepared statement
    const sql = `SELECT * FROM inventory_items WHERE player_id = '${playerId}' ORDER BY created_at DESC`;
    const results = this.db.exec(sql);
    
    if (!results || results.length === 0) {
      return [];
    }
    
    const rows = results[0].values;
    const columns = results[0].columns;
    
    return rows.map((row: any[]) => {
      const result: any = {};
      columns.forEach((col: string, index: number) => {
        result[col] = row[index];
      });
      
      return {
        id: result.id,
        name: result.item_name,
        description: result.description,
        type: result.item_type as 'weapon' | 'armor' | 'consumable' | 'tool' | 'misc',
        rarity: result.rarity as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary',
        value: result.value,
        weight: result.weight,
        quantity: result.quantity,
        effects: JSON.parse(result.effects)
      };
    }) as InventoryItem[];
  }

  // Game session operations
  async createGameSession(roomId: string, totalStages: number): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const stmt = this.db.prepare(`
      INSERT INTO game_sessions (id, room_id, session_number, total_stages, status)
      VALUES (?, ?, 1, ?, 'active')
    `);
    
    stmt.run(sessionId, roomId, totalStages);
    this.saveDatabase();
    
    return sessionId;
  }

  async updateGameSession(sessionId: string, updates: Partial<{ completedStages: number; finalScore: number; status: string }>): Promise<void> {
    const fields = [];
    const values = [];
    
    if (updates.completedStages !== undefined) {
      fields.push('completed_stages = ?');
      values.push(updates.completedStages);
    }
    if (updates.finalScore !== undefined) {
      fields.push('final_score = ?');
      values.push(updates.finalScore);
    }
    if (updates.status) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    
    values.push(sessionId);
    
    const stmt = this.db.prepare(`UPDATE game_sessions SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(values);
    this.saveDatabase();
  }

  // Additional utility methods
  async getAllRooms(): Promise<Room[]> {
    try {
      if (!this.db) {
        console.warn('Database not initialized');
        return [];
      }
      // Use direct SQL execution instead of prepared statement
      const sql = 'SELECT * FROM rooms ORDER BY created_at DESC';
      const results = this.db.exec(sql);
      
      if (!results || results.length === 0) {
        return [];
      }
      
      const rows = results[0].values;
      const columns = results[0].columns;
      
      const rooms: Room[] = [];
      for (const row of rows) {
        const result: any = {};
        columns.forEach((col: string, index: number) => {
          result[col] = row[index];
        });
        
        const players = await this.getPlayersByRoomId(result.id);
        rooms.push({
          id: result.id,
          code: result.code,
          players,
          status: result.status,
          maxPlayers: result.max_players,
          createdAt: new Date(result.created_at),
          selectedGenre: result.selected_genre,
          hostPlayerId: result.host_player_id,
          currentStage: result.current_stage,
          maxStages: result.max_stages,
          isGameActive: result.is_game_active
        });
      }
      return rooms;
    } catch (error) {
      console.error('Error getting all rooms:', error);
      return [];
    }
  }

  async addPlayerToRoom(roomId: string, playerId: string): Promise<void> {
    try {
      if (!this.db) {
        throw new Error('Database not initialized');
      }
      const stmt = this.db.prepare('UPDATE players SET room_id = ? WHERE id = ?');
      stmt.run(roomId, playerId);
      this.saveDatabase();
    } catch (error) {
      console.error('Error adding player to room:', error);
      throw error;
    }
  }


  // Cleanup operations
  async clearDatabase(): Promise<void> {
    this.db.exec('DELETE FROM achievements');
    this.db.exec('DELETE FROM inventory_items');
    this.db.exec('DELETE FROM messages');
    this.db.exec('DELETE FROM story_choices');
    this.db.exec('DELETE FROM story_stages');
    this.db.exec('DELETE FROM game_sessions');
    this.db.exec('DELETE FROM characters');
    this.db.exec('DELETE FROM players');
    this.db.exec('DELETE FROM rooms');
    this.saveDatabase();
  }

  // Debug method to check room data
  async debugRoomData(roomId: string): Promise<void> {
    try {
      if (!this.db) {
        console.warn('Database not initialized');
        return;
      }
      
      // Use direct SQL execution instead of prepared statement
      const sql = `SELECT * FROM rooms WHERE id = '${roomId}'`;
      const results = this.db.exec(sql);
      
      if (!results || results.length === 0) {
        console.log('Debug - No room found with id:', roomId);
        return;
      }
      
      const rows = results[0].values;
      const columns = results[0].columns;
      
      if (rows.length === 0) {
        console.log('Debug - No room found with id:', roomId);
        return;
      }
      
      const result: any = {};
      columns.forEach((col: string, index: number) => {
        result[col] = rows[0][index];
      });
      
      console.log('Debug - Raw room data from database:', result);
      
      if (result) {
        console.log('Debug - Room code from database:', {
          code: result.code,
          codeType: typeof result.code,
          codeLength: result.code ? result.code.length : 'undefined',
          isCodeEmpty: result.code === '',
          isCodeNull: result.code === null,
          isCodeUndefined: result.code === undefined
        });
      }
      
      // Also check what's in localStorage
      const savedDb = localStorage.getItem(DB_NAME);
      console.log('Debug - localStorage data:', {
        hasData: !!savedDb,
        dataLength: savedDb ? savedDb.length : 0,
        dataPreview: savedDb ? savedDb.substring(0, 100) + '...' : 'No data'
      });
    } catch (error) {
      console.error('Debug - Error checking room data:', error);
    }
  }


  // Close database connection
  close(): void {
    if (this.db) {
      this.db.close();
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
