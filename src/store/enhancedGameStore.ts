import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Character, Player, Achievement, InventoryItem, GameState, Message, Room, Genre, StoryChoice } from '../types/game';
import { gameDatabase } from '../database/gameDatabase';

interface EnhancedGameStore {
  // Player state
  currentPlayer: Player | null;
  character: Character | null;
  achievements: Achievement[];
  inventory: InventoryItem[];
  
  // Game state
  gameState: GameState | null;
  messages: Message[];
  isConnected: boolean;
  currentRoom: Room | null;
  currentRoomCode: string | null;
  
  // UI state
  currentPage: 'lobby' | 'game' | 'scoreboard' | 'character' | 'inventory' | 'achievements';
  showCharacterCreation: boolean;
  showInventory: boolean;
  showAchievements: boolean;
  
  // Database operations
  initializeDatabase: () => Promise<void>;
  
  // Room operations
  createRoom: (roomCode: string, selectedGenre: Genre, hostPlayer: Omit<Player, 'character' | 'achievements'>) => Promise<Room>;
  joinRoom: (roomCode: string, player: Omit<Player, 'character' | 'achievements'>) => Promise<Room | null>;
  updateRoomStatus: (status: 'waiting' | 'voting' | 'playing' | 'finished') => Promise<void>;
  updateRoomStage: (stage: number) => Promise<void>;
  setGameActive: (isActive: boolean) => Promise<void>;
  
  // Player operations
  setCurrentPlayer: (player: Player) => void;
  updatePlayerScore: (score: number) => Promise<void>;
  updatePlayerLevel: (level: number, experience: number) => Promise<void>;
  addPlayerTitle: (title: string) => Promise<void>;
  
  // Character operations
  setCharacter: (character: Character) => void;
  createPlayerCharacter: (character: Character) => Promise<void>;
  
  // Achievement operations
  addAchievement: (achievement: Achievement) => void;
  unlockAchievement: (achievement: Omit<Achievement, 'unlockedAt'>) => Promise<void>;
  
  // Inventory operations
  addInventoryItem: (item: InventoryItem) => void;
  removeInventoryItem: (itemId: string) => void;
  updateInventoryItem: (itemId: string, updates: Partial<InventoryItem>) => void;
  addInventoryItemToDatabase: (item: InventoryItem) => Promise<void>;
  
  // Message operations
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  addMessageToDatabase: (message: Message) => Promise<void>;
  
  // Story progression
  startGameSession: (totalStages: number) => Promise<string>;
  recordStoryStage: (stage: { stage: number; description: string; choices: StoryChoice[] }) => Promise<void>;
  recordStoryChoice: (choice: StoryChoice, diceRoll?: number, result?: 'success' | 'failure') => Promise<void>;
  
  // Game state operations
  setGameState: (gameState: GameState) => void;
  setConnected: (connected: boolean) => void;
  setCurrentRoom: (room: Room | null) => void;
  setCurrentRoomCode: (code: string | null) => void;
  
  // UI operations
  setCurrentPage: (page: 'lobby' | 'game' | 'scoreboard' | 'character' | 'inventory' | 'achievements') => void;
  setShowCharacterCreation: (show: boolean) => void;
  setShowInventory: (show: boolean) => void;
  setShowAchievements: (show: boolean) => void;
  
  // Computed values
  getTotalExperience: () => number;
  getTotalAchievementPoints: () => number;
  getInventoryWeight: () => number;
  getInventoryValue: () => number;
  
  // Statistics
  getRoomStatistics: () => Promise<{
    totalPlayers: number;
    currentStage: number;
    maxStages: number;
    gameActive: boolean;
    averageScore: number;
  }>;
  
  getPlayerStatistics: () => Promise<{
    level: number;
    experience: number;
    score: number;
    achievementsCount: number;
    inventoryCount: number;
  }>;
  
  // Reset
  resetGame: () => void;
}

export const useEnhancedGameStore = create<EnhancedGameStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentPlayer: null,
        character: null,
        achievements: [],
        inventory: [],
        gameState: null,
        messages: [],
        isConnected: false,
        currentRoom: null,
        currentRoomCode: null,
        currentPage: 'lobby',
        showCharacterCreation: false,
        showInventory: false,
        showAchievements: false,

        // Database operations
        initializeDatabase: async () => {
          try {
            await gameDatabase.initialize();
            console.log('Database initialized successfully');
          } catch (error) {
            console.error('Failed to initialize database:', error);
            throw error;
          }
        },

        // Room operations
        createRoom: async (roomCode: string, selectedGenre: Genre, hostPlayer: Omit<Player, 'character' | 'achievements'>) => {
          try {
            console.log('Enhanced store createRoom called with:', { roomCode, selectedGenre, hostPlayer });
            const room = await gameDatabase.createRoomWithGenre(roomCode, selectedGenre, hostPlayer);
            
            if (!room) {
              throw new Error('Failed to create room - room is null');
            }
            
            console.log('Room created successfully:', room);
            set({ currentRoom: room, currentRoomCode: roomCode });
            return room;
          } catch (error) {
            console.error('Failed to create room:', error);
            throw error;
          }
        },

        joinRoom: async (roomCode: string, player: Omit<Player, 'character' | 'achievements'>) => {
          try {
            const room = await gameDatabase.joinRoom(roomCode, player);
            if (room) {
              set({ currentRoom: room, currentRoomCode: roomCode });
            }
            return room;
          } catch (error) {
            console.error('Failed to join room:', error);
            throw error;
          }
        },

        updateRoomStatus: async (status: 'waiting' | 'voting' | 'playing' | 'finished') => {
          const state = get();
          if (state.currentRoom) {
            await gameDatabase.updateRoomStatus(state.currentRoom.id, status);
            set({ currentRoom: { ...state.currentRoom, status } });
          }
        },

        updateRoomStage: async (stage: number) => {
          const state = get();
          if (state.currentRoom) {
            await gameDatabase.updateRoomStage(state.currentRoom.id, stage);
            set({ currentRoom: { ...state.currentRoom, currentStage: stage } });
          }
        },

        setGameActive: async (isActive: boolean) => {
          const state = get();
          if (state.currentRoom) {
            await gameDatabase.setGameActive(state.currentRoom.id, isActive);
            set({ currentRoom: { ...state.currentRoom, isGameActive: isActive } });
          }
        },

        // Player operations
        setCurrentPlayer: (player) => set({ currentPlayer: player }),

        updatePlayerScore: async (score: number) => {
          const state = get();
          if (state.currentPlayer) {
            await gameDatabase.updatePlayerScore(state.currentPlayer.id, score);
            set({ 
              currentPlayer: { ...state.currentPlayer, score },
              currentRoom: state.currentRoom ? {
                ...state.currentRoom,
                players: state.currentRoom.players.map(p => 
                  p.id === state.currentPlayer!.id ? { ...p, score } : p
                )
              } : null
            });
          }
        },

        updatePlayerLevel: async (level: number, experience: number) => {
          const state = get();
          if (state.currentPlayer) {
            await gameDatabase.updatePlayerLevel(state.currentPlayer.id, level, experience);
            set({ 
              currentPlayer: { ...state.currentPlayer, level, experience }
            });
          }
        },

        addPlayerTitle: async (title: string) => {
          const state = get();
          if (state.currentPlayer) {
            await gameDatabase.addPlayerTitle(state.currentPlayer.id, title);
            const updatedTitles = [...state.currentPlayer.titles, title];
            set({ 
              currentPlayer: { ...state.currentPlayer, titles: updatedTitles }
            });
          }
        },

        // Character operations
        setCharacter: (character) => set({ character }),

        createPlayerCharacter: async (character: Character) => {
          const state = get();
          if (state.currentPlayer) {
            await gameDatabase.createPlayerCharacter(state.currentPlayer.id, character);
            set({ character });
          }
        },

        // Achievement operations
        addAchievement: (achievement) => set((state) => ({
          achievements: [...state.achievements, achievement],
          currentPlayer: state.currentPlayer ? {
            ...state.currentPlayer,
            achievements: [...state.currentPlayer.achievements, achievement]
          } : null
        })),

        unlockAchievement: async (achievement: Omit<Achievement, 'unlockedAt'>) => {
          const state = get();
          if (state.currentPlayer) {
            await gameDatabase.unlockAchievement(state.currentPlayer.id, achievement);
            const newAchievement = { ...achievement, unlockedAt: new Date() };
            set((state) => ({
              achievements: [...state.achievements, newAchievement],
              currentPlayer: state.currentPlayer ? {
                ...state.currentPlayer,
                achievements: [...state.currentPlayer.achievements, newAchievement]
              } : null
            }));
          }
        },

        // Inventory operations
        addInventoryItem: (item) => set((state) => {
          const existingItem = state.inventory.find(i => i.id === item.id);
          if (existingItem) {
            return {
              inventory: state.inventory.map(i =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              )
            };
          }
          return { inventory: [...state.inventory, item] };
        }),

        removeInventoryItem: (itemId) => set((state) => ({
          inventory: state.inventory.filter(item => item.id !== itemId)
        })),

        updateInventoryItem: (itemId, updates) => set((state) => ({
          inventory: state.inventory.map(item =>
            item.id === itemId ? { ...item, ...updates } : item
          )
        })),

        addInventoryItemToDatabase: async (item: InventoryItem) => {
          const state = get();
          if (state.currentPlayer) {
            await gameDatabase.addInventoryItem(state.currentPlayer.id, item);
            set((state) => {
              const existingItem = state.inventory.find(i => i.id === item.id);
              if (existingItem) {
                return {
                  inventory: state.inventory.map(i =>
                    i.id === item.id
                      ? { ...i, quantity: i.quantity + item.quantity }
                      : i
                  )
                };
              }
              return { inventory: [...state.inventory, item] };
            });
          }
        },

        // Message operations
        addMessage: (message) => set((state) => ({
          messages: [...state.messages, message]
        })),

        setMessages: (messages) => set({ messages }),

        addMessageToDatabase: async (message: Message) => {
          const state = get();
          if (state.currentRoom) {
            await gameDatabase.addGameMessage(state.currentRoom.id, message);
            set((state) => ({
              messages: [...state.messages, message]
            }));
          }
        },

        // Story progression
        startGameSession: async (totalStages: number) => {
          const state = get();
          if (state.currentRoom) {
            return await gameDatabase.startGameSession(state.currentRoom.id, totalStages);
          }
          throw new Error('No current room');
        },

        recordStoryStage: async (stage: { stage: number; description: string; choices: StoryChoice[] }) => {
          const state = get();
          if (state.currentRoom) {
            const sessionId = await gameDatabase.startGameSession(state.currentRoom.id, 5);
            await gameDatabase.recordStoryStage(sessionId, stage);
          }
        },

        recordStoryChoice: async (choice: StoryChoice, diceRoll?: number, result?: 'success' | 'failure') => {
          // This would need the stage ID from the current game state
          // For now, we'll just log it
          console.log('Story choice recorded:', { choice, diceRoll, result });
        },

        // Game state operations
        setGameState: (gameState) => set({ gameState }),
        setConnected: (connected) => set({ isConnected: connected }),
        setCurrentRoom: (room) => set({ currentRoom: room }),
        setCurrentRoomCode: (code) => set({ currentRoomCode: code }),

        // UI operations
        setCurrentPage: (page) => set({ currentPage: page }),
        setShowCharacterCreation: (show) => set({ showCharacterCreation: show }),
        setShowInventory: (show) => set({ showInventory: show }),
        setShowAchievements: (show) => set({ showAchievements: show }),

        // Computed values
        getTotalExperience: () => {
          const state = get();
          return state.currentPlayer?.experience || 0;
        },

        getTotalAchievementPoints: () => {
          const state = get();
          return state.achievements.reduce((total, achievement) => total + achievement.points, 0);
        },

        getInventoryWeight: () => {
          const state = get();
          return state.inventory.reduce((total, item) => total + (item.weight * item.quantity), 0);
        },

        getInventoryValue: () => {
          const state = get();
          return state.inventory.reduce((total, item) => total + (item.value * item.quantity), 0);
        },

        // Statistics
        getRoomStatistics: async () => {
          const state = get();
          if (state.currentRoom) {
            return await gameDatabase.getRoomStatistics(state.currentRoom.id);
          }
          throw new Error('No current room');
        },

        getPlayerStatistics: async () => {
          const state = get();
          if (state.currentPlayer) {
            return await gameDatabase.getPlayerStatistics(state.currentPlayer.id);
          }
          throw new Error('No current player');
        },

        // Reset
        resetGame: () => set({
          currentPlayer: null,
          character: null,
          achievements: [],
          inventory: [],
          gameState: null,
          messages: [],
          isConnected: false,
          currentRoom: null,
          currentRoomCode: null,
          currentPage: 'lobby',
          showCharacterCreation: false,
          showInventory: false,
          showAchievements: false
        })
      }),
      {
        name: 'dnd-bolt-enhanced-storage',
        partialize: (state) => ({
          currentPlayer: state.currentPlayer,
          character: state.character,
          achievements: state.achievements,
          inventory: state.inventory,
          currentRoomCode: state.currentRoomCode
        })
      }
    ),
    {
      name: 'dnd-bolt-enhanced-store'
    }
  )
);
