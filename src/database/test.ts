// Database test file - can be run in browser console for testing
import { gameDatabase } from './gameDatabase';

export const testDatabase = async () => {
  console.log('🧪 Starting database test...');
  
  try {
    // Initialize database
    await gameDatabase.initialize();
    console.log('✅ Database initialized');

    // Test room creation
    const testPlayer = {
      id: 'test_player_1',
      nickname: 'TestPlayer',
      age: 25,
      genre: 'Fantasy' as const,
      score: 0,
      titles: [],
      isHost: true,
      level: 1,
      experience: 0
    };

    const room = await gameDatabase.createRoomWithGenre('TEST123', 'fantasy', testPlayer);
    console.log('✅ Room created:', room);

    // Test joining room
    const joinPlayer = {
      id: 'test_player_2',
      nickname: 'JoinPlayer',
      age: 30,
      genre: 'Fantasy' as const,
      score: 0,
      titles: [],
      isHost: false,
      level: 1,
      experience: 0
    };

    const joinedRoom = await gameDatabase.joinRoom('TEST123', joinPlayer);
    console.log('✅ Player joined room:', joinedRoom);

    // Test story session
    const sessionId = await gameDatabase.startGameSession(room.id, 5);
    console.log('✅ Story session started:', sessionId);

    // Test story stage
    const testStage = {
      stage: 1,
      description: 'You enter a mysterious forest...',
      choices: [
        { id: 1, text: 'Go left', dc: 12 },
        { id: 2, text: 'Go right', dc: 15 }
      ]
    };

    await gameDatabase.recordStoryStage(sessionId, testStage);
    console.log('✅ Story stage recorded');

    // Test message
    const testMessage = {
      id: 'test_msg_1',
      type: 'player' as const,
      sender: 'TestPlayer',
      content: 'I choose to go left!',
      timestamp: new Date(),
      diceRoll: 15
    };

    await gameDatabase.addGameMessage(room.id, testMessage);
    console.log('✅ Message added');

    // Test achievement
    await gameDatabase.unlockAchievement(testPlayer.id, {
      id: 'test_achievement',
      name: 'Test Achievement',
      description: 'This is a test achievement',
      icon: '🏆',
      points: 100,
      category: 'story' as const
    });
    console.log('✅ Achievement unlocked');

    // Test inventory item
    await gameDatabase.addInventoryItem(testPlayer.id, {
      id: 'test_item',
      name: 'Magic Sword',
      description: 'A powerful magical weapon',
      type: 'weapon' as const,
      rarity: 'rare' as const,
      value: 500,
      weight: 3.5,
      quantity: 1,
      effects: []
    });
    console.log('✅ Inventory item added');

    // Test statistics
    const roomStats = await gameDatabase.getRoomStatistics(room.id);
    console.log('✅ Room statistics:', roomStats);

    const playerStats = await gameDatabase.getPlayerStatistics(testPlayer.id);
    console.log('✅ Player statistics:', playerStats);

    console.log('🎉 All database tests passed!');
    
    return {
      success: true,
      room,
      joinedRoom,
      sessionId,
      roomStats,
      playerStats
    };

  } catch (error) {
    console.error('❌ Database test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Export for use in browser console
(window as any).testDatabase = testDatabase;
