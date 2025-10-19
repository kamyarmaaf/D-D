import React, { useState } from 'react';
import { Users, Plus, Hash, QrCode, Wand2, Clock, Search, Ghost, Smile, Rocket, Crown } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { QRCodeGenerator } from './QRCodeGenerator';
import InfoBanner from './InfoBanner';
import { Genre } from '../types/game';
import { useEnhancedGameStore } from '../store/enhancedGameStore';
import { webhookService } from '../services/webhookService';
import { LoadingOverlay } from './LoadingSpinner';

interface LobbyProps {
  onJoinRoom: (code: string, nickname: string, genre?: Genre) => void;
}

export const Lobby: React.FC<LobbyProps> = ({ onJoinRoom }) => {
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [createdRoomCode, setCreatedRoomCode] = useState('');
  const [showGenreSelection, setShowGenreSelection] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGenre, setIsLoadingGenre] = useState(false);
  const [selectedGenreId, setSelectedGenreId] = useState<Genre | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const {
    createRoom,
    joinRoom
  } = useEnhancedGameStore();


  const genres: { id: Genre; icon: React.ReactNode; color: string; name: string; description: string }[] = [
    { id: 'fantasy', icon: <Wand2 className="h-5 w-5 sm:h-6 sm:w-6" />, color: 'from-amber-500 to-yellow-600', name: 'Fantasy', description: 'Magic & Dragons' },
    { id: 'historical', icon: <Clock className="h-5 w-5 sm:h-6 sm:w-6" />, color: 'from-amber-600 to-orange-700', name: 'Historical', description: 'Ancient Times' },
    { id: 'mystery', icon: <Search className="h-5 w-5 sm:h-6 sm:w-6" />, color: 'from-slate-600 to-gray-700', name: 'Mystery', description: 'Dark Secrets' },
    { id: 'horror', icon: <Ghost className="h-5 w-5 sm:h-6 sm:w-6" />, color: 'from-red-600 to-rose-700', name: 'Horror', description: 'Terrifying Tales' },
    { id: 'comedy', icon: <Smile className="h-5 w-5 sm:h-6 sm:w-6" />, color: 'from-green-600 to-emerald-700', name: 'Comedy', description: 'Light Adventures' },
    { id: 'scifi', icon: <Rocket className="h-5 w-5 sm:h-6 sm:w-6" />, color: 'from-blue-600 to-cyan-700', name: 'Sci-Fi', description: 'Future Worlds' },
    { id: 'jenabkhan', icon: <Crown className="h-5 w-5 sm:h-6 sm:w-6" />, color: 'from-purple-600 to-violet-700', name: 'Jenabkhan', description: 'Persian Adventure' }
  ];

  const generateRoomCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    console.log('Generated room code:', code);
    return code;
  };

  const handleCreateRoom = async () => {
    if (!nickname.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const code = generateRoomCode();
      
      // Validate code
      if (!code || code.trim() === '') {
        throw new Error('Failed to generate room code');
      }
      
      // Create host player
      const hostPlayer = {
        id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        nickname: nickname.trim(),
        age: 25,
        genre: 'Fantasy' as const,
        score: 0,
        titles: [],
        isHost: true,
        level: 1,
        experience: 0
      };

      // Create room in database
      await createRoom(code, 'fantasy', hostPlayer);
      
      // Set the created room code for display
      setCreatedRoomCode(code);
    } catch (error) {
      console.error('Failed to create room:', error);
      setError('Failed to create room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenreSelect = async (genre: Genre) => {
    setIsLoadingGenre(true);
    setSelectedGenreId(genre);
    
    try {
      // Send webhook request for story start
      const webhookResponse = await webhookService.sendStoryStart(createdRoomCode, genre);
      if (webhookResponse.success) {
        console.log('Webhook request sent successfully:', webhookResponse.data);
      } else {
        console.warn('Webhook request failed:', webhookResponse.message);
      }
    } catch (error) {
      console.error('Failed to send webhook request:', error);
    }
    
    // Add a small delay to show the loading animation
    setTimeout(() => {
      onJoinRoom(createdRoomCode, nickname, genre);
    }, 2000);
  };

  const handleJoinRoom = async () => {
    if (!nickname.trim() || !roomCode.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Create player
      const player = {
        id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        nickname: nickname.trim(),
        email: (JSON.parse(localStorage.getItem('dnd_user') || 'null')?.email) || undefined,
        age: 25, // Default age, could be made configurable
        genre: 'Fantasy' as const,
        score: 0,
        titles: [],
        isHost: false,
        level: 1,
        experience: 0
      };

      // Join room
      const room = await joinRoom(roomCode.toUpperCase(), player);
      
      if (room) {
        onJoinRoom(roomCode.toUpperCase(), nickname, room.selectedGenre as Genre);
        console.log('Successfully joined room:', room);
      } else {
        setError('Room not found. Please check the room code.');
      }
    } catch (error) {
      console.error('Failed to join room:', error);
      setError('Failed to join room. Please check the room code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickStart = () => {
    if (createdRoomCode && nickname.trim()) {
      onJoinRoom(createdRoomCode, nickname, 'jenabkhan');
    }
  };

  const handleSelectGenre = () => {
    if (createdRoomCode && nickname.trim()) {
      setShowGenreSelection(true);
    }
  };

  // Show error if any
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-2 sm:px-0">
        <div className="text-center mb-6 sm:mb-8 lg:mb-10">
          <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-8 backdrop-blur-sm">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">خطا</h2>
            <p className="text-red-200 mb-6">{error}</p>
            <button
              onClick={() => setError(null)}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showGenreSelection && createdRoomCode) {
    return (
      <>
        <div className="max-w-4xl mx-auto px-2 sm:px-0">
          <div className="text-center mb-6 sm:mb-8 lg:mb-10">
            <h1 className="text-xl sm:text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              {t('lobby.selectGenre')}
            </h1>
            <p className="text-base sm:text-lg text-purple-200 px-4 mb-6">
              {t('lobby.genreDescription')}
            </p>
            <div className="flex items-center justify-center space-x-3 mb-6 sm:mb-8 lg:mb-10">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 px-4 py-2 rounded-xl border border-amber-400/30 backdrop-blur-sm">
                <Hash className="h-5 w-5 text-ink-muted drop-shadow-lg" />
                <span className="text-xl font-mono font-bold text-ink bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent tracking-wide">
                  {createdRoomCode}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => handleGenreSelect(genre.id)}
                disabled={isLoadingGenre}
                className={`bg-gradient-to-br ${genre.color}/40 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all transform hover:scale-105 active:scale-95 text-center group relative overflow-hidden ${
                  isLoadingGenre ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                  selectedGenreId === genre.id && isLoadingGenre ? 'ring-2 ring-amber-400 ring-opacity-50 animate-pulse' : ''
                } ${
                  isLoadingGenre && selectedGenreId !== genre.id ? 'animate-pulse' : ''
                }`}
              >
                {/* Ripple effect on click */}
                <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-active:opacity-100 transition-opacity duration-150"></div>
                {/* Loading overlay for selected genre */}
                {selectedGenreId === genre.id && isLoadingGenre && (
                  <div className="absolute inset-0 bg-gradient-to-br from-gold/20 to-mystic/20 backdrop-blur-sm flex items-center justify-center">
                    <div className="relative">
                      {/* Outer rotating ring */}
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-ink/30"></div>
                      {/* Inner rotating ring */}
                      <div className="absolute top-0 left-0 animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
                      {/* Center pulsing dot */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gold rounded-full animate-pulse"></div>
                    </div>
                  </div>
                )}
                
                <div className={`bg-gradient-to-r ${genre.color}/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform relative overflow-hidden`}>
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
                  <div className="text-white relative z-10">
                    {genre.icon}
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white dark:text-ink mb-2 group-hover:text-gold transition-colors duration-300">
                  {t(`genre.${genre.id}`)}
                </h3>
                <p className="text-sm text-gray-300 dark:text-ink-muted group-hover:text-ink-light transition-colors duration-300">
                  {t(`genre.${genre.id}.desc`)}
                </p>
              </button>
            ))}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => setShowGenreSelection(false)}
              disabled={isLoadingGenre}
              className={`text-mystic hover:text-gold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                isLoadingGenre ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span className="flex items-center space-x-2">
                <span className="text-xl">←</span>
                <span>بازگشت</span>
              </span>
            </button>
            
            <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <div className="text-center">
                <h4 className="text-sm text-ink-muted font-semibold mb-2">اتاق شما:</h4>
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 px-3 py-2 rounded-lg border border-amber-400/30 backdrop-blur-sm">
                    <Hash className="h-4 w-4 text-ink-muted drop-shadow-lg" />
                    <span className="text-lg font-mono font-bold text-ink bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent tracking-wide">
                      {createdRoomCode}
                    </span>
                  </div>
                </div>
                <QRCodeGenerator roomCode={createdRoomCode} />
              </div>
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        <LoadingOverlay 
          isVisible={isLoadingGenre} 
          text={`در حال آماده‌سازی داستان ${selectedGenreId ? t(`genre.${selectedGenreId}`) : ''}...`}
        />
      </>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4">
      <div className="text-center mb-12 sm:mb-16 lg:mb-20">
        <div className="relative inline-block">
          <h1 className="text-xl sm:text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold gradient-text mb-4 sm:mb-6 floating-animation">
            {/* {t('lobby.title')} */}
          </h1>
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-2xl blur-xl -z-10"></div>
        </div>
        <p className="text-base sm:text-xl lg:text-xl sm:text-2xl text-ink dark:text-ink-light px-2 sm:px-4 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed">
          {/* {t('lobby.subtitle')} */}
        </p>
        <div className="flex items-center justify-center space-x-4 text-sm text-ink-muted dark:text-ink-light">
          <div className="flex items-center space-x-2">
            {/* <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div> */}
            {/* <span>{t('lobby.liveMultiplayer')}</span> */}
          </div>
          {/* <div className="w-1 h-1 bg-amber-500 rounded-full"></div> */}
          <div className="flex items-center space-x-2">
            {/* <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div> */}
            {/* <span>{t('lobby.aiGameMaster')}</span> */}
          </div>
          {/* <div className="w-1 h-1 bg-amber-500 rounded-full"></div> */}
          <div className="flex items-center space-x-2">
            {/* <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div> */}
            {/* <span>{t('lobby.realTimeDice')}</span> */}
          </div>
        </div>
        {/* Info Banner */}
        <InfoBanner />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 lg:gap-12">
        {/* Create Room */}
        <div className="group glass-card p-6 sm:p-8 lg:p-10 hover:scale-105 transition-all duration-500 hover:shadow-2xl dark:bg-parchment/10 dark:border-white/20">
          <div className="text-center mb-6 sm:mb-8 lg:mb-10">
            <div className="relative inline-block mb-6">
              <div className="bg-gradient-to-br from-amber-500/30 to-yellow-500/30 rounded-2xl p-6 w-16 h-16 sm:w-20 sm:h-20 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Plus className="h-10 w-10 text-ink-muted group-hover:text-ink transition-colors" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <h2 className="text-xl sm:text-2xl sm:text-3xl font-bold text-ink mb-3 group-hover:gradient-text transition-all duration-300">{t('lobby.createRoom')}</h2>
            <p className="text-lg text-ink-muted group-hover:text-ink-muted transition-colors">{t('lobby.startAdventure')}</p>
          </div>

          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-ink mb-3">
                {t('lobby.nickname')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-4 py-3 bg-amber-50/80 dark:bg-parchment/20 border border-amber-400 dark:border-amber-500/50 rounded-xl text-ink dark:text-black placeholder-ink-muted dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 text-base"
                  placeholder={t('lobby.nickname')}
                  maxLength={20}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            <button
              onClick={handleCreateRoom}
              disabled={!nickname.trim() || isLoading}
              className="group relative w-full mystical-button py-4 px-6 sm:py-5 sm:px-8 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 text-base overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <div className="relative flex items-center justify-center space-x-2">
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                )}
                <span>{isLoading ? 'Creating...' : t('lobby.createRoom')}</span>
              </div>
            </button>
          </div>

          {/* Room Created Info - Always show if room exists */}
          {createdRoomCode && (
            <div className="mt-8 glass-card p-6 border-amber-500/30 bg-gradient-to-br from-amber-900/20 to-yellow-900/20">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="text-4xl animate-bounce">🎉</div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-full blur-lg"></div>
                </div>
                <h3 className="text-xl text-ink-muted font-bold mb-4">{t('lobby.roomCreated')}</h3>
                <div className="flex items-center justify-center space-x-4 mb-6 sm:mb-8 lg:mb-10">
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 px-6 py-4 rounded-2xl border border-amber-400/30 backdrop-blur-sm">
                    <div className="relative">
                      <Hash className="h-7 w-7 text-ink-muted drop-shadow-lg" />
                      <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/20 to-yellow-400/20 rounded-full blur-sm -z-10"></div>
                    </div>
                    <span className="text-4xl font-mono font-bold text-ink bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent tracking-wider drop-shadow-lg">
                      {createdRoomCode}
                    </span>
                  </div>
                </div>
                <p className="text-ink-muted mb-6 text-lg">
                  {t('lobby.shareCode')}
                </p>
                <div className="mb-6">
                  <QRCodeGenerator roomCode={createdRoomCode} />
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={handleQuickStart}
                    disabled={!nickname.trim()}
                    className="group relative w-full bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 text-white py-3 px-6 sm:py-4 sm:px-8 rounded-xl font-semibold hover:from-amber-500 hover:via-yellow-500 hover:to-amber-500 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="relative flex items-center justify-center space-x-2">
                      <span className="text-lg">🚀</span>
                      <span>{t('lobby.quickStart')}</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={handleSelectGenre}
                    disabled={!nickname.trim()}
                    className="group relative w-full bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 text-white py-3 px-6 sm:py-4 sm:px-8 rounded-xl font-semibold hover:from-amber-500 hover:via-yellow-500 hover:to-amber-500 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="relative flex items-center justify-center space-x-2">
                      <span className="text-lg">🎭</span>
                      <span>{t('lobby.chooseGenre')}</span>
                    </div>
                  </button>
                </div>
                
                <div className="mt-6 p-4 bg-amber-900/20 border border-amber-500/30 rounded-xl">
                  <p className="text-sm text-ink-muted flex items-center justify-center space-x-2">
                    <span>💡</span>
                    <span>{t('lobby.friendsJoin')} <span className="font-mono font-bold text-ink">{createdRoomCode}</span></span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Join Room */}
        <div className="group glass-card p-6 sm:p-8 lg:p-10 hover:scale-105 transition-all duration-500 hover:shadow-2xl dark:bg-parchment/10 dark:border-white/20">
          <div className="text-center mb-6 sm:mb-8 lg:mb-10">
            <div className="relative inline-block mb-6">
              <div className="bg-gradient-to-br from-amber-500/30 to-yellow-500/30 rounded-2xl p-6 w-16 h-16 sm:w-20 sm:h-20 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="h-10 w-10 text-ink-muted group-hover:text-ink transition-colors" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <h2 className="text-xl sm:text-2xl sm:text-3xl font-bold text-ink mb-3 group-hover:gradient-text transition-all duration-300">{t('lobby.joinRoom')}</h2>
            <p className="text-lg text-ink-muted group-hover:text-ink-muted transition-colors">{t('lobby.joinAdventure')}</p>
          </div>

          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-ink mb-3">
                {t('lobby.nickname')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-4 py-3 bg-amber-50/80 dark:bg-parchment/20 border border-amber-400 dark:border-amber-500/50 rounded-xl text-ink dark:text-black placeholder-ink-muted dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 text-base"
                  placeholder={t('lobby.nickname')}
                  maxLength={20}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-ink mb-3">
                {t('lobby.roomCode')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-amber-50/80 dark:bg-parchment/20 border border-amber-400 dark:border-amber-500/50 rounded-xl text-ink dark:text-black placeholder-ink-muted dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 font-mono text-center text-xl"
                  placeholder={t('lobby.enterCode')}
                  maxLength={6}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            <button
              onClick={handleJoinRoom}
              disabled={!nickname.trim() || !roomCode.trim() || isLoading}
              className="group relative w-full mystical-button py-4 px-6 sm:py-5 sm:px-8 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 text-base overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <div className="relative flex items-center justify-center space-x-2">
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Users className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                )}
                <span>{isLoading ? 'Joining...' : t('lobby.joinRoom')}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mt-16 sm:mt-20 lg:mt-24 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 md:gap-12">
        <div className="group text-center glass-card p-6 sm:p-8 lg:p-10 hover:scale-105 transition-all duration-500 dark:bg-parchment/10 dark:border-white/20">
          <div className="relative inline-block mb-6">
            <div className="bg-gradient-to-br from-amber-500/30 to-yellow-500/30 rounded-2xl p-6 w-16 h-16 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <QrCode className="h-6 w-6 sm:h-8 sm:w-8 text-ink-muted group-hover:text-ink transition-colors" />
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <h3 className="text-xl font-bold text-ink dark:text-ink-light mb-3 group-hover:gradient-text transition-all duration-300">{t('lobby.qrSharing')}</h3>
          <p className="text-ink-muted dark:text-ink-muted group-hover:text-ink-muted transition-colors">{t('lobby.qrDescription')}</p>
        </div>
        
        <div className="group text-center glass-card p-6 sm:p-8 lg:p-10 hover:scale-105 transition-all duration-500 dark:bg-parchment/10 dark:border-white/20">
          <div className="relative inline-block mb-6">
            <div className="bg-gradient-to-br from-amber-500/30 to-yellow-500/30 rounded-2xl p-6 w-16 h-16 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-ink-muted group-hover:text-ink transition-colors" />
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <h3 className="text-xl font-bold text-ink dark:text-ink-light mb-3 group-hover:gradient-text transition-all duration-300">{t('lobby.realtimeMultiplayer')}</h3>
          <p className="text-ink-muted dark:text-ink-muted group-hover:text-ink-muted transition-colors">{t('lobby.realtimeDescription')}</p>
        </div>
        
        <div className="group text-center glass-card p-6 sm:p-8 lg:p-10 hover:scale-105 transition-all duration-500 dark:bg-parchment/10 dark:border-white/20">
          <div className="relative inline-block mb-6">
            <div className="bg-gradient-to-br from-amber-500/30 to-yellow-500/30 rounded-2xl p-6 w-16 h-16 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Hash className="h-6 w-6 sm:h-8 sm:w-8 text-ink-muted group-hover:text-ink transition-colors" />
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <h3 className="text-xl font-bold text-ink dark:text-ink-light mb-3 group-hover:gradient-text transition-all duration-300">{t('lobby.aiGameMaster')}</h3>
          <p className="text-ink-muted dark:text-ink-muted group-hover:text-ink-muted transition-colors">{t('lobby.aiDescription')}</p>
        </div>
      </div>
    </div>
  );
};