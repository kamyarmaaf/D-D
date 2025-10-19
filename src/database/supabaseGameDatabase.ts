import { createClient } from '@supabase/supabase-js';
import { Room, Player, Character, Message, StoryStage, InventoryItem, Achievement } from '../types/game';
import { achievementManager } from './achievements';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fxumrywaxagueiqlovgg.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4dW1yeXdheGFndWVpcWxvdmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNzQyODksImV4cCI6MjA3NDc1MDI4OX0.zVfqMUk2vhQnWhufG7biVwos1S785Xak4kr1zmXAK-4';

const supabase = createClient(supabaseUrl, supabaseKey);

export class SupabaseGameDatabaseService {
  // Initialize database (no-op for Supabase)
  async initialize(): Promise<void> {
    console.log('Supabase database initialized');
  }

  // Room operations
  async createRoomWithGenre(
    code: string,
    genre: string,
    hostPlayer: Omit<Player, 'achievements' | 'character'>
  ): Promise<Room> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    // map to snake_case columns for Supabase
    const dbRoom = {
      id,
      code,
      status: 'waiting',
      max_players: 6,
      selected_genre: genre,
      created_at: now,
      updated_at: now,
      host_player_id: hostPlayer.id,
      current_stage: 1,
      max_stages: 5,
      is_game_active: false
    } as const;

    const { data, error } = await supabase
      .from('rooms')
      .insert([dbRoom])
      .select('id, code, status, max_players, selected_genre, created_at, updated_at, host_player_id, current_stage, max_stages, is_game_active')
      .single();

    if (error) {
      console.error('Error creating room:', error);
      throw new Error(`Failed to create room: ${error.message}`);
    }

    // map back to Room type (camelCase)
    const room: Room = {
      id: data.id,
      code: data.code,
      status: data.status,
      maxPlayers: data.max_players,
      selectedGenre: data.selected_genre,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      hostPlayerId: data.host_player_id,
      currentStage: data.current_stage,
      maxStages: data.max_stages,
      isGameActive: data.is_game_active,
      players: []
    } as any;

    return room;
  }

  async getRoomById(id: string): Promise<Room | null> {
    const { data, error } = await supabase
      .from('rooms')
      .select('id, code, status, max_players, selected_genre, created_at, updated_at, host_player_id, current_stage, max_stages, is_game_active')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      console.error('Error getting room by ID:', error);
      throw new Error(`Failed to get room: ${error.message}`);
    }

    if (!data) return null;
    return {
      id: data.id,
      code: data.code,
      status: data.status,
      maxPlayers: data.max_players,
      selectedGenre: data.selected_genre,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      hostPlayerId: data.host_player_id,
      currentStage: data.current_stage,
      maxStages: data.max_stages,
      isGameActive: data.is_game_active
    } as any;
  }

  async getRoomByCode(code: string): Promise<Room | null> {
    const { data, error } = await supabase
      .from('rooms')
      .select('id, code, status, max_players, selected_genre, created_at, updated_at, host_player_id, current_stage, max_stages, is_game_active')
      .eq('code', code)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      console.error('Error getting room by code:', error);
      throw new Error(`Failed to get room: ${error.message}`);
    }

    if (!data) return null;
    return {
      id: data.id,
      code: data.code,
      status: data.status,
      maxPlayers: data.max_players,
      selectedGenre: data.selected_genre,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      hostPlayerId: data.host_player_id,
      currentStage: data.current_stage,
      maxStages: data.max_stages,
      isGameActive: data.is_game_active
    } as any;
  }

  async updateRoomStatus(id: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('rooms')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating room status:', error);
      throw new Error(`Failed to update room status: ${error.message}`);
    }
  }

  async updateRoomStage(id: string, stage: number): Promise<void> {
    const { error } = await supabase
      .from('rooms')
      .update({ 
        current_stage: stage,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating room stage:', error);
      throw new Error(`Failed to update room stage: ${error.message}`);
    }
  }

  async setGameActive(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from('rooms')
      .update({ 
        is_game_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error setting game active:', error);
      throw new Error(`Failed to set game active: ${error.message}`);
    }
  }

  // Player operations
  async joinRoom(
    code: string,
    player: Omit<Player, 'achievements' | 'character'>
  ): Promise<Room> {
    // First get the room
    const room = await this.getRoomByCode(code);
    if (!room) {
      throw new Error('Room not found');
    }

    // Create player (map to snake_case)
    const dbPlayer: any = {
      id: player.id,
      room_id: room.id,
      nickname: player.nickname,
      email: (player as any).email ?? null,
      age: (player as any).age,
      genre: (player as any).genre,
      score: player.score ?? 0,
      titles: JSON.stringify(player.titles ?? []),
      is_host: (player as any).isHost ?? false,
      level: player.level ?? 1,
      experience: player.experience ?? 0,
      created_at: new Date().toISOString()
    };

    const { error: playerError } = await supabase
      .from('players')
      .insert([dbPlayer]);

    if (playerError) {
      console.error('Error creating player:', playerError);
      throw new Error(`Failed to create player: ${playerError.message}`);
    }

    return room;
  }

  async getPlayersByRoomId(roomId: string): Promise<Player[]> {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', roomId);

    if (error) {
      console.error('Error getting players by room ID:', error);
      throw new Error(`Failed to get players: ${error.message}`);
    }

    return data || [];
  }

  // Get most recent room for a player by nickname (uses players.created_at)
  async getLastRoomByNickname(nickname: string): Promise<Room | null> {
    const { data: lastPlayer, error } = await supabase
      .from('players')
      .select('room_id, created_at')
      .eq('nickname', nickname)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error getting last room by nickname:', error);
      throw new Error(`Failed to get last room: ${error.message}`);
    }

    if (!lastPlayer || !lastPlayer.room_id) return null;

    return this.getRoomById(lastPlayer.room_id);
  }

  // Get most recent room for a player by email (if players.email exists)
  async getLastRoomByEmail(email: string): Promise<Room | null> {
    try {
      const { data: lastPlayer, error } = await supabase
        .from('players')
        .select('room_id, created_at')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        // If column doesn't exist or any error, log and return null to allow fallback
        console.warn('getLastRoomByEmail fallback (players.email may not exist):', error);
        return null;
      }

      if (!lastPlayer || !lastPlayer.room_id) return null;
      return this.getRoomById(lastPlayer.room_id);
    } catch (e) {
      console.warn('getLastRoomByEmail unexpected error:', e);
      return null;
    }
  }

  async updatePlayerScore(playerId: string, score: number): Promise<void> {
    const { error } = await supabase
      .from('players')
      .update({ score })
      .eq('id', playerId);

    if (error) {
      console.error('Error updating player score:', error);
      throw new Error(`Failed to update player score: ${error.message}`);
    }
  }

  async updatePlayerLevel(playerId: string, level: number, experience: number): Promise<void> {
    const { error } = await supabase
      .from('players')
      .update({ level, experience })
      .eq('id', playerId);

    if (error) {
      console.error('Error updating player level:', error);
      throw new Error(`Failed to update player level: ${error.message}`);
    }
  }

  async addPlayerTitle(playerId: string, title: string): Promise<void> {
    // Get current titles
    const { data: player, error: getError } = await supabase
      .from('players')
      .select('titles')
      .eq('id', playerId)
      .single();

    if (getError) {
      console.error('Error getting player titles:', getError);
      throw new Error(`Failed to get player titles: ${getError.message}`);
    }

    const currentTitles = JSON.parse(player.titles || '[]');
    const newTitles = [...currentTitles, title];

    const { error: updateError } = await supabase
      .from('players')
      .update({ titles: JSON.stringify(newTitles) })
      .eq('id', playerId);

    if (updateError) {
      console.error('Error updating player titles:', updateError);
      throw new Error(`Failed to update player titles: ${updateError.message}`);
    }
  }

  // Character operations
  async createPlayerCharacter(playerId: string, character: Character): Promise<void> {
    const stats: any = (character as any).stats ?? {};
    const className: string | undefined = (character as any).className ?? (character as any).class?.name;
    const raceName: string | undefined = (character as any).raceName ?? (character as any).race?.name;

    const dbCharacter: any = {
      id: (character as any).id ?? crypto.randomUUID(),
      player_id: playerId,
      name: (character as any).name ?? 'Adventurer',
      class_name: className,
      race_name: raceName,
      strength: stats.strength ?? 10,
      dexterity: stats.dexterity ?? 10,
      constitution: stats.constitution ?? 10,
      intelligence: stats.intelligence ?? 10,
      wisdom: stats.wisdom ?? 10,
      charisma: stats.charisma ?? 10,
      hit_points: stats.hitPoints ?? 10,
      max_hit_points: stats.maxHitPoints ?? 10,
      armor_class: stats.armorClass ?? 10,
      speed: stats.speed ?? 30,
      backstory: (character as any).backstory ?? null,
      avatar: (character as any).avatar ?? '🧙‍♂️',
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('characters')
      .insert([dbCharacter]);

    if (error) {
      console.error('Error creating character:', error);
      throw new Error(`Failed to create character: ${error.message}`);
    }
  }

  async getCharacterByPlayerId(playerId: string): Promise<Character | null> {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('player_id', playerId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      console.error('Error getting character:', error);
      throw new Error(`Failed to get character: ${error.message}`);
    }

    return data;
  }

  // Message operations
  async addGameMessage(roomId: string, message: Message): Promise<void> {
    const dbMessage: any = {
      id: message.id,
      room_id: roomId,
      type: message.type,
      sender: (message as any).sender,
      content: message.content,
      dice_roll: (message as any).diceRoll ?? null,
      timestamp: (message as any).timestamp ?? new Date().toISOString()
    };

    const { error } = await supabase
      .from('messages')
      .insert([dbMessage]);

    if (error) {
      console.error('Error adding game message:', error);
      throw new Error(`Failed to add message: ${error.message}`);
    }
  }

  async getMessagesByRoomId(roomId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error getting messages:', error);
      throw new Error(`Failed to get messages: ${error.message}`);
    }

    return data || [];
  }

  // Game session operations
  async startGameSession(roomId: string, totalStages: number): Promise<string> {
    const sessionId = crypto.randomUUID();
    
    const { error } = await supabase
      .from('game_sessions')
      .insert([{
        id: sessionId,
        room_id: roomId,
        session_number: 1,
        total_stages: totalStages,
        completed_stages: 0,
        final_score: 0,
        status: 'active',
        started_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error starting game session:', error);
      throw new Error(`Failed to start game session: ${error.message}`);
    }

    return sessionId;
  }

  async recordStoryStage(sessionId: string, stage: StoryStage): Promise<void> {
    const dbStage: any = {
      id: (stage as any).id ?? crypto.randomUUID(),
      game_session_id: sessionId,
      stage_number: (stage as any).stage ?? (stage as any).stage_number ?? 1,
      stage_description: (stage as any).description ?? (stage as any).stage_description,
      selected_choice_id: (stage as any).selected_choice_id ?? null,
      choice_text: (stage as any).choice_text ?? null,
      dice_roll: (stage as any).dice_roll ?? null,
      dice_result: (stage as any).dice_result ?? null,
      dc_required: (stage as any).dc_required ?? null,
      stage_started_at: new Date().toISOString(),
      stage_completed_at: null
    };

    const { error } = await supabase
      .from('story_stages')
      .insert([dbStage]);

    if (error) {
      console.error('Error recording story stage:', error);
      throw new Error(`Failed to record story stage: ${error.message}`);
    }
  }

  async getStoryStagesBySessionId(sessionId: string): Promise<StoryStage[]> {
    const { data, error } = await supabase
      .from('story_stages')
      .select('*')
      .eq('game_session_id', sessionId)
      .order('stage_number', { ascending: true });

    if (error) {
      console.error('Error getting story stages:', error);
      throw new Error(`Failed to get story stages: ${error.message}`);
    }

    return data || [];
  }

  // Inventory operations
  async addInventoryItem(playerId: string, item: InventoryItem): Promise<void> {
    const dbItem: any = {
      id: item.id,
      player_id: playerId,
      item_name: item.name ?? (item as any).item_name,
      description: item.description ?? null,
      item_type: item.type ?? (item as any).item_type,
      rarity: item.rarity,
      value: item.value ?? 0,
      weight: (item as any).weight ?? 0,
      quantity: item.quantity ?? 1,
      effects: JSON.stringify(item.effects ?? []),
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('inventory_items')
      .insert([dbItem]);

    if (error) {
      console.error('Error adding inventory item:', error);
      throw new Error(`Failed to add inventory item: ${error.message}`);
    }
  }

  async getInventoryByPlayerId(playerId: string): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('player_id', playerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting inventory:', error);
      throw new Error(`Failed to get inventory: ${error.message}`);
    }

    return data || [];
  }

  // Achievement operations
  async checkAndUnlockAchievements(
    playerId: string,
    eventType: string,
    eventData: any,
    currentScore: number,
    currentLevel: number,
    completedStages: number,
    completedGames: number
  ): Promise<Achievement[]> {
    const newAchievementIds = await achievementManager.checkAchievements(
      playerId,
      eventType,
      eventData,
      currentScore,
      currentLevel,
      completedStages,
      completedGames
    );

    const unlockedAchievements: Achievement[] = [];

    for (const achievementId of newAchievementIds) {
      const template = achievementManager.getAchievementTemplate(achievementId);
      if (template) {
        await this.unlockAchievement(playerId, {
          id: template.id,
          name: template.name,
          description: template.description,
          icon: template.icon,
          points: template.points,
          category: template.category as any
        });

        unlockedAchievements.push({
          id: template.id,
          name: template.name,
          description: template.description,
          icon: template.icon,
          points: template.points,
          category: template.category as any,
          unlockedAt: new Date()
        });
      }
    }

    return unlockedAchievements;
  }

  async unlockAchievement(playerId: string, achievement: Omit<Achievement, 'unlockedAt'>): Promise<void> {
    const dbAch: any = {
      id: (achievement as any).id ?? crypto.randomUUID(),
      player_id: playerId,
      achievement_name: (achievement as any).achievement_name ?? achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      points: achievement.points ?? 0,
      category: achievement.category,
      unlocked_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('achievements')
      .insert([dbAch]);

    if (error) {
      console.error('Error unlocking achievement:', error);
      throw new Error(`Failed to unlock achievement: ${error.message}`);
    }
  }

  async getAchievementsByPlayerId(playerId: string): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('id, player_id, achievement_name, description, icon, points, category, unlocked_at')
      .eq('player_id', playerId)
      .order('unlocked_at', { ascending: false });

    if (error) {
      console.error('Error getting achievements:', error);
      throw new Error(`Failed to get achievements: ${error.message}`);
    }

    const rows = data || [];
    return rows.map((row: any) => ({
      id: row.id,
      name: row.achievement_name,
      description: row.description,
      icon: row.icon,
      points: row.points,
      category: row.category,
      unlockedAt: row.unlocked_at ? new Date(row.unlocked_at) : new Date(0)
    })) as Achievement[];
  }

  // Statistics
  async getRoomStatistics(roomId: string): Promise<any> {
    const { data, error } = await supabase
      .from('players')
      .select('score, level, experience')
      .eq('room_id', roomId);

    if (error) {
      console.error('Error getting room statistics:', error);
      throw new Error(`Failed to get room statistics: ${error.message}`);
    }

    return {
      totalPlayers: data?.length || 0,
      totalScore: data?.reduce((sum, player) => sum + (player.score || 0), 0) || 0,
      averageLevel: data?.length ? data.reduce((sum, player) => sum + (player.level || 1), 0) / data.length : 0
    };
  }

  async getPlayerStatistics(playerId: string): Promise<any> {
    const { data, error } = await supabase
      .from('players')
      .select('score, level, experience')
      .eq('id', playerId)
      .single();

    if (error) {
      console.error('Error getting player statistics:', error);
      throw new Error(`Failed to get player statistics: ${error.message}`);
    }

    return data;
  }

  // Cleanup
  async clearDatabase(): Promise<void> {
    // Note: This would require admin privileges, so we'll skip for now
    console.log('Clear database not implemented for Supabase');
  }

  async close(): Promise<void> {
    // No-op for Supabase
    console.log('Supabase connection closed');
  }
}

export const supabaseGameDatabase = new SupabaseGameDatabaseService();
