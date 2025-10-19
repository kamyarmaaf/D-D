import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Character, Player, Achievement, InventoryItem, GameState, Message } from '../types/game';

interface GameStore {
  // Player state
  currentPlayer: Player | null;
  character: Character | null;
  achievements: Achievement[];
  inventory: InventoryItem[];
  
  // Game state
  gameState: GameState | null;
  messages: Message[];
  isConnected: boolean;
  currentRoom: string | null;
  
  // UI state
  currentPage: 'lobby' | 'game' | 'scoreboard' | 'character' | 'inventory' | 'achievements';
  showCharacterCreation: boolean;
  showInventory: boolean;
  showAchievements: boolean;
  
  // Actions
  setCurrentPlayer: (player: Player) => void;
  setCharacter: (character: Character) => void;
  addAchievement: (achievement: Achievement) => void;
  addInventoryItem: (item: InventoryItem) => void;
  removeInventoryItem: (itemId: string) => void;
  updateInventoryItem: (itemId: string, updates: Partial<InventoryItem>) => void;
  setGameState: (gameState: GameState) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setConnected: (connected: boolean) => void;
  setCurrentRoom: (room: string | null) => void;
  setCurrentPage: (page: 'lobby' | 'game' | 'scoreboard' | 'character' | 'inventory' | 'achievements') => void;
  setShowCharacterCreation: (show: boolean) => void;
  setShowInventory: (show: boolean) => void;
  setShowAchievements: (show: boolean) => void;
  
  // Computed values
  getTotalExperience: () => number;
  getTotalAchievementPoints: () => number;
  getInventoryWeight: () => number;
  getInventoryValue: () => number;
  
  // Reset
  resetGame: () => void;
}

// const initialPlayer: Player = {
//   id: '',
//   nickname: '',
//   age: 0,
//   genre: 'Fantasy',
//   score: 0,
//   titles: [],
//   isHost: false,
//   achievements: [],
//   level: 1,
//   experience: 0
// };

// const initialCharacter: Character = {
//   id: '',
//   name: '',
//   class: {
//     name: 'Fighter',
//     description: 'A master of weapons and armor',
//     hitDie: 10,
//     primaryAbility: ['strength'],
//     savingThrowProficiencies: ['strength'],
//     skillProficiencies: ['athletics'],
//     features: ['Fighting Style']
//   },
//   race: {
//     name: 'Human',
//     description: 'Versatile and ambitious',
//     abilityScoreIncrease: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 },
//     size: 'Medium',
//     speed: 30,
//     traits: ['Extra Language'],
//     languages: ['Common']
//   },
//   stats: {
//     strength: 10,
//     dexterity: 10,
//     constitution: 10,
//     intelligence: 10,
//     wisdom: 10,
//     charisma: 10,
//     hitPoints: 10,
//     maxHitPoints: 10,
//     armorClass: 10,
//     speed: 30
//   },
//   inventory: [],
//   spells: [],
//   equipment: { accessories: [] },
//   backstory: '',
//   avatar: '🧙‍♂️'
// };

export const useGameStore = create<GameStore>()(
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
        currentPage: 'lobby',
        showCharacterCreation: false,
        showInventory: false,
        showAchievements: false,

        // Actions
        setCurrentPlayer: (player) => set({ currentPlayer: player }),
        
        setCharacter: (character) => set({ character }),
        
        addAchievement: (achievement) => set((state) => ({
          achievements: [...state.achievements, achievement],
          currentPlayer: state.currentPlayer ? {
            ...state.currentPlayer,
            achievements: [...state.currentPlayer.achievements, achievement]
          } : null
        })),
        
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
        
        setGameState: (gameState) => set({ gameState }),
        
        addMessage: (message) => set((state) => ({
          messages: [...state.messages, message]
        })),
        
        setMessages: (messages) => set({ messages }),
        
        setConnected: (connected) => set({ isConnected: connected }),
        
        setCurrentRoom: (room) => set({ currentRoom: room }),
        
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
          currentPage: 'lobby',
          showCharacterCreation: false,
          showInventory: false,
          showAchievements: false
        })
      }),
      {
        name: 'dnd-bolt-storage',
        partialize: (state) => ({
          currentPlayer: state.currentPlayer,
          character: state.character,
          achievements: state.achievements,
          inventory: state.inventory
        })
      }
    ),
    {
      name: 'dnd-bolt-store'
    }
  )
);
