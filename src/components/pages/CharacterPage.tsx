import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CharacterCreation } from '../CharacterCreation';
import { useEnhancedGameStore } from '../../store/enhancedGameStore';
import { Character } from '../../types/game';

export const CharacterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setCharacter } = useEnhancedGameStore();

  const handleCharacterCreate = (newCharacter: Character) => {
    setCharacter(newCharacter);
    navigate('/');
  };

  const handleSkip = () => {
    navigate('/');
  };

  return (
    <CharacterCreation
      onCharacterCreate={handleCharacterCreate}
      onSkip={handleSkip}
    />
  );
};
