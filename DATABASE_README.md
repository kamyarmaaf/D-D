# D&D Bolt Database System

This document explains the SQLite database integration for the D&D Bolt game, which stores room information, player data, story progression, and game statistics.

## Overview

The database system uses SQL.js (a pure JavaScript SQLite implementation) to provide persistent storage in the browser. All data is stored in localStorage and automatically synchronized with the game state.

## Database Schema

### Tables

1. **rooms** - Stores room information and game state
2. **players** - Stores player profiles and statistics
3. **characters** - Stores character creation data
4. **game_sessions** - Tracks individual game sessions
5. **story_stages** - Records story progression
6. **story_choices** - Stores available choices for each stage
7. **messages** - Stores all game messages and chat
8. **inventory_items** - Stores player inventory
9. **achievements** - Stores unlocked achievements

### Key Features

- **Room Management**: Create and join rooms with unique codes
- **Genre Selection**: Track selected genre for each room
- **Story Progression**: Record each stage of the story with choices and outcomes
- **Player Statistics**: Track scores, levels, experience, and achievements
- **Message History**: Store all game messages and dice rolls
- **Inventory System**: Persistent item management
- **Achievement System**: Track player accomplishments

## Usage

### 1. Database Initialization

The database is automatically initialized when the app starts:

```typescript
import { gameDatabase } from './database/gameDatabase';

// Initialize database
await gameDatabase.initialize();
```

### 2. Room Operations

```typescript
import { useEnhancedGameStore } from './store/enhancedGameStore';

const { createRoom, joinRoom, updateRoomStatus } = useEnhancedGameStore();

// Create a room with genre
const room = await createRoom('ABC123', 'fantasy', hostPlayer);

// Join an existing room
const room = await joinRoom('ABC123', player);

// Update room status
await updateRoomStatus('playing');
```

### 3. Story Progression

```typescript
import { useStoryDatabase } from './hooks/useStoryDatabase';

const {
  initializeStorySession,
  recordStageProgression,
  recordPlayerChoice,
  recordAIResponse
} = useStoryDatabase();

// Start a new story session
const sessionId = await initializeStorySession(5);

// Record a story stage
await recordStageProgression({
  stage: 1,
  description: "You enter a dark forest...",
  choices: [
    { id: 1, text: "Go left", dc: 12 },
    { id: 2, text: "Go right", dc: 15 }
  ]
});

// Record player choice with dice roll
await recordPlayerChoice(choice, 15, 'success');

// Record AI response
await recordAIResponse("You successfully navigate the path!");
```

### 4. Player Management

```typescript
const {
  updatePlayerScore,
  updatePlayerLevel,
  addPlayerTitle,
  unlockAchievement
} = useEnhancedGameStore();

// Update player score
await updatePlayerScore(100);

// Level up player
await updatePlayerLevel(2, 150);

// Add achievement
await unlockAchievement({
  id: 'first_victory',
  name: 'First Victory',
  description: 'Won your first game',
  icon: '🏆',
  points: 50,
  category: 'story'
});
```

### 5. Message System

```typescript
const { addMessageToDatabase } = useEnhancedGameStore();

// Add a message to the database
await addMessageToDatabase({
  id: 'msg_123',
  type: 'player',
  sender: 'Player1',
  content: 'I attack the dragon!',
  timestamp: new Date(),
  diceRoll: 18
});
```

## Database Service Classes

### DatabaseService

Core database operations with SQL.js:

```typescript
import { databaseService } from './database/database';

// Room operations
await databaseService.createRoom(roomData);
const room = await databaseService.getRoomById(roomId);
await databaseService.updateRoom(roomId, updates);

// Player operations
await databaseService.createPlayer(playerData);
const player = await databaseService.getPlayerById(playerId);
await databaseService.updatePlayer(playerId, updates);
```

### GameDatabaseService

High-level game operations:

```typescript
import { gameDatabase } from './database/gameDatabase';

// Room management
const room = await gameDatabase.createRoomWithGenre(code, genre, hostPlayer);
const room = await gameDatabase.joinRoom(code, player);

// Story progression
const sessionId = await gameDatabase.startGameSession(roomId, totalStages);
await gameDatabase.recordStoryStage(sessionId, stage);

// Statistics
const stats = await gameDatabase.getRoomStatistics(roomId);
const playerStats = await gameDatabase.getPlayerStatistics(playerId);
```

## Data Persistence

- All data is automatically saved to localStorage
- Database state is preserved between browser sessions
- Data is synchronized with the Zustand store
- Automatic cleanup and optimization

## Error Handling

The database system includes comprehensive error handling:

- Database initialization errors
- Room creation/joining failures
- Story progression errors
- Player data validation
- Message recording failures

## Performance Considerations

- Database operations are asynchronous
- Large datasets are handled efficiently
- Indexes are created for optimal query performance
- Data is compressed in localStorage

## Future Enhancements

- Export/import game data
- Cloud synchronization
- Multi-device support
- Advanced analytics
- Data backup and recovery

## Troubleshooting

### Common Issues

1. **Database initialization fails**
   - Check browser localStorage support
   - Clear browser data and retry
   - Check console for error messages

2. **Room creation fails**
   - Ensure unique room codes
   - Check player data validity
   - Verify database is initialized

3. **Story progression not saving**
   - Check room and session IDs
   - Verify database connection
   - Check for validation errors

### Debug Mode

Enable debug logging by setting:

```typescript
localStorage.setItem('dnd-bolt-debug', 'true');
```

This will log all database operations to the console.

## API Reference

For complete API documentation, see the TypeScript definitions in:
- `src/database/database.ts`
- `src/database/gameDatabase.ts`
- `src/store/enhancedGameStore.ts`
- `src/hooks/useStoryDatabase.ts`
