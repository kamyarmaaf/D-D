import { useState, useEffect, useRef } from 'react';
import { Message, GameState, Genre, StoryStage as TStoryStage } from '../types/game';
import { useAudioStory } from './useAudioStory';
import { useVoicePlayback } from './useVoicePlayback';
import { useSmartAudio } from './useSmartAudio';
import { webhookService } from '../services/webhookService';
import { supabaseGameDatabase } from '../database/supabaseGameDatabase';
import { useEnhancedGameStore } from '../store/enhancedGameStore';

interface LocalStoryStage {
  stage: number;
  description: string;
  choices: Array<{
    id: number;
    text: string;
    dc: number;
  }>;
}

export const useGameSocket = (roomCode: string, genre: Genre = 'fantasy') => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentStage, setCurrentStage] = useState<LocalStoryStage | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentStoryText, setCurrentStoryText] = useState<string>('');
  const [isLoadingStory, setIsLoadingStory] = useState(false);
  const [stageHistory, setStageHistory] = useState<LocalStoryStage[]>([]);
  const sessionIdRef = useRef<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  
  const { expireRoom, currentRoom } = useEnhancedGameStore();

  // Debug: Log stage history changes
  useEffect(() => {
    console.log('Stage History Updated:', stageHistory);
  }, [stageHistory]);
  
  // Audio story hook for TTS integration
  const audioStory = useAudioStory(
    currentStoryText,
    () => {
      // Auto-progress after audio completes (if enabled)
      if (gameState?.autoProgressAudio) {
        handleAutoProgress();
      }
    },
    (error) => {
      console.error('Audio story error:', error);
      // Continue with text-only mode on error
      if (gameState?.autoProgressAudio) {
        handleAutoProgress();
      }
    }
  );

  // Voice playback hook for playing voice files
  const voicePlayback = useVoicePlayback(
    currentStoryText,
    genre,
    currentStage?.stage || 1,
    () => {
      // Auto-progress after voice completes (if enabled)
      if (gameState?.autoProgressAudio) {
        handleAutoProgress();
      }
    },
    (error) => {
      console.error('Voice playback error:', error);
      // Continue with text-only mode on error
      if (gameState?.autoProgressAudio) {
        handleAutoProgress();
      }
    }
  );

  // Smart audio hook that combines voice files and TTS
  const smartAudio = useSmartAudio(
    currentStoryText,
    genre,
    currentStage?.stage || 1,
    () => {
      // Auto-progress after audio completes (if enabled)
      if (gameState?.autoProgressAudio) {
        handleAutoProgress();
      }
    },
    (error) => {
      console.error('Smart audio error:', error);
      // Continue with text-only mode on error
      if (gameState?.autoProgressAudio) {
        handleAutoProgress();
      }
    }
  );

  // Auto-progress handler for seamless story flow
  const handleAutoProgress = () => {
    if (!currentStage || !gameState) return;
    
    // If there are choices, don't auto-progress
    if (currentStage.choices && currentStage.choices.length > 0) {
      return;
    }
    
    // Auto-progress to next stage or end game
    setTimeout(async () => {
      if (gameState.currentStage >= gameState.maxStages) {
        endGame(true);
      } else {
        const nextStage = gameState.currentStage + 1;
        setGameState(prev => prev ? { ...prev, currentStage: nextStage } : null);
        await startStage(nextStage, genre);
      }
    }, 2000);
  };

  useEffect(() => {
    // Simulate WebSocket connection
    const connect = () => {
      setIsConnected(true);

      // Simulate initial game state
      setGameState({
        currentTurn: 1,
        phase: 'playing',
        votes: {},
        scenarios: [
          "A mysterious fog rolls into the tavern as you hear distant howling...",
          "The ancient map glows suddenly, revealing a hidden passage beneath your feet...",
          "A cloaked figure approaches your table with an urgent whisper..."
        ],
        storyProgress: [],
        currentStage: 1,
        maxStages: 5,
        isGameActive: true,
        pendingChoice: false,
        autoProgressAudio: true // Enable auto-progress for audio
      });

      // Start the first stage
      setTimeout(async () => {
        await startStage(1, genre);
      }, 1000);
    };

    const timer = setTimeout(connect, 1000);

    return () => {
      clearTimeout(timer);
      if (socketRef.current) {
        socketRef.current.close();
      }
      // Cleanup audio on unmount
      audioStory.stop();
      voicePlayback.stop();
      smartAudio.stop();
    };
  }, [roomCode, genre]);

  const startStage = async (stageNumber: number, selectedGenre: Genre = genre) => {
    // Set loading state
    setIsLoadingStory(true);
    
    // Show loading message
    const loadingMessage: Message = {
      id: `loading-${Date.now()}`,
      type: 'system',
      sender: 'Game Master',
      content: 'در حال آماده‌سازی سرور و دریافت داستان...',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, loadingMessage]);

    // Always try to get story from n8n first with retry logic
    let retryCount = 0;
    const maxRetries = 5;
    const retryDelay = 3000; // 3 seconds
    const initialDelay = 2000; // 2 seconds initial delay for webhook activation

    while (retryCount < maxRetries) {
      try {
        // Add initial delay for first request to ensure webhook is ready
        if (retryCount === 0) {
          console.log('Waiting for webhook activation...');
          await new Promise(resolve => setTimeout(resolve, initialDelay));
        }
        
        console.log(`Requesting story from n8n for stage: ${stageNumber}, genre: ${selectedGenre}, roomCode: ${roomCode}, attempt: ${retryCount + 1}`);
        
        // For first stage, send 0 to n8n, otherwise send 1
        const n8nStage = stageNumber === 1 ? 0 : 1;
        
        const webhookResponse = await webhookService.sendStoryProgress(
          roomCode,
          selectedGenre,
          n8nStage,
          '', // Empty choice for story request
          '' // Empty dice for story request
        );

        console.log('Webhook response received:', webhookResponse);
        console.log('Response success:', webhookResponse.success);
        console.log('Response data exists:', !!webhookResponse.data);
        console.log('Attempt number:', retryCount + 1);
        console.log('Time since start:', Date.now() - loadingMessage.timestamp.getTime(), 'ms');

        if (webhookResponse.success && webhookResponse.data) {
          console.log('Raw n8n data:', webhookResponse.data);
          
          const n8nStory = webhookService.parseN8nResponse(webhookResponse.data);
          console.log('Parsed n8n story:', n8nStory);
          
          if (n8nStory) {
            // Remove loading message and set loading to false
            setMessages(prev => prev.filter(msg => !msg.id.startsWith('loading-')));
            setIsLoadingStory(false);
            
            // Use n8n story data
            const stage = {
              stage: n8nStory.stage,
              description: n8nStory.description,
              choices: n8nStory.choices
            };
            
            console.log('Setting stage from n8n:', stage);
            
            setCurrentStage(stage);
            setCurrentStoryText(stage.description);
            // Start Supabase game session on first stage
            if (!sessionIdRef.current && currentRoom?.id) {
              try {
                const totalStages = gameState?.maxStages || 5;
                const sid = await supabaseGameDatabase.startGameSession(currentRoom.id, totalStages);
                sessionIdRef.current = sid;
              } catch (e) {
                console.warn('Failed to start game session:', e);
              }
            }

            // Check for stage completion achievements
            if (currentPlayer?.id) {
              try {
                const unlockedAchievements = await supabaseGameDatabase.checkAndUnlockAchievements(
                  currentPlayer.id,
                  'stage_complete',
                  { stage: stageNumber },
                  currentPlayer.score || 0,
                  currentPlayer.level || 1,
                  stageHistory.length + 1,
                  0 // completedGames - we'll track this separately
                );

                // Show achievement notifications
                if (unlockedAchievements.length > 0) {
                  unlockedAchievements.forEach(achievement => {
                    const achievementMessage: Message = {
                      id: `achievement-${achievement.id}-${Date.now()}`,
                      type: 'system',
                      sender: 'Achievement System',
                      content: `🎉 Achievement Unlocked: ${achievement.icon} ${achievement.name}\n${achievement.description}\n+${achievement.points} points!`,
                      timestamp: new Date()
                    };
                    setMessages(prev => [...prev, achievementMessage]);
                  });
                }
              } catch (e) {
                console.warn('Failed to check stage achievements:', e);
              }
            }
            
            // Add stage to history
            setStageHistory(prev => [...prev, stage]);

            const stageMessage: Message = {
              id: `stage-${stageNumber}`,
              type: 'system',
              sender: 'Game Master',
              content: `Stage ${stageNumber}:\n${stage.description}\n\n${stage.choices.map((choice: any, index: number) =>
                `- Option ${index + 1}: ${choice.text} → DC ${choice.dc}`
              ).join('\n')}`,
              timestamp: new Date()
            };

            setMessages(prev => [...prev, stageMessage]);
            
            // Check for game end
            if (n8nStory.isGameOver && n8nStory.gameEnd) {
              console.log('Game ended:', n8nStory.gameEnd);
              setGameState(prev => prev ? { 
                ...prev, 
                phase: 'finished',
                isGameActive: false,
                pendingChoice: false,
                gameEnd: n8nStory.gameEnd
              } : null);
              
              // Expire the room when game ends
              if (currentRoom?.id) {
                expireRoom(currentRoom.id).catch(error => {
                  console.error('Failed to expire room:', error);
                });
              }
            } else {
              setGameState(prev => prev ? { ...prev, pendingChoice: true } : null);
            }
            console.log('n8n story successfully set');
            return; // Success! Exit the function
          } else {
            console.log('n8nStory parsing returned null');
          }
        } else {
          console.log('Webhook response not successful or no data:', webhookResponse.success, !!webhookResponse.data);
          console.log('Response message:', webhookResponse.message);
          
          // Check if it's a webhook not registered error
          if (webhookResponse.message && webhookResponse.message.includes('not registered')) {
            console.log('N8N webhook is not active. Please activate it in n8n canvas.');
          }
        }
      } catch (error) {
        console.error(`Failed to get story from n8n (attempt ${retryCount + 1}):`, error);
      }

      retryCount++;
      
      if (retryCount < maxRetries) {
        console.log(`Retrying in ${retryDelay}ms... (${retryCount}/${maxRetries})`);
        // Update loading message
        setMessages(prev => prev.map(msg => 
          msg.id.startsWith('loading-') 
            ? { ...msg, content: `در حال دریافت داستان از سرور... (تلاش ${retryCount + 1}/${maxRetries})` }
            : msg
        ));
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }

    // If we get here, all retries failed
    console.error('All retry attempts failed');
    
    // Remove loading message and set loading to false
    setMessages(prev => prev.filter(msg => !msg.id.startsWith('loading-')));
    setIsLoadingStory(false);
    
    // Show error message to user
    const errorMessage: Message = {
      id: `error-${Date.now()}`,
      type: 'system',
      sender: 'Game Master',
      content: 'خطا در دریافت داستان از سرور پس از چندین تلاش.\n\nلطفاً:\n1. n8n workflow را در canvas فعال کنید\n2. یا صفحه را refresh کنید',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, errorMessage]);
    
    // Set game state to inactive
    setGameState(prev => prev ? { ...prev, isGameActive: false, pendingChoice: false } : null);
  };

  const makeChoice = async (choiceId: number) => {
    if (!currentStage || !gameState) return;

    const choice = currentStage.choices.find((c: any) => c.id === choiceId);
    if (!choice) return;

    // Player choice message
    const choiceMessage: Message = {
      id: `choice-${Date.now()}`,
      type: 'action',
      sender: 'You',
      content: `You chose: ${choice.text}`,
      timestamp: new Date()
    };

            setMessages(prev => [...prev, choiceMessage]);
            try {
              await supabaseGameDatabase.addGameMessage?.(currentRoom?.id || '', choiceMessage as any);
            } catch {}

    // Set game state to waiting for dice roll
    setGameState(prev => prev ? {
      ...prev,
      pendingChoice: false,
      waitingForDiceRoll: true,
      selectedChoice: { choiceId, choiceText: choice.text, dc: choice.dc }
    } : null);
  };

  const rollChoiceDice = async () => {
    if (!gameState?.waitingForDiceRoll || !gameState.selectedChoice) return 0;

    const diceRoll = Math.floor(Math.random() * 20) + 1;
    const success = diceRoll >= gameState.selectedChoice.dc;

    // Check for dice roll achievements
    if (currentPlayer?.id) {
      try {
        const unlockedAchievements = await supabaseGameDatabase.checkAndUnlockAchievements(
          currentPlayer.id,
          'dice_roll',
          { roll: diceRoll, dc: gameState.selectedChoice.dc },
          currentPlayer.score || 0,
          currentPlayer.level || 1,
          stageHistory.length + 1,
          0 // completedGames - we'll track this separately
        );

        // Show achievement notifications
        if (unlockedAchievements.length > 0) {
          unlockedAchievements.forEach(achievement => {
            const achievementMessage: Message = {
              id: `achievement-${achievement.id}-${Date.now()}`,
              type: 'system',
              sender: 'Achievement System',
              content: `🎉 Achievement Unlocked: ${achievement.icon} ${achievement.name}\n${achievement.description}\n+${achievement.points} points!`,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, achievementMessage]);
          });
        }
      } catch (e) {
        console.warn('Failed to check achievements:', e);
      }
    }

    // Set loading state for n8n request
    setIsLoadingStory(true);
    
    // Show loading message
    const loadingMessage: Message = {
      id: `loading-${Date.now()}`,
      type: 'system',
      sender: 'Game Master',
      content: 'در حال ارسال نتیجه به سرور و دریافت پاسخ...',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, loadingMessage]);

    // Send webhook request for dice roll with retry logic
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    while (retryCount < maxRetries) {
      try {
        console.log(`Sending choice and dice to n8n: choice=${gameState.selectedChoice.choiceId}, dice=${diceRoll}, stage=${gameState.currentStage}, attempt: ${retryCount + 1}`);
        
        const webhookResponse = await webhookService.sendStoryProgress(
          roomCode,
          genre,
          gameState.currentStage,
          `${gameState.selectedChoice.dc}\n${gameState.selectedChoice.choiceText}`,
          diceRoll.toString() // user_dice is the dice roll result
        );
        
        console.log('Choice and dice webhook response:', webhookResponse);
        
        if (webhookResponse.success && webhookResponse.data) {
          console.log('Choice and dice webhook sent successfully:', webhookResponse.data);
          
          // Parse n8n response for next stage
          const n8nStory = webhookService.parseN8nResponse(webhookResponse.data);
          console.log('Parsed n8n story from choice result:', n8nStory);
          
          if (n8nStory) {
            // Remove loading message
            setMessages(prev => prev.filter(msg => !msg.id.startsWith('loading-')));
            setIsLoadingStory(false);
            
            // Add dice roll message
            const diceMessage: Message = {
              id: `dice-${Date.now()}`,
              type: 'action',
              sender: 'You',
              content: `🎲 You rolled: ${diceRoll} (needed: ${gameState.selectedChoice.dc})`,
              timestamp: new Date(),
              diceRoll
            };
            setMessages(prev => [...prev, diceMessage]);
            try {
              await supabaseGameDatabase.addGameMessage?.(currentRoom?.id || '', diceMessage as any);
            } catch {}

            // Add result message from n8n
            const resultMessage: Message = {
              id: `result-${Date.now()}`,
              type: 'ai',
              sender: 'Game Master',
              content: n8nStory.description,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, resultMessage]);
            // Persist important messages
            try {
              await supabaseGameDatabase.addGameMessage?.(currentRoom?.id || '', resultMessage as any);
            } catch {}

            // Set new stage from n8n response
            const newStage = {
              stage: n8nStory.stage,
              description: n8nStory.description,
              choices: n8nStory.choices
            };
            
            setCurrentStage(newStage);
            setCurrentStoryText(newStage.description);
            // Persist stage info
            try {
              await supabaseGameDatabase.recordStoryStage?.(sessionIdRef.current || '', newStage as unknown as TStoryStage);
            } catch {}
            
            // Add new stage to history
            setStageHistory(prev => [...prev, newStage]);

            // Add stage message
            const stageMessage: Message = {
              id: `stage-${n8nStory.stage}`,
              type: 'system',
              sender: 'Game Master',
              content: `Stage ${n8nStory.stage}:\n${newStage.description}\n\n${newStage.choices.map((choice: any, index: number) =>
                `- Option ${index + 1}: ${choice.text} → DC ${choice.dc}`
              ).join('\n')}`,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, stageMessage]);
            try {
              await supabaseGameDatabase.addGameMessage?.(currentRoom?.id || '', stageMessage as any);
            } catch {}

            // Update game state
            setGameState(prev => prev ? {
              ...prev,
              currentStage: n8nStory.stage,
              pendingChoice: true,
              waitingForDiceRoll: false,
              selectedChoice: undefined
            } : null);

            console.log('Successfully processed choice and dice result from n8n');
            return diceRoll; // Success! Exit the function
          } else {
            console.log('n8nStory parsing returned null for choice result');
          }
        } else {
          console.log('Choice and dice webhook response not successful:', webhookResponse.success, !!webhookResponse.data);
          console.log('Response message:', webhookResponse.message);
        }
      } catch (error) {
        console.error(`Failed to send choice and dice to n8n (attempt ${retryCount + 1}):`, error);
      }

      retryCount++;
      
      if (retryCount < maxRetries) {
        console.log(`Retrying choice and dice request in ${retryDelay}ms... (${retryCount}/${maxRetries})`);
        // Update loading message
        setMessages(prev => prev.map(msg => 
          msg.id.startsWith('loading-') 
            ? { ...msg, content: `در حال ارسال نتیجه به سرور... (تلاش ${retryCount + 1}/${maxRetries})` }
            : msg
        ));
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }

    // If we get here, all retries failed - fallback to local logic
    console.error('All retry attempts failed for choice and dice, using fallback logic');
    
    // Remove loading message
    setMessages(prev => prev.filter(msg => !msg.id.startsWith('loading-')));
    setIsLoadingStory(false);
    
    // Dice roll message
    const diceMessage: Message = {
      id: `dice-${Date.now()}`,
      type: 'action',
      sender: 'You',
      content: `🎲 You rolled: ${diceRoll} (needed: ${gameState.selectedChoice.dc})`,
      timestamp: new Date(),
      diceRoll
    };
    setMessages(prev => [...prev, diceMessage]);

    // Game Master response (fallback)
    setTimeout(() => {
      const resultMessage = generateStageResult(gameState.currentStage, gameState.selectedChoice!.choiceId, success, diceRoll);
      setMessages(prev => [...prev, resultMessage]);

      // Move to next stage or end game
      setTimeout(async () => {
        if (gameState.currentStage >= gameState.maxStages || !success && Math.random() < 0.3) {
          endGame(success);
        } else {
          const nextStage = gameState.currentStage + 1;
          setGameState(prev => prev ? { ...prev, currentStage: nextStage } : null);
          await startStage(nextStage, genre);
        }
      }, 2000);
    }, 1000);

    // Clear waiting state
    setGameState(prev => prev ? {
      ...prev,
      waitingForDiceRoll: false,
      selectedChoice: undefined
    } : null);

    return diceRoll;
  };

  const endGame = async (victory: boolean) => {
    const endMessage: Message = {
      id: `end-${Date.now()}`,
      type: 'system',
      sender: 'Game Master',
      content: victory
        ? '🎉 Congratulations! You have successfully completed the adventure and escaped the mysterious mansion alive!'
        : '💀 Unfortunately, your adventure has come to an end. But don\'t worry, heroes always get another chance!',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, endMessage]);

    // Check for game completion achievements
    if (currentPlayer?.id) {
      try {
        const unlockedAchievements = await supabaseGameDatabase.checkAndUnlockAchievements(
          currentPlayer.id,
          'game_complete',
          { victory, stagesCompleted: stageHistory.length },
          currentPlayer.score || 0,
          currentPlayer.level || 1,
          stageHistory.length,
          1 // completedGames - increment by 1
        );

        // Show achievement notifications
        if (unlockedAchievements.length > 0) {
          unlockedAchievements.forEach(achievement => {
            const achievementMessage: Message = {
              id: `achievement-${achievement.id}-${Date.now()}`,
              type: 'system',
              sender: 'Achievement System',
              content: `🎉 Achievement Unlocked: ${achievement.icon} ${achievement.name}\n${achievement.description}\n+${achievement.points} points!`,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, achievementMessage]);
          });
        }
      } catch (e) {
        console.warn('Failed to check game completion achievements:', e);
      }
    }

    try {
      await supabaseGameDatabase.addGameMessage?.(currentRoom?.id || '', endMessage as any);
    } catch {}
    setGameState(prev => prev ? { ...prev, isGameActive: false, pendingChoice: false } : null);
    setCurrentStage(null);
  };

  const sendMessage = (content: string, diceRoll?: number) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: diceRoll ? 'action' : 'player',
      sender: 'You',
      content,
      timestamp: new Date(),
      diceRoll
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(content, diceRoll);
      setMessages(prev => [...prev, aiResponse]);
    }, 1500);
  };


  const rollDice = () => {
    if (gameState?.pendingChoice || gameState?.waitingForDiceRoll) {
      // If there's a pending choice or waiting for dice roll, don't allow free dice rolls
      return 0;
    }

    const roll = Math.floor(Math.random() * 20) + 1;
    const message = `🎲 You rolled a ${roll}!`;

    sendMessage(message, roll);
    return roll;
  };

  return {
    messages,
    gameState,
    currentStage,
    isConnected,
    isLoadingStory,
    stageHistory,
    sendMessage,
    rollDice,
    makeChoice,
    rollChoiceDice,
    audioStory, // Include TTS audio controls
    voicePlayback, // Include voice file playback controls
    smartAudio // Include smart audio controls (voice + TTS)
  };
};


const generateStageResult = (stage: number, choiceId: number, success: boolean, diceRoll: number): Message => {
  const results: Record<string, Record<number, { success: string; failure: string }>> = {
    '1': {
      1: {
        success: `🎲 ${diceRoll} - Success! You climbed the spiral stairs with firm steps. The old wizard welcomed you with a smile and said: "Brave young one, you are worthy of magical knowledge." A golden light enveloped you, and you felt new power flowing through your being.`,
        failure: `🎲 ${diceRoll} - Failure! The stairs suddenly started moving and you fell. A demonic laugh echoed in the air: "You're not ready yet!" But fortunately, you survived and have another chance.`
      },
      2: {
        success: `🎲 ${diceRoll} - Success! You bravely entered the dungeon and saw the sleeping dragon. He respectfully raised his head and said: "I've been waiting for someone like you for years. Take this treasure." He gave you a chest full of glowing jewels.`,
        failure: `🎲 ${diceRoll} - Failure! The dragon woke up and became angry. Fire came out of his mouth, but fortunately, you escaped quickly. "Come back when you're braver!" his voice echoed in the tunnel.`
      }
    },
    '2': {
      1: {
        success: `🎲 ${diceRoll} - Excellent! You chanted a powerful spell that amazed the wizard. "You truly have talent!" He gave you an ancient magical book. "This book will help you in future adventures."`,
        failure: `🎲 ${diceRoll} - Oops! Your spell didn't work, and instead, your hair turned purple! The wizard laughed: "Don't worry, you'll get better with practice. But for now, you'll have to continue with these purple hair!"`
      },
      2: {
        success: `🎲 ${diceRoll} - Clever! You solved the complex riddle. The wizard said with admiration: "Your mind is as sharp as a blade!" He gave you a map of the castle that shows secret passages.`,
        failure: `🎲 ${diceRoll} - Unfortunately! You gave the wrong answer and the wizard became upset. "You need to think more!" He sent you to the waiting room to think again.`
      }
    }
  };
  
  const stageResults = results[stage.toString()];
  const result = stageResults?.[choiceId] || {
    success: `🎲 ${diceRoll} - Success! It was a good choice and you're closer to your goal. The path ahead has become clearer.`,
    failure: `🎲 ${diceRoll} - Failure! Unfortunately, things didn't go according to plan, but there's still hope. Learn from this experience.`
  };
  
  return {
    id: `result-${Date.now()}`,
    type: 'ai',
    sender: 'Game Master',
    content: success ? result.success : result.failure,
    timestamp: new Date()
  };
};

const generateAIResponse = (_playerAction: string, diceRoll?: number): Message => {
  const responses = [
    "The shadows seem to whisper secrets as you move forward cautiously...",
    "Your bold action has caught the attention of creatures around you who look at you with curiosity...",
    "The ancient magic in the air responds to your presence and creates unexpected waves...",
    "A roar from afar echoes in the room as your actions set events in motion..."
  ];

  let content = responses[Math.floor(Math.random() * responses.length)];
  
  if (diceRoll) {
    if (diceRoll >= 15) {
      content += " Your exceptional skill guides you toward success!";
    } else if (diceRoll >= 10) {
      content += " With effort, you succeeded in reaching your goal.";
    } else {
      content += " Despite your efforts, things didn't go as you had planned...";
    }
  }

  content += " What do you do now?";

  return {
    id: Date.now().toString() + '_ai',
    type: 'ai',
    sender: 'Game Master',
    content,
    timestamp: new Date()
  };
};