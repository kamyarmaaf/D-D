import React from 'react';
import { Lobby } from '../Lobby';
import { useNavigate } from 'react-router-dom';
import { Genre } from '../../types/game';

export const LobbyPage: React.FC = () => {
  const navigate = useNavigate();

  const handleJoinRoom = (code: string, playerNickname: string, genre?: Genre) => {
    // Navigate to game page with state
    navigate('/game', { 
      state: { 
        roomCode: code, 
        nickname: playerNickname, 
        genre: genre || 'fantasy' 
      } 
    });
  };

  return <Lobby onJoinRoom={handleJoinRoom} />;
};
