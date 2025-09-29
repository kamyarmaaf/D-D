import React, { useState, useRef, useEffect } from 'react';
import { Send, Dice6, MessageCircle, Zap, Target, CheckCircle, Package, Trophy, User, Hash, Volume2, VolumeX } from 'lucide-react';
import { useGameSocket } from '../hooks/useGameSocket';
import { useLanguage } from '../hooks/useLanguage';
import { useAudioStory } from '../hooks/useAudioStory';
import { DiceRoll } from './DiceRoll';
import { ModernDice } from './ModernDice';
import { Genre, Character } from '../types/game';

interface GamePageProps {
  roomCode: string;
  nickname: string;
  genre: Genre;
  character?: Character | null;
  onShowInventory?: () => void;
  onShowAchievements?: () => void;
}

export const GamePage: React.FC<GamePageProps> = ({ 
  roomCode, 
  nickname, 
  genre, 
  character, 
  onShowInventory, 
  onShowAchievements 
}) => {
  const [message, setMessage] = useState('');
  const [isRolling, setIsRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showTTSControls, setShowTTSControls] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, gameState, currentStage, isConnected, sendMessage, rollDice, makeChoice, rollChoiceDice, audioStory, voicePlayback, smartAudio } = useGameSocket(roomCode, genre);
  const { t } = useLanguage();
  
  // TTS functionality for story narration
  const storyText = currentStage?.description || '';
  const {
    isPlaying: isTTSPlaying,
    isLoading: isTTSLoading,
    isEnabled: isTTSEnabled,
    play: playTTS,
    pause: pauseTTS,
    stop: stopTTS,
    toggleEnabled: toggleTTS
  } = useAudioStory(storyText, () => {
    console.log('Story audio completed');
  }, (error) => {
    console.error('TTS Error:', error);
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // Send the message to the game
    sendMessage(message);
    
    // Clear the input field
    setMessage('');
  };

  const handleRollDice = () => {
    // Only allow dice roll if there's no pending choice or waiting for dice roll
    if (gameState?.pendingChoice || gameState?.waitingForDiceRoll) {
      return;
    }
    
    setIsRolling(true);
    const roll = rollDice();
    setLastRoll(roll);
    setShowResult(true);
    
    setTimeout(() => {
      setIsRolling(false);
      setTimeout(() => {
        setShowResult(false);
        setLastRoll(null);
      }, 2000);
    }, 1000);
  };

  const handleChoiceDiceRoll = () => {
    if (!gameState?.waitingForDiceRoll) return;
    setIsRolling(true);
    const roll = rollChoiceDice();
    setLastRoll(roll);
    setShowResult(true);
    
    setTimeout(() => {
      setIsRolling(false);
      setTimeout(() => {
        setShowResult(false);
        setLastRoll(null);
      }, 2000);
    }, 1000);
  };
  const handleMakeChoice = (choiceId: number) => {
    makeChoice(choiceId);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'ai':
        return <Zap className="h-4 w-4 text-pink-400" />;
      case 'action':
        return <Dice6 className="h-4 w-4 text-yellow-300" />;
      case 'system':
        return <MessageCircle className="h-4 w-4 text-cyan-400" />;
      default:
        return <MessageCircle className="h-4 w-4 text-white/60" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col px-2 sm:px-4">
      {/* Room Header */}
            <div className="glass-card p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 lg:mb-10 ancient-scroll">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center space-x-3 sm:space-x-6">
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500/60 to-yellow-600/60 rounded-xl flex items-center justify-center">
                <Hash className="h-5 w-5 sm:h-6 sm:w-6 text-ink drop-shadow-lg" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-xl blur-sm -z-10"></div>
            </div>
            <div>
                    <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold gradient-text">{t('game.chapter')}: {roomCode}</h2>
                    <p className="text-sm sm:text-base lg:text-lg text-ink">{t('game.adventurer')}: <span className="font-semibold text-ink">{nickname}</span></p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-amber-500 animate-pulse' : 'bg-red-400'}`}></div>
                   <span className="text-sm font-medium text-ink-muted">
                     {isConnected ? t('game.connected') : t('game.connecting')}
                   </span>
            <div className="w-px h-6 bg-purple-500/30"></div>
                    <div className="text-sm text-ink-muted">
                      {t('game.tale')}: <span className="font-semibold text-ink capitalize">{genre}</span>
                    </div>
          </div>
          
          {/* Character Info & Quick Actions */}
          {character && (
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="text-xl sm:text-2xl">{character.avatar}</div>
                <div>
                  <div className="text-base sm:text-lg font-bold text-ink">{character.name}</div>
                         <div className="text-xs sm:text-sm text-ink-muted">
                           Level {character.level} {character.class.name} {character.race.name}
                         </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {/* TTS Controls */}
                <button
                  onClick={toggleTTS}
                  className={`group flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 lg:px-5 py-2 sm:py-3 rounded-xl transition-all duration-300 ${
                    isTTSEnabled 
                      ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/30 hover:to-indigo-600/30 border border-purple-500/30 text-ink-muted hover:text-ink'
                      : 'bg-gradient-to-r from-gray-600/20 to-gray-600/20 hover:from-gray-600/30 hover:to-gray-600/30 border border-gray-500/30 text-ink-muted hover:text-ink'
                  }`}
                  title={isTTSEnabled ? 'Disable Audio Narration' : 'Enable Audio Narration'}
                >
                  {isTTSEnabled ? (
                    <Volume2 className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                  ) : (
                    <VolumeX className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                  )}
                  <span className="text-xs sm:text-sm font-medium">
                    {isTTSEnabled ? 'Audio On' : 'Audio Off'}
                  </span>
                </button>

                {isTTSEnabled && storyText && (
                  <button
                    onClick={isTTSPlaying ? pauseTTS : playTTS}
                    disabled={isTTSLoading}
                    className="group flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 lg:px-5 py-2 sm:py-3 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/30 hover:to-indigo-600/30 border border-purple-500/30 rounded-xl text-ink-muted hover:text-ink transition-all duration-300 disabled:opacity-50"
                    title={isTTSPlaying ? 'Pause Audio' : 'Play Audio'}
                  >
                    {isTTSLoading ? (
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : isTTSPlaying ? (
                      <VolumeX className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                    ) : (
                      <Volume2 className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                    )}
                    <span className="text-xs sm:text-sm font-medium">
                      {isTTSLoading ? 'Loading...' : isTTSPlaying ? 'Pause' : 'Play'}
                    </span>
                  </button>
                )}

                {/* Voice Playback Controls */}
                <button
                  onClick={voicePlayback.toggleEnabled}
                  className="group flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 lg:px-5 py-2 sm:py-3 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 hover:from-blue-600/30 hover:to-cyan-600/30 border border-blue-500/30 rounded-xl text-ink-muted hover:text-ink transition-all duration-300"
                  title={voicePlayback.isEnabled ? 'Disable Voice Files' : 'Enable Voice Files'}
                >
                  {voicePlayback.isEnabled ? (
                    <Volume2 className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                  ) : (
                    <VolumeX className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                  )}
                  <span className="text-xs sm:text-sm font-medium">
                    {voicePlayback.isEnabled ? 'Voice On' : 'Voice Off'}
                  </span>
                </button>

                {voicePlayback.isEnabled && voicePlayback.currentVoiceFile && (
                  <button
                    onClick={voicePlayback.isPlaying ? voicePlayback.pause : voicePlayback.play}
                    disabled={voicePlayback.isLoading}
                    className="group flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 lg:px-5 py-2 sm:py-3 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 hover:from-blue-600/30 hover:to-cyan-600/30 border border-blue-500/30 rounded-xl text-ink-muted hover:text-ink transition-all duration-300 disabled:opacity-50"
                    title={voicePlayback.isPlaying ? 'Pause Voice' : 'Play Voice'}
                  >
                    {voicePlayback.isLoading ? (
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : voicePlayback.isPlaying ? (
                      <VolumeX className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                    ) : (
                      <Volume2 className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                    )}
                    <span className="text-xs sm:text-sm font-medium">
                      {voicePlayback.isLoading ? 'Loading...' : voicePlayback.isPlaying ? 'Pause' : 'Play'}
                    </span>
                  </button>
                )}

                {/* Smart Audio Controls - Combined Voice + TTS */}
                <button
                  onClick={smartAudio.toggleEnabled}
                  className="group flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 lg:px-5 py-2 sm:py-3 bg-gradient-to-r from-green-600/20 to-emerald-600/20 hover:from-green-600/30 hover:to-emerald-600/30 border border-green-500/30 rounded-xl text-ink-muted hover:text-ink transition-all duration-300"
                  title={smartAudio.isEnabled ? 'Disable Smart Audio' : 'Enable Smart Audio'}
                >
                  {smartAudio.isEnabled ? (
                    <Volume2 className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                  ) : (
                    <VolumeX className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                  )}
                  <span className="text-xs sm:text-sm font-medium">
                    {smartAudio.isEnabled ? 'Smart Audio On' : 'Smart Audio Off'}
                  </span>
                </button>

                {smartAudio.isEnabled && (
                  <button
                    onClick={smartAudio.isPlaying ? smartAudio.pause : smartAudio.play}
                    disabled={smartAudio.isLoading}
                    className="group flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 lg:px-5 py-2 sm:py-3 bg-gradient-to-r from-green-600/20 to-emerald-600/20 hover:from-green-600/30 hover:to-emerald-600/30 border border-green-500/30 rounded-xl text-ink-muted hover:text-ink transition-all duration-300 disabled:opacity-50"
                    title={smartAudio.isPlaying ? 'Pause Smart Audio' : 'Play Smart Audio'}
                  >
                    {smartAudio.isLoading ? (
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : smartAudio.isPlaying ? (
                      <VolumeX className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                    ) : (
                      <Volume2 className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                    )}
                    <span className="text-xs sm:text-sm font-medium">
                      {smartAudio.isLoading ? 'Loading...' : smartAudio.isPlaying ? 'Pause' : 'Play'}
                    </span>
                  </button>
                )}

                {smartAudio.isEnabled && (
                  <div className="flex space-x-1">
                    <button
                      onClick={smartAudio.switchToVoice}
                      className={`px-2 py-1 text-xs rounded ${
                        smartAudio.currentAudioType === 'voice' 
                          ? 'bg-green-600/30 text-green-300' 
                          : 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/30'
                      }`}
                      title="Switch to Voice Files"
                    >
                      Voice
                    </button>
                    <button
                      onClick={smartAudio.switchToTTS}
                      className={`px-2 py-1 text-xs rounded ${
                        smartAudio.currentAudioType === 'tts' 
                          ? 'bg-green-600/30 text-green-300' 
                          : 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/30'
                      }`}
                      title="Switch to TTS"
                    >
                      TTS
                    </button>
                  </div>
                )}

                <button
                  onClick={onShowInventory}
                  className="group flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 lg:px-5 py-2 sm:py-3 bg-gradient-to-r from-amber-600/20 to-yellow-600/20 hover:from-amber-600/30 hover:to-yellow-600/30 border border-amber-500/30 rounded-xl text-ink-muted hover:text-ink transition-all duration-300"
                >
                  <Package className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                         <span className="text-xs sm:text-sm font-medium">{t('game.inventory')}</span>
                </button>
                
                <button
                  onClick={onShowAchievements}
                  className="group flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 lg:px-5 py-2 sm:py-3 bg-gradient-to-r from-amber-600/20 to-yellow-600/20 hover:from-amber-600/30 hover:to-yellow-600/30 border border-amber-500/30 rounded-xl text-ink-muted hover:text-ink transition-all duration-300"
                >
                  <Trophy className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                         <span className="text-xs sm:text-sm font-medium">{t('game.achievements')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Game Info */}
      {gameState && (
            <div className="glass-card p-8 mb-10 ancient-scroll bg-gradient-to-r from-amber-50/80 to-yellow-50/80">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="relative inline-block mb-3">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500/30 to-yellow-500/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-white drop-shadow-lg">{gameState.currentStage}</span>
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
                    <h3 className="text-ink text-sm font-semibold mb-1">{t('game.stage')}</h3>
                    <p className="text-ink text-lg font-bold">{gameState.currentStage}/{gameState.maxStages}</p>
            </div>
            <div className="text-center group">
              <div className="relative inline-block mb-3">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500/30 to-yellow-500/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <div className={`w-6 h-6 rounded-full ${gameState.isGameActive ? 'bg-amber-500 animate-pulse' : 'bg-red-400'}`}></div>
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
                    <h3 className="text-ink text-sm font-semibold mb-1">{t('game.status')}</h3>
              <p className="text-ink text-lg font-bold">
                {gameState.isGameActive ? t('game.active') : t('game.finished')}
              </p>
            </div>
            <div className="text-center group">
              <div className="relative inline-block mb-3">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500/30 to-yellow-500/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-6 w-6 text-ink-muted" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
                    <h3 className="text-ink text-sm font-semibold mb-1">{t('game.action')}</h3>
              <p className="text-ink text-lg font-bold">
                {gameState.pendingChoice ? t('game.choose') : gameState.waitingForDiceRoll ? t('game.rollDiceAction') : t('game.ready')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 glass-card flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500/30 to-yellow-500/30 rounded-xl flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-ink-muted" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-xl blur-sm -z-10"></div>
            </div>
                   <div>
                     <h3 className="text-xl font-bold text-ink">{t('game.adventureLog')}</h3>
                     <p className="text-sm text-ink-muted">{t('game.followJourney')}</p>
                   </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 max-h-96">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`group flex items-start space-x-4 ${
                msg.type === 'ai' ? 'glass-card p-4 border-purple-500/20' : ''
              }`}
            >
              <div className="flex-shrink-0 mt-1">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  msg.type === 'ai' ? 'bg-gradient-to-br from-amber-500/30 to-yellow-500/30' :
                  msg.type === 'system' ? 'bg-gradient-to-br from-amber-500/30 to-yellow-500/30' :
                  'bg-gradient-to-br from-amber-500/30 to-yellow-500/30'
                }`}>
                  {getMessageIcon(msg.type)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                         <span className={`text-sm font-semibold ${
                           msg.type === 'ai' ? 'text-ink-muted' :
                           msg.type === 'system' ? 'text-ink-muted' :
                           'text-ink-muted'
                         }`}>
                    {msg.sender}
                  </span>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-ink-muted">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                    {msg.diceRoll && (
                             <span className="text-xs bg-gradient-to-r from-yellow-500/30 to-orange-500/30 text-ink px-3 py-1 rounded-full border border-yellow-400/50">
                               🎲 {msg.diceRoll}
                             </span>
                    )}
                  </div>
                </div>
                <p className="text-ink text-sm leading-relaxed group-hover:text-ink transition-colors">
                  {msg.content}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-white/10">
          {/* Dice Roll for Choice */}
          {gameState?.waitingForDiceRoll && gameState.selectedChoice && (
                   <div className="p-6 border-b border-white/20 bg-gradient-to-r from-yellow-500/20 to-orange-500/20">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <h4 className="text-2xl font-bold text-ink mb-2">🎯 {t('game.timeToRoll')}</h4>
                  <div className="absolute -inset-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl blur-lg"></div>
                </div>
                       <p className="text-ink mb-6 text-lg">
                         {t('game.rollToSucceed').replace('{dc}', gameState.selectedChoice.dc.toString())}
                       </p>
                <button
                  onClick={handleChoiceDiceRoll}
                  disabled={isRolling}
                  className="group relative bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-400 hover:via-orange-400 hover:to-red-400 text-white px-12 py-6 rounded-2xl font-bold text-xl shadow-2xl transform hover:scale-110 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <div className="relative flex items-center justify-center space-x-4">
                    <div className={`relative ${isRolling ? 'animate-bounce' : 'group-hover:animate-pulse'}`}>
                      <Dice6 className={`h-10 w-10 ${isRolling ? 'animate-spin' : 'group-hover:rotate-12'} transition-transform duration-300`} />
                      {!isRolling && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-300 rounded-full animate-ping"></div>
                      )}
                    </div>
                           <span className="text-2xl font-black tracking-wide">
                             {isRolling ? t('game.rolling') : t('game.rollDiceButton')}
                           </span>
                  </div>
                </button>
                <div className="mt-4 flex justify-center space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${
                        isRolling 
                          ? 'bg-yellow-400 animate-pulse' 
                          : 'bg-yellow-600/50'
                      }`}
                      style={{ animationDelay: `${i * 0.1}s` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Choice Buttons */}
          {currentStage && gameState?.pendingChoice && (
            <div className="p-6 border-b border-white/10">
                     <div className="text-center mb-6">
                       <h4 className="text-2xl font-bold text-ink mb-2">{t('game.chooseAction')}</h4>
                       <p className="text-ink-muted">{t('game.selectOption')}</p>
                     </div>
              <div className="space-y-4">
                {currentStage.choices.map((choice, index) => (
                  <button
                    key={choice.id}
                    onClick={() => handleMakeChoice(choice.id)}
                    className="group w-full glass-card p-6 hover:scale-105 transition-all duration-300 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500/30 to-yellow-500/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Target className="h-6 w-6 text-ink-muted" />
                        </div>
                        <div>
                               <div className="text-sm font-semibold text-ink-muted mb-1">DC {choice.dc}</div>
                               <div className="text-sm text-ink-muted">{t('game.option')} {index + 1}</div>
                        </div>
                      </div>
                      <div className="flex-1 ml-6">
                        <p className="text-ink text-lg group-hover:text-ink transition-colors">
                          {choice.text}
                        </p>
                      </div>
                             <div className="text-amber-400 group-hover:text-amber-300 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Regular Input */}
          <div className="p-8">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-end space-y-6 lg:space-y-0 lg:space-x-6">
              <div className="flex-1">
                <div className="relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                           className="w-full px-4 py-4 bg-amber-50/80 border border-amber-300/50 rounded-xl text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 resize-none text-base backdrop-blur-sm"
                    placeholder={t('game.chatPlaceholder')}
                    rows={3}
                    maxLength={500}
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                <div className="mt-2 text-right">
                       <span className="text-xs text-ink-muted">{message.length}/500</span>
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleRollDice}
                  disabled={isRolling || gameState?.pendingChoice || gameState?.waitingForDiceRoll}
                         className="group relative bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 text-ink px-8 py-5 rounded-xl font-semibold hover:from-yellow-400 hover:via-orange-400 hover:to-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center space-x-2 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <Dice6 className={`h-5 w-5 ${isRolling ? 'animate-spin' : 'group-hover:rotate-12'} transition-transform duration-300`} />
                  <span className="text-base">{t('game.rollDice')}</span>
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                         className="group relative bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-ink px-8 py-5 rounded-xl font-semibold hover:from-amber-400 hover:via-yellow-400 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center space-x-2 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  <span className="text-base">{t('game.send')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Dice Roll */}
      <ModernDice
        isRolling={isRolling}
        result={lastRoll}
        onRollComplete={(result) => {
          // فقط نتیجه را ذخیره کنیم، ModernDice خودش نمایش را مدیریت می‌کند
          setLastRoll(result);
        }}
        diceType="d20"
        criticalHit={lastRoll === 20}
        criticalMiss={lastRoll === 1}
      />
    </div>
  );
};