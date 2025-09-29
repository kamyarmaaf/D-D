import { useState, useEffect } from 'react';
import { useEnhancedGameStore } from '../store/enhancedGameStore';
import { StoryStage, StoryChoice, Message } from '../types/game';

export const useStoryDatabase = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    currentRoom,
    currentPlayer,
    addMessageToDatabase,
    recordStoryStage,
    recordStoryChoice,
    startGameSession,
    updateRoomStage,
    setGameActive
  } = useEnhancedGameStore();

  // Initialize story session when game starts
  const initializeStorySession = async (totalStages: number = 5) => {
    if (!currentRoom) {
      throw new Error('No current room');
    }

    setIsLoading(true);
    setError(null);

    try {
      const sessionId = await startGameSession(totalStages);
      await setGameActive(true);
      console.log('Story session initialized:', sessionId);
      return sessionId;
    } catch (error) {
      console.error('Failed to initialize story session:', error);
      setError('Failed to initialize story session');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Record a story stage progression
  const recordStageProgression = async (stage: StoryStage) => {
    if (!currentRoom) {
      throw new Error('No current room');
    }

    setIsLoading(true);
    setError(null);

    try {
      await recordStoryStage(stage);
      await updateRoomStage(stage.stage);
      
      // Add system message about stage progression
      const stageMessage: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'system',
        sender: 'Game Master',
        content: `Stage ${stage.stage} has begun!`,
        timestamp: new Date()
      };
      
      await addMessageToDatabase(stageMessage);
      
      console.log('Stage progression recorded:', stage);
    } catch (error) {
      console.error('Failed to record stage progression:', error);
      setError('Failed to record stage progression');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Record a player's choice and dice roll
  const recordPlayerChoice = async (
    choice: StoryChoice, 
    diceRoll?: number, 
    result?: 'success' | 'failure'
  ) => {
    if (!currentPlayer) {
      throw new Error('No current player');
    }

    setIsLoading(true);
    setError(null);

    try {
      await recordStoryChoice(choice, diceRoll, result);
      
      // Add player message about their choice
      const choiceMessage: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'player',
        sender: currentPlayer.nickname,
        content: `Chose: ${choice.text}${diceRoll ? ` (Rolled: ${diceRoll})` : ''}${result ? ` - ${result.toUpperCase()}` : ''}`,
        timestamp: new Date(),
        diceRoll
      };
      
      await addMessageToDatabase(choiceMessage);
      
      console.log('Player choice recorded:', { choice, diceRoll, result });
    } catch (error) {
      console.error('Failed to record player choice:', error);
      setError('Failed to record player choice');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Record AI/GM response
  const recordAIResponse = async (content: string, diceRoll?: number) => {
    if (!currentRoom) {
      throw new Error('No current room');
    }

    setIsLoading(true);
    setError(null);

    try {
      const aiMessage: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'ai',
        sender: 'Game Master',
        content,
        timestamp: new Date(),
        diceRoll
      };
      
      await addMessageToDatabase(aiMessage);
      
      console.log('AI response recorded:', content);
    } catch (error) {
      console.error('Failed to record AI response:', error);
      setError('Failed to record AI response');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Record system event
  const recordSystemEvent = async (content: string) => {
    if (!currentRoom) {
      throw new Error('No current room');
    }

    setIsLoading(true);
    setError(null);

    try {
      const systemMessage: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'system',
        sender: 'System',
        content,
        timestamp: new Date()
      };
      
      await addMessageToDatabase(systemMessage);
      
      console.log('System event recorded:', content);
    } catch (error) {
      console.error('Failed to record system event:', error);
      setError('Failed to record system event');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Record action (dice roll, combat, etc.)
  const recordAction = async (content: string, diceRoll?: number) => {
    if (!currentRoom) {
      throw new Error('No current room');
    }

    setIsLoading(true);
    setError(null);

    try {
      const actionMessage: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'action',
        sender: currentPlayer?.nickname || 'Player',
        content,
        timestamp: new Date(),
        diceRoll
      };
      
      await addMessageToDatabase(actionMessage);
      
      console.log('Action recorded:', { content, diceRoll });
    } catch (error) {
      console.error('Failed to record action:', error);
      setError('Failed to record action');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Complete a story stage
  const completeStage = async (stageNumber: number) => {
    if (!currentRoom) {
      throw new Error('No current room');
    }

    setIsLoading(true);
    setError(null);

    try {
      await recordSystemEvent(`Stage ${stageNumber} completed!`);
      
      if (stageNumber < (currentRoom.maxStages || 5)) {
        await recordSystemEvent(`Moving to stage ${stageNumber + 1}...`);
      } else {
        await recordSystemEvent('Congratulations! You have completed the adventure!');
        await setGameActive(false);
      }
      
      console.log('Stage completed:', stageNumber);
    } catch (error) {
      console.error('Failed to complete stage:', error);
      setError('Failed to complete stage');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get story statistics
  const getStoryStatistics = async () => {
    if (!currentRoom || !currentPlayer) {
      return null;
    }

    try {
      const roomStats = await useEnhancedGameStore.getState().getRoomStatistics();
      const playerStats = await useEnhancedGameStore.getState().getPlayerStatistics();
      
      return {
        room: roomStats,
        player: playerStats
      };
    } catch (error) {
      console.error('Failed to get story statistics:', error);
      return null;
    }
  };

  return {
    isLoading,
    error,
    initializeStorySession,
    recordStageProgression,
    recordPlayerChoice,
    recordAIResponse,
    recordSystemEvent,
    recordAction,
    completeStage,
    getStoryStatistics
  };
};
