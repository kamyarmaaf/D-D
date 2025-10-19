import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Achievements } from '../Achievements';
import { useEnhancedGameStore } from '../../store/enhancedGameStore';
import { achievementManager } from '../../database/achievements';

export const AchievementsPage: React.FC = () => {
  const navigate = useNavigate();
  const { achievements, currentPlayer, getTotalAchievementPoints } = useEnhancedGameStore();

  // Use currentPlayer achievements if available, otherwise use store achievements
  const displayAchievements = currentPlayer?.achievements || achievements;
  const totalPoints = currentPlayer?.achievements?.reduce((total, achievement) => total + achievement.points, 0) || getTotalAchievementPoints();

  // Get all available achievements from achievement manager
  const allAchievements = achievementManager.getAllAchievements();
  
  // Merge unlocked achievements with all available achievements
  const finalAchievements = allAchievements.map(achievementTemplate => {
    const unlockedAchievement = displayAchievements.find(a => a.id === achievementTemplate.id);
    
    return {
      id: achievementTemplate.id,
      name: achievementTemplate.name,
      description: achievementTemplate.description,
      icon: achievementTemplate.icon,
      points: achievementTemplate.points,
      category: achievementTemplate.category,
      unlockedAt: unlockedAchievement?.unlockedAt || new Date(0) // Date(0) means locked
    };
  });

  // Calculate total points only from unlocked achievements
  const finalTotalPoints = finalAchievements
    .filter(achievement => achievement.unlockedAt.getTime() > 0)
    .reduce((total, achievement) => total + achievement.points, 0);



  const handleAchievementClick = (achievement: any) => {
    console.log('Achievement clicked:', achievement.name);
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={handleBack}
          className="mb-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          ← Back
        </button>
        
        
        <Achievements
          achievements={finalAchievements}
          totalPoints={finalTotalPoints}
          onAchievementClick={handleAchievementClick}
        />
      </div>
    </div>
  );
};
