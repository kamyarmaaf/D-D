import React, { useState } from 'react';
import { AudioControls } from './AudioControls';
import { useGameSocket } from '../hooks/useGameSocket';
import { useLanguage } from '../hooks/useLanguage';

interface AudioStoryIntegrationProps {
  roomCode: string;
  genre: string;
}

/**
 * Example component showing how to integrate audio narration with the game
 * This component demonstrates the complete TTS integration
 */
export const AudioStoryIntegration: React.FC<AudioStoryIntegrationProps> = ({
  roomCode,
  genre
}) => {
  const { t } = useLanguage();
  const [showAudioControls, setShowAudioControls] = useState(true);
  
  const {
    messages,
    gameState,
    currentStage,
    isConnected,
    audioStory
  } = useGameSocket(roomCode, genre as any);

  const handleStoryComplete = () => {
    console.log('Story audio completed, game will auto-progress');
    // The game automatically progresses via the useGameSocket hook
  };

  const handleAudioError = (error: string) => {
    console.error('Audio error:', error);
    // Game continues in text-only mode
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-300">{t('game.connecting')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Game Status */}
      <div className="mb-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
            {t('game.stage')} {gameState?.currentStage} / {gameState?.maxStages}
          </h2>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-300">
              {isConnected ? t('game.connected') : t('game.connecting')}
            </span>
          </div>
        </div>
        
        {/* Current Stage Description */}
        {currentStage && (
          <div className="mb-4 p-4 bg-gray-800/50 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">
              {t('game.stage')} {currentStage.stage}
            </h3>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {currentStage.description}
            </p>
          </div>
        )}

        {/* Audio Controls Toggle */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            {t('audio.settings')}
          </h3>
          <button
            onClick={() => setShowAudioControls(!showAudioControls)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            {showAudioControls ? 'Hide Audio Controls' : 'Show Audio Controls'}
          </button>
        </div>
      </div>

      {/* Audio Controls */}
      {showAudioControls && (
        <AudioControls
          storyText={currentStage?.description || ''}
          onStoryComplete={handleStoryComplete}
          onError={handleAudioError}
          className="mb-6"
        />
      )}

      {/* Story Choices */}
      {currentStage && currentStage.choices && currentStage.choices.length > 0 && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            {t('game.chooseAction')}
          </h3>
          <p className="text-gray-300 mb-4">
            {t('game.selectOption')}
          </p>
          
          <div className="space-y-3">
            {currentStage.choices.map((choice, index) => (
              <button
                key={choice.id}
                className="w-full p-4 text-left bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-600 hover:border-purple-500 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-purple-400 font-semibold">
                      {t('game.option')} {index + 1}:
                    </span>
                    <p className="text-gray-300 mt-1">{choice.text}</p>
                  </div>
                  <div className="text-sm text-amber-400">
                    DC {choice.dc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Log */}
      <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">
          {t('game.adventureLog')}
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-3 rounded-lg ${
                message.type === 'system' 
                  ? 'bg-blue-900/30 border border-blue-500/30' 
                  : message.type === 'action'
                  ? 'bg-green-900/30 border border-green-500/30'
                  : 'bg-gray-800/50 border border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-purple-400">
                  {message.sender}
                </span>
                <span className="text-xs text-gray-400">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <p className="text-gray-300 whitespace-pre-wrap">
                {message.content}
              </p>
              {message.diceRoll && (
                <div className="mt-2 text-sm text-amber-400">
                  🎲 Rolled: {message.diceRoll}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
