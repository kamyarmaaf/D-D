import { databaseService } from './database';
import { Room, Player, Character, Message, StoryStage, StoryChoice, Genre } from '../types/game';

// Game-specific database operations
export class GameDatabaseService {
  private db = databaseService;

  // Initialize database
  async initialize(): Promise<void> {
    await this.db.initialize();
  }

  // Room Management
  async createRoomWithGenre(roomCode: string, selectedGenre: Genre, hostPlayer: Omit<Player, 'character' | 'achievements'>): Promise<Room> {
    console.log('createRoomWithGenre called with:', { roomCode, selectedGenre, hostPlayer });
    
    // Validate inputs
    if (!roomCode || roomCode.trim() === '') {
      throw new Error('Room code cannot be empty');
    }
    
    if (!hostPlayer || !hostPlayer.id) {
      throw new Error('Host player is required and must have an id');
    }
    
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('Creating room object with:', {
      id: roomId,
      code: roomCode,
      codeType: typeof roomCode,
      codeLength: roomCode ? roomCode.length : 'undefined',
      selectedGenre,
      hostPlayerId: hostPlayer.id
    });
    
    // Create room
    const room = await this.db.createRoom({
      id: roomId,
      code: roomCode,
      players: [],
      status: 'waiting',
      maxPlayers: 6,
      createdAt: new Date(),
      selectedGenre,
      hostPlayerId: hostPlayer.id,
      currentStage: 1,
      maxStages: 5,
      isGameActive: false
    });

    // Create host player
    const player = await this.db.createPlayer({
      ...hostPlayer,
      roomId: roomId
    });

    // Update room with host player
    const updatedRoom = await this.db.getRoomById(roomId);
    return updatedRoom!;
  }

  async joinRoom(roomCode: string, player: Omit<Player, 'character' | 'achievements'>): Promise<Room | null> {
    const room = await this.db.getRoomByCode(roomCode);
    if (!room) return null;

    // Check if room is full
    if (room.players.length >= room.maxPlayers) {
      throw new Error('Room is full');
    }

    // Create player
    const newPlayer = await this.db.createPlayer({
      ...player,
      roomId: room.id
    });

    // Return updated room
    return await this.db.getRoomById(room.id);
  }

  async updateRoomStatus(roomId: string, status: 'waiting' | 'voting' | 'playing' | 'finished'): Promise<void> {
    await this.db.updateRoom(roomId, { status });
  }

  async updateRoomStage(roomId: string, currentStage: number): Promise<void> {
    await this.db.updateRoom(roomId, { currentStage });
  }

  async setGameActive(roomId: string, isActive: boolean): Promise<void> {
    await this.db.updateRoom(roomId, { isGameActive: isActive });
  }

  // Player Management
  async updatePlayerScore(playerId: string, score: number): Promise<void> {
    await this.db.updatePlayer(playerId, { score });
  }

  async updatePlayerLevel(playerId: string, level: number, experience: number): Promise<void> {
    await this.db.updatePlayer(playerId, { level, experience });
  }

  async addPlayerTitle(playerId: string, title: string): Promise<void> {
    const player = await this.db.getPlayerById(playerId);
    if (player) {
      const updatedTitles = [...player.titles, title];
      await this.db.updatePlayer(playerId, { titles: updatedTitles });
    }
  }

  // Character Management
  async createPlayerCharacter(playerId: string, character: Character): Promise<void> {
    await this.db.createCharacter(character, playerId);
  }

  async getPlayerCharacter(playerId: string): Promise<Character | null> {
    return await this.db.getCharacterByPlayerId(playerId);
  }

  // Story Progression
  async startGameSession(roomId: string, totalStages: number): Promise<string> {
    return await this.db.createGameSession(roomId, totalStages);
  }

  async recordStoryStage(gameSessionId: string, stage: StoryStage): Promise<void> {
    await this.db.createStoryStage(stage, gameSessionId);
  }

  async recordStoryChoice(stageId: string, choice: StoryChoice, diceRoll?: number, result?: 'success' | 'failure'): Promise<void> {
    await this.db.updateStoryStage(stageId, {
      selectedChoice: {
        choiceId: choice.id,
        choiceText: choice.text,
        dc: choice.dc
      },
      diceRoll,
      diceResult: result
    });
  }

  async completeStoryStage(stageId: string): Promise<void> {
    await this.db.updateStoryStage(stageId, {
      stageCompletedAt: new Date()
    });
  }

  // Message Management
  async addGameMessage(roomId: string, message: Message): Promise<void> {
    await this.db.createMessage(message, roomId);
  }

  async getGameMessages(roomId: string): Promise<Message[]> {
    return await this.db.getMessagesByRoomId(roomId);
  }

  // Achievement Management
  async unlockAchievement(playerId: string, achievement: {
    id: string;
    name: string;
    description: string;
    icon: string;
    points: number;
    category: 'combat' | 'exploration' | 'social' | 'story' | 'special';
  }): Promise<void> {
    await this.db.createAchievement({
      ...achievement,
      unlockedAt: new Date()
    }, playerId);
  }

  async getPlayerAchievements(playerId: string): Promise<Achievement[]> {
    return await this.db.getAchievementsByPlayerId(playerId);
  }

  // Inventory Management
  async addInventoryItem(playerId: string, item: {
    id: string;
    name: string;
    description: string;
    type: 'weapon' | 'armor' | 'consumable' | 'tool' | 'misc';
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    value: number;
    weight: number;
    quantity: number;
    effects?: any[];
  }): Promise<void> {
    await this.db.createInventoryItem(item, playerId);
  }

  async getPlayerInventory(playerId: string): Promise<InventoryItem[]> {
    return await this.db.getInventoryByPlayerId(playerId);
  }

  // Game Statistics
  async getRoomStatistics(roomId: string): Promise<{
    totalPlayers: number;
    currentStage: number;
    maxStages: number;
    gameActive: boolean;
    averageScore: number;
  }> {
    const room = await this.db.getRoomById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const players = room.players;
    const averageScore = players.length > 0 
      ? players.reduce((sum, player) => sum + player.score, 0) / players.length 
      : 0;

    return {
      totalPlayers: players.length,
      currentStage: room.currentStage || 1,
      maxStages: room.maxStages || 5,
      gameActive: room.isGameActive || false,
      averageScore: Math.round(averageScore)
    };
  }

  async getPlayerStatistics(playerId: string): Promise<{
    level: number;
    experience: number;
    score: number;
    achievementsCount: number;
    inventoryCount: number;
  }> {
    const player = await this.db.getPlayerById(playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    const achievements = await this.db.getAchievementsByPlayerId(playerId);
    const inventory = await this.db.getInventoryByPlayerId(playerId);

    return {
      level: player.level,
      experience: player.experience,
      score: player.score,
      achievementsCount: achievements.length,
      inventoryCount: inventory.length
    };
  }

  // Cleanup
  async clearAllData(): Promise<void> {
    await this.db.clearDatabase();
  }

  // Close database
  close(): void {
    this.db.close();
  }
}

// Export singleton instance
export const gameDatabase = new GameDatabaseService();
