import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
// @ts-ignore
import { persist } from 'zustand/middleware';
import { Character, Player, Achievement, InventoryItem, GameState, Message, Room, Genre, StoryChoice } from '../types/game';
import { supabaseGameDatabase } from '../database/supabaseGameDatabase';

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
  
  // Room expiration
  expireRoom: (roomId: string) => Promise<void>;
}

export const useEnhancedGameStore = create<EnhancedGameStore>()(
  devtools(
    persist(
      (set: any, get: any) => ({
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
            await supabaseGameDatabase.initialize();
            console.log('Supabase database initialized successfully');
          } catch (error) {
            console.error('Failed to initialize Supabase database:', error);
            throw error;
          }
        },

        // Room operations
        createRoom: async (roomCode: string, selectedGenre: Genre, hostPlayer: Omit<Player, 'character' | 'achievements'>) => {
          try {
            console.log('Enhanced store createRoom called with:', { 
              roomCode, 
              roomCodeType: typeof roomCode,
              roomCodeLength: roomCode ? roomCode.length : 'undefined',
              isCodeNull: roomCode === null,
              isCodeUndefined: roomCode === undefined,
              isCodeEmpty: roomCode === '',
              selectedGenre, 
              hostPlayer 
            });
            
            console.log('Debug - About to call gameDatabase.createRoomWithGenre with:', {
              roomCode,
              selectedGenre,
              hostPlayer
            });
            
            const room = await supabaseGameDatabase.createRoomWithGenre(roomCode, selectedGenre, hostPlayer);
            
            if (!room) {
              throw new Error('Failed to create room - room is null');
            }
            
            console.log('Room created successfully:', room);
            console.log('Debug - Store state after room creation:', {
              roomCode: roomCode,
              roomCodeFromRoom: room.code,
              currentRoomCode: roomCode,
              areCodesEqual: roomCode === room.code
            });
            set({ currentRoom: room, currentRoomCode: roomCode });
            return room;
          } catch (error) {
            console.error('Failed to create room:', error);
            throw error;
          }
        },

        joinRoom: async (roomCode: string, player: Omit<Player, 'character' | 'achievements'>) => {
          try {
            const room = await supabaseGameDatabase.joinRoom(roomCode, player);
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
            await supabaseGameDatabase.updateRoomStatus(state.currentRoom.id, status);
            set({ currentRoom: { ...state.currentRoom, status } });
          }
        },

        updateRoomStage: async (stage: number) => {
          const state = get();
          if (state.currentRoom) {
            await supabaseGameDatabase.updateRoomStage(state.currentRoom.id, stage);
            set({ currentRoom: { ...state.currentRoom, currentStage: stage } });
          }
        },

        setGameActive: async (isActive: boolean) => {
          const state = get();
          if (state.currentRoom) {
            await supabaseGameDatabase.setGameActive(state.currentRoom.id, isActive);
            set({ currentRoom: { ...state.currentRoom, isGameActive: isActive } });
          }
        },

        // Player operations
        setCurrentPlayer: (player: Player) => set({ currentPlayer: player }),

        updatePlayerScore: async (score: number) => {
          const state = get();
          if (state.currentPlayer) {
            await supabaseGameDatabase.updatePlayerScore(state.currentPlayer.id, score);
            set({ 
              currentPlayer: { ...state.currentPlayer, score },
              currentRoom: state.currentRoom ? {
                ...state.currentRoom,
                players: state.currentRoom.players.map((p: Player) => 
                  p.id === state.currentPlayer!.id ? { ...p, score } : p
                )
              } : null
            });
          }
        },

        updatePlayerLevel: async (level: number, experience: number) => {
          const state = get();
          if (state.currentPlayer) {
            await supabaseGameDatabase.updatePlayerLevel(state.currentPlayer.id, level, experience);
            set({ 
              currentPlayer: { ...state.currentPlayer, level, experience }
            });
          }
        },

        addPlayerTitle: async (title: string) => {
          const state = get();
          if (state.currentPlayer) {
            await supabaseGameDatabase.addPlayerTitle(state.currentPlayer.id, title);
            const updatedTitles = [...state.currentPlayer.titles, title];
            set({ 
              currentPlayer: { ...state.currentPlayer, titles: updatedTitles }
            });
          }
        },

        // Character operations
        setCharacter: (character: Character) => set({ character }),

        createPlayerCharacter: async (character: Character) => {
          const state = get();
          if (state.currentPlayer) {
            await supabaseGameDatabase.createPlayerCharacter(state.currentPlayer.id, character);
            set({ character });
          }
        },

        // Achievement operations
        addAchievement: (achievement: Achievement) => set((state: EnhancedGameStore) => ({
          achievements: [...state.achievements, achievement],
          currentPlayer: state.currentPlayer ? {
            ...state.currentPlayer,
            achievements: [...state.currentPlayer.achievements, achievement]
          } : null
        })),

        unlockAchievement: async (achievement: Omit<Achievement, 'unlockedAt'>) => {
          const state = get();
          if (state.currentPlayer) {
            await supabaseGameDatabase.unlockAchievement(state.currentPlayer.id, achievement);
            const newAchievement = { ...achievement, unlockedAt: new Date() };
            set((state: EnhancedGameStore) => ({
              achievements: [...state.achievements, newAchievement],
              currentPlayer: state.currentPlayer ? {
                ...state.currentPlayer,
                achievements: [...state.currentPlayer.achievements, newAchievement]
              } : null
            }));
          }
        },

        // Inventory operations
        addInventoryItem: (item: InventoryItem) => set((state: EnhancedGameStore) => {
          const existingItem = state.inventory.find((i: InventoryItem) => i.id === item.id);
          if (existingItem) {
            return {
              inventory: state.inventory.map((i: InventoryItem) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              )
            };
          }
          return { inventory: [...state.inventory, item] };
        }),

        removeInventoryItem: (itemId: string) => set((state: EnhancedGameStore) => ({
          inventory: state.inventory.filter((item: InventoryItem) => item.id !== itemId)
        })),

        updateInventoryItem: (itemId: string, updates: Partial<InventoryItem>) => set((state: EnhancedGameStore) => ({
          inventory: state.inventory.map((item: InventoryItem) =>
            item.id === itemId ? { ...item, ...updates } : item
          )
        })),

        addInventoryItemToDatabase: async (item: InventoryItem) => {
          const state = get();
          if (state.currentPlayer) {
            await supabaseGameDatabase.addInventoryItem(state.currentPlayer.id, item);
            set((state: EnhancedGameStore) => {
              const existingItem = state.inventory.find((i: InventoryItem) => i.id === item.id);
              if (existingItem) {
                return {
                  inventory: state.inventory.map((i: InventoryItem) =>
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
        addMessage: (message: Message) => set((state: EnhancedGameStore) => ({
          messages: [...state.messages, message]
        })),

        setMessages: (messages: Message[]) => set({ messages }),

        addMessageToDatabase: async (message: Message) => {
          const state = get();
          if (state.currentRoom) {
            await supabaseGameDatabase.addGameMessage(state.currentRoom.id, message);
            set((state: EnhancedGameStore) => ({
              messages: [...state.messages, message]
            }));
          }
        },

        // Story progression
        startGameSession: async (totalStages: number) => {
          const state = get();
          if (state.currentRoom) {
            return await supabaseGameDatabase.startGameSession(state.currentRoom.id, totalStages);
          }
          throw new Error('No current room');
        },

        recordStoryStage: async (stage: { stage: number; description: string; choices: StoryChoice[] }) => {
          const state = get();
          if (state.currentRoom) {
            const sessionId = await supabaseGameDatabase.startGameSession(state.currentRoom.id, 5);
            await supabaseGameDatabase.recordStoryStage(sessionId, stage);
          }
        },

        recordStoryChoice: async (choice: StoryChoice, diceRoll?: number, result?: 'success' | 'failure') => {
          // This would need the stage ID from the current game state
          // For now, we'll just log it
          console.log('Story choice recorded:', { choice, diceRoll, result });
        },

        // Game state operations
        setGameState: (gameState: GameState) => set({ gameState }),
        setConnected: (connected: boolean) => set({ isConnected: connected }),
        setCurrentRoom: (room: Room | null) => set({ currentRoom: room }),
        setCurrentRoomCode: (code: string | null) => set({ currentRoomCode: code }),

        // UI operations
        setCurrentPage: (page: 'lobby' | 'game' | 'scoreboard' | 'character' | 'inventory' | 'achievements') => set({ currentPage: page }),
        setShowCharacterCreation: (show: boolean) => set({ showCharacterCreation: show }),
        setShowInventory: (show: boolean) => set({ showInventory: show }),
        setShowAchievements: (show: boolean) => {
          set({ showAchievements: show });
          if (show) {
            const state = get();
            if (state.currentPlayer) {
              supabaseGameDatabase.getAchievementsByPlayerId(state.currentPlayer.id)
                .then((items) => set({ achievements: items }))
                .catch((err) => console.error('Failed to load achievements:', err));
            }
          }
        },

        // Computed values
        getTotalExperience: () => {
          const state = get();
          return state.currentPlayer?.experience || 0;
        },

        getTotalAchievementPoints: () => {
          const state = get();
          return state.achievements.reduce((total: number, achievement: Achievement) => total + achievement.points, 0);
        },

        getInventoryWeight: () => {
          const state = get();
          return state.inventory.reduce((total: number, item: InventoryItem) => total + (item.weight * item.quantity), 0);
        },

        getInventoryValue: () => {
          const state = get();
          return state.inventory.reduce((total: number, item: InventoryItem) => total + (item.value * item.quantity), 0);
        },

        // Statistics
        getRoomStatistics: async () => {
          const state = get();
          if (state.currentRoom) {
            return await supabaseGameDatabase.getRoomStatistics(state.currentRoom.id);
          }
          throw new Error('No current room');
        },

        getPlayerStatistics: async () => {
          const state = get();
          if (state.currentPlayer) {
            return await supabaseGameDatabase.getPlayerStatistics(state.currentPlayer.id);
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
        }),

        // Room expiration
        expireRoom: async (roomId: string) => {
          try {
            await supabaseGameDatabase.updateRoomStatus(roomId, 'finished');
            console.log('Room expired:', roomId);
          } catch (error) {
            console.error('Failed to expire room:', error);
            throw error;
          }
        }
      }),
      {
        name: 'dnd-bolt-enhanced-storage',
        partialize: (state: EnhancedGameStore) => ({
          currentPlayer: state.currentPlayer,
          character: state.character,
          achievements: state.achievements,
          inventory: state.inventory,
          currentRoom: state.currentRoom,
          currentRoomCode: state.currentRoomCode
        })
      }
    ),
    {
      name: 'dnd-bolt-enhanced-store'
    }
  )
);
