import React, { useState, useEffect } from 'react';
import { Users, Plus, Hash, QrCode, Wand2, Clock, Search, Ghost, Smile, Rocket, Crown } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { QRCodeGenerator } from './QRCodeGenerator';
import InfoBanner from './InfoBanner';
import { Genre } from '../types/game';
import { useEnhancedGameStore } from '../store/enhancedGameStore';

interface EnhancedLobbyProps {
  onJoinRoom: (code: string, nickname: string, genre?: Genre) => void;
}

export const EnhancedLobby: React.FC<EnhancedLobbyProps> = ({ onJoinRoom }) => {
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [createdRoomCode, setCreatedRoomCode] = useState('');
  const [showGenreSelection, setShowGenreSelection] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const {
    initializeDatabase,
    createRoom,
    joinRoom,
    currentRoom,
    currentPlayer
  } = useEnhancedGameStore();

  // Initialize database on component mount
  useEffect(() => {
    const init = async () => {
      try {
        await initializeDatabase();
        console.log('Database initialized in Lobby');
      } catch (error) {
        console.error('Failed to initialize database:', error);
        setError('Failed to initialize database. Please refresh the page.');
      }
    };
    init();
  }, [initializeDatabase]);

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
    setCreatedRoomCode(code);
    setShowCreateRoom(true);
    return code;
  };

  const handleCreateRoom = async () => {
    if (!nickname.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const code = generateRoomCode();
      
      // Create host player
      const hostPlayer = {
        id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        nickname: nickname.trim(),
        age: 25, // Default age, could be made configurable
        genre: 'Fantasy' as const,
        score: 0,
        titles: [],
        isHost: true,
        level: 1,
        experience: 0
      };

      // Create room in database
      const room = await createRoom(code, 'fantasy', hostPlayer);
      
      // Show genre selection
      setShowGenreSelection(true);
      
      console.log('Room created successfully:', room);
    } catch (error) {
      console.error('Failed to create room:', error);
      setError('Failed to create room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenreSelect = async (genre: Genre) => {
    if (!currentRoom) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Update room with selected genre
      await createRoom(createdRoomCode, genre, {
        id: currentRoom.players[0]?.id || `player_${Date.now()}`,
        nickname: nickname.trim(),
        age: 25,
        genre: 'Fantasy' as const,
        score: 0,
        titles: [],
        isHost: true,
        level: 1,
        experience: 0
      });
      
      setSelectedGenre(genre);
      onJoinRoom(createdRoomCode, nickname, genre);
      
      console.log('Genre selected and room updated:', genre);
    } catch (error) {
      console.error('Failed to select genre:', error);
      setError('Failed to select genre. Please try again.');
    } finally {
      setIsLoading(false);
    }
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => setError(null)}
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full mb-6 shadow-lg">
              <Users className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-ink mb-4">
              {t('lobby.title')}
            </h1>
            <p className="text-xl text-ink-muted max-w-2xl mx-auto">
              {t('lobby.subtitle')}
            </p>
          </div>

          {/* Info Banner */}
          <InfoBanner />

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Create Room Section */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full mb-4 shadow-lg">
                  <Plus className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-3">
                  {t('lobby.createRoom')}
                </h2>
                <p className="text-lg text-ink-muted">
                  {t('lobby.startAdventure')}
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-ink mb-3">
                    {t('lobby.nickname')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full px-4 py-3 bg-amber-50/80 border border-amber-400 rounded-xl text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 text-base"
                      placeholder={t('lobby.nickname')}
                      maxLength={20}
                      disabled={isLoading}
                    />
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

              {/* Genre Selection */}
              {showGenreSelection && (
                <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
                  <h3 className="text-lg font-semibold text-ink mb-4 text-center">
                    Choose Your Adventure Genre
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {genres.map((genre) => (
                      <button
                        key={genre.id}
                        onClick={() => handleGenreSelect(genre.id)}
                        disabled={isLoading}
                        className={`group relative p-3 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                          selectedGenre === genre.id
                            ? 'border-amber-500 bg-amber-100'
                            : 'border-amber-200 bg-white/60 hover:border-amber-300'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <div className={`text-2xl ${selectedGenre === genre.id ? 'text-amber-600' : 'text-amber-500'}`}>
                            {genre.icon}
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium text-ink">{genre.name}</div>
                            <div className="text-xs text-ink-muted">{genre.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Room Code Display */}
              {showCreateRoom && createdRoomCode && (
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="text-center">
                    <p className="text-sm text-green-700 mb-2">Your Room Code:</p>
                    <div className="flex items-center justify-center space-x-2">
                      <Hash className="h-5 w-5 text-green-600" />
                      <span className="text-2xl font-bold text-green-800 font-mono">
                        {createdRoomCode}
                      </span>
                    </div>
                    <QRCodeGenerator roomCode={createdRoomCode} />
                  </div>
                </div>
              )}
            </div>

            {/* Join Room Section */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full mb-4 shadow-lg">
                  <Hash className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-3">
                  {t('lobby.joinRoom')}
                </h2>
                <p className="text-lg text-ink-muted">
                  {t('lobby.joinAdventure')}
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-ink">
                      {t('lobby.nickname')}
                    </label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full px-4 py-3 bg-blue-50/80 border border-blue-400 rounded-xl text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-base"
                      placeholder={t('lobby.nickname')}
                      maxLength={20}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-ink">
                      {t('lobby.roomCode')}
                    </label>
                    <input
                      type="text"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 bg-blue-50/80 border border-blue-400 rounded-xl text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-base font-mono"
                      placeholder="ABC123"
                      maxLength={6}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <button
                  onClick={handleJoinRoom}
                  disabled={!nickname.trim() || !roomCode.trim() || isLoading}
                  className="group relative w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-4 px-6 sm:py-5 sm:px-8 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <div className="relative flex items-center justify-center space-x-2">
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Hash className="h-5 w-5" />
                    )}
                    <span>{isLoading ? 'Joining...' : t('lobby.joinRoom')}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Current Room Info */}
          {currentRoom && (
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <h3 className="text-lg font-semibold text-ink mb-4 text-center">
                Current Room Information
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-amber-600">{currentRoom.code}</div>
                  <div className="text-sm text-ink-muted">Room Code</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{currentRoom.players.length}</div>
                  <div className="text-sm text-ink-muted">Players</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{currentRoom.selectedGenre}</div>
                  <div className="text-sm text-ink-muted">Genre</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{currentRoom.status}</div>
                  <div className="text-sm text-ink-muted">Status</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
