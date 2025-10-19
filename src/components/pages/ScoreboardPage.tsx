import React from 'react';
import { Scoreboard } from '../Scoreboard';

export const ScoreboardPage: React.FC = () => {
  // For now, using empty array - this would be populated from store or API
  const players: any[] = [];
  
  return <Scoreboard players={players} />;
};
