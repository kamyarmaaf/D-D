import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GamePage as GamePageComponent } from '../GamePage';
import { useEnhancedGameStore } from '../../store/enhancedGameStore';
import { Genre, Character } from '../../types/game';
import { useAuth } from '../../contexts/AuthContext';
import { supabaseGameDatabase } from '../../database/supabaseGameDatabase';

export const GamePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { character } = useEnhancedGameStore();
  const { user } = useAuth();
  
  const [roomCode, setRoomCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<Genre>('fantasy');

  useEffect(() => {
    // Get data from navigation state
    if (location.state) {
      setRoomCode(location.state.roomCode || '');
      setNickname(location.state.nickname || '');
      setSelectedGenre(location.state.genre || 'fantasy');
    }
  }, [location.state]);

  useEffect(() => {
    // If no navigation state provided, try to restore last room by user nickname
    const tryRestoreLastRoom = async () => {
      if (!roomCode && !nickname && (user?.email || user?.name)) {
        try {
          // Prefer email; fallback to nickname
          let lastRoom = null as any;
          if (user?.email) {
            lastRoom = await supabaseGameDatabase.getLastRoomByEmail(user.email);
          }
          if (!lastRoom && user?.name) {
            lastRoom = await supabaseGameDatabase.getLastRoomByNickname(user.name);
          }
          if (lastRoom) {
            setRoomCode(lastRoom.code);
            setNickname(user?.name || user?.email || '');
            setSelectedGenre((lastRoom.selectedGenre as Genre) || 'fantasy');
          }
        } catch (e) {
          // silent fail
        }
      }
    };
    tryRestoreLastRoom();
  }, [location.state, user?.email, user?.name]);

  const handleShowInventory = () => {
    navigate('/inventory');
  };

  const handleShowAchievements = () => {
    navigate('/achievements');
  };

  if (!roomCode || !nickname) {
    // Redirect to lobby if no game data
    navigate('/');
    return null;
  }

  return (
    <GamePageComponent
      roomCode={roomCode}
      nickname={nickname}
      genre={selectedGenre}
      character={character}
      onShowInventory={handleShowInventory}
      onShowAchievements={handleShowAchievements}
    />
  );
};
