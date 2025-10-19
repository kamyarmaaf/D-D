import { databaseService } from './database';
import { Genre } from '../types/game';

// Sample data for seeding the database
const sampleGenres: Genre[] = ['fantasy', 'mystery', 'horror', 'comedy', 'scifi', 'historical'];

const samplePlayers = [
  {
    id: 'player_1',
    nickname: 'Gandalf',
    age: 25,
    genre: 'Fantasy' as const,
    score: 0,
    titles: ['Wizard'],
    isHost: true,
    achievements: [],
    level: 1,
    experience: 0
  },
  {
    id: 'player_2',
    nickname: 'Aragorn',
    age: 30,
    genre: 'Fantasy' as const,
    score: 0,
    titles: ['Ranger'],
    isHost: false,
    achievements: [],
    level: 1,
    experience: 0
  },
  {
    id: 'player_3',
    nickname: 'Legolas',
    age: 28,
    genre: 'Fantasy' as const,
    score: 0,
    titles: ['Archer'],
    isHost: false,
    achievements: [],
    level: 1,
    experience: 0
  }
];

const sampleCharacters = [
  {
    id: 'char_1',
    name: 'Gandalf the Grey',
    class: {
      name: 'Wizard',
      description: 'A master of arcane magic',
      hitDie: 6,
      primaryAbility: ['intelligence'],
      savingThrowProficiencies: ['intelligence', 'wisdom'],
      skillProficiencies: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'religion'],
      features: ['Spellcasting', 'Arcane Recovery']
    },
    race: {
      name: 'Human',
      description: 'Versatile and ambitious',
      abilityScoreIncrease: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 },
      size: 'Medium',
      speed: 30,
      traits: ['Extra Language'],
      languages: ['Common']
    },
    stats: {
      strength: 10,
      dexterity: 14,
      constitution: 12,
      intelligence: 16,
      wisdom: 15,
      charisma: 13,
      hitPoints: 8,
      maxHitPoints: 8,
      armorClass: 10,
      speed: 30
    },
    inventory: [],
    spells: [
      {
        id: 'spell_1',
        name: 'Magic Missile',
        level: 1,
        school: 'Evocation',
        castingTime: '1 action',
        range: '120 feet',
        components: ['V', 'S'],
        duration: 'Instantaneous',
        description: 'A dart of force energy hits the target',
        damage: {
          dice: '1d4+1',
          type: 'force'
        }
      }
    ],
    equipment: { accessories: [] },
    backstory: 'A wise wizard who has traveled far and wide, seeking knowledge and protecting the innocent.',
    avatar: '🧙‍♂️'
  },
  {
    id: 'char_2',
    name: 'Aragorn, Son of Arathorn',
    class: {
      name: 'Ranger',
      description: 'A warrior of the wilderness',
      hitDie: 10,
      primaryAbility: ['dexterity', 'wisdom'],
      savingThrowProficiencies: ['strength', 'dexterity'],
      skillProficiencies: ['animal handling', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'stealth', 'survival'],
      features: ['Favored Enemy', 'Natural Explorer']
    },
    race: {
      name: 'Human',
      description: 'Versatile and ambitious',
      abilityScoreIncrease: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 },
      size: 'Medium',
      speed: 30,
      traits: ['Extra Language'],
      languages: ['Common']
    },
    stats: {
      strength: 16,
      dexterity: 14,
      constitution: 14,
      intelligence: 12,
      wisdom: 15,
      charisma: 13,
      hitPoints: 12,
      maxHitPoints: 12,
      armorClass: 13,
      speed: 30
    },
    inventory: [],
    spells: [],
    equipment: { accessories: [] },
    backstory: 'A skilled ranger and tracker, heir to the throne of Gondor.',
    avatar: '🗡️'
  }
];

const sampleAchievements = [
  {
    id: 'ach_1',
    name: 'First Adventure',
    description: 'Completed your first adventure',
    icon: '🎯',
    points: 10,
    unlockedAt: new Date(),
    category: 'story' as const
  },
  {
    id: 'ach_2',
    name: 'Dice Master',
    description: 'Rolled a natural 20',
    icon: '🎲',
    points: 5,
    unlockedAt: new Date(),
    category: 'combat' as const
  },
  {
    id: 'ach_3',
    name: 'Explorer',
    description: 'Discovered a new location',
    icon: '🗺️',
    points: 15,
    unlockedAt: new Date(),
    category: 'exploration' as const
  }
];

const sampleInventoryItems = [
  {
    id: 'item_1',
    name: 'Magic Wand',
    description: 'A wand that enhances spellcasting',
    type: 'weapon' as const,
    rarity: 'rare' as const,
    value: 100,
    weight: 1,
    quantity: 1,
    effects: [
      {
        type: 'stat_bonus' as const,
        target: 'intelligence',
        value: 2
      }
    ]
  },
  {
    id: 'item_2',
    name: 'Health Potion',
    description: 'Restores 2d4+2 hit points',
    type: 'consumable' as const,
    rarity: 'common' as const,
    value: 25,
    weight: 0.5,
    quantity: 3
  },
  {
    id: 'item_3',
    name: 'Leather Armor',
    description: 'Light armor that provides protection',
    type: 'armor' as const,
    rarity: 'common' as const,
    value: 10,
    weight: 10,
    quantity: 1,
    effects: [
      {
        type: 'stat_bonus' as const,
        target: 'armorClass',
        value: 1
      }
    ]
  }
];

// Function to seed the database with initial data
export async function seedDatabase(): Promise<void> {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Initialize the database first
    await databaseService.initialize();
    
    // Clear existing data
    await databaseService.clearDatabase();
    console.log('🗑️ Cleared existing data');
    
    // Create sample rooms
    const room1 = await databaseService.createRoom({
      id: 'room_1',
      code: 'DEMO123',
      status: 'waiting',
      maxPlayers: 6,
      createdAt: new Date(),
      selectedGenre: 'fantasy',
      hostPlayerId: 'player_1',
      currentStage: 1,
      maxStages: 5,
      isGameActive: false
    });
    console.log('🏠 Created room:', room1.code);
    
    const room2 = await databaseService.createRoom({
      id: 'room_2',
      code: 'MYST456',
      status: 'waiting',
      maxPlayers: 4,
      createdAt: new Date(),
      selectedGenre: 'mystery',
      hostPlayerId: 'player_2',
      currentStage: 1,
      maxStages: 3,
      isGameActive: false
    });
    console.log('🏠 Created room:', room2.code);
    
    // Create sample players
    for (const player of samplePlayers) {
      await databaseService.createPlayer(player);
      console.log('👤 Created player:', player.nickname);
    }
    
    // Create sample characters
    await databaseService.createCharacter(sampleCharacters[0], 'player_1');
    await databaseService.createCharacter(sampleCharacters[1], 'player_2');
    console.log('🧙‍♂️ Created characters');
    
    // Add players to rooms
    await databaseService.addPlayerToRoom('room_1', 'player_1');
    await databaseService.addPlayerToRoom('room_1', 'player_2');
    await databaseService.addPlayerToRoom('room_2', 'player_2');
    await databaseService.addPlayerToRoom('room_2', 'player_3');
    console.log('👥 Added players to rooms');
    
    // Create sample achievements
    for (const achievement of sampleAchievements) {
      await databaseService.createAchievement(achievement, 'player_1');
    }
    console.log('🏆 Created achievements');
    
    // Create sample inventory items
    for (const item of sampleInventoryItems) {
      await databaseService.createInventoryItem(item, 'player_1');
    }
    console.log('🎒 Created inventory items');
    
    // Create sample messages
    const sampleMessages = [
      {
        id: 'msg_1',
        type: 'system' as const,
        sender: 'Game Master',
        content: 'Welcome to your first adventure!',
        timestamp: new Date(),
        diceRoll: undefined
      },
      {
        id: 'msg_2',
        type: 'player' as const,
        sender: 'Gandalf',
        content: 'I shall guide you through this quest.',
        timestamp: new Date(),
        diceRoll: undefined
      }
    ];
    
    for (const message of sampleMessages) {
      await databaseService.createMessage(message, 'room_1');
    }
    console.log('💬 Created sample messages');
    
    // Create a game session
    const sessionId = await databaseService.createGameSession('room_1', 5);
    console.log('🎮 Created game session:', sessionId);
    
    console.log('✅ Database seeding completed successfully!');
    console.log('📊 Sample data includes:');
    console.log('   - 2 rooms (DEMO123, MYST456)');
    console.log('   - 3 players with characters');
    console.log('   - 3 achievements');
    console.log('   - 3 inventory items');
    console.log('   - Sample messages and game session');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Function to check if database has data
export async function hasData(): Promise<boolean> {
  try {
    const rooms = await databaseService.getAllRooms();
    return rooms.length > 0;
  } catch (error) {
    console.error('Error checking database data:', error);
    return false;
  }
}

// Auto-seed if no data exists
export async function autoSeedIfEmpty(): Promise<void> {
  try {
    const hasExistingData = await hasData();
    if (!hasExistingData) {
      console.log('🔄 No data found, auto-seeding database...');
      await seedDatabase();
    } else {
      console.log('📊 Database already contains data, skipping auto-seed');
    }
  } catch (error) {
    console.error('Auto-seed failed:', error);
  }
}
