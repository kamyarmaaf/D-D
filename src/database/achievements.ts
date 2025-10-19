export interface AchievementTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: 'dice' | 'progress' | 'victory' | 'score' | 'level' | 'choice' | 'special';
  unlockCondition: {
    type: 'dice_roll' | 'stage_complete' | 'game_complete' | 'score_reach' | 'level_reach' | 'item_found' | 'choice_made';
    value?: number | string;
    description: string;
  };
}

export const DND_ACHIEVEMENTS: AchievementTemplate[] = [
  // Dice Roll Achievements
  {
    id: 'critical_success',
    name: 'Critical Success',
    description: 'Roll a natural 20 on any dice roll',
    icon: '🎯',
    points: 50,
    category: 'dice',
    unlockCondition: {
      type: 'dice_roll',
      value: 20,
      description: 'Roll a natural 20'
    }
  },
  {
    id: 'critical_failure',
    name: 'Critical Failure',
    description: 'Roll a natural 1 on any dice roll',
    icon: '💥',
    points: 25,
    category: 'dice',
    unlockCondition: {
      type: 'dice_roll',
      value: 1,
      description: 'Roll a natural 1'
    }
  },
  {
    id: 'lucky_roll',
    name: 'Lucky Roll',
    description: 'Roll exactly what you need to succeed',
    icon: '🍀',
    points: 100,
    category: 'dice',
    unlockCondition: {
      type: 'dice_roll',
      description: 'Roll exactly the DC needed'
    }
  },

  // Stage Completion Achievements
  {
    id: 'first_stage',
    name: 'First Steps',
    description: 'Complete your first story stage',
    icon: '👶',
    points: 25,
    category: 'progress',
    unlockCondition: {
      type: 'stage_complete',
      value: 1,
      description: 'Complete stage 1'
    }
  },
  {
    id: 'halfway_there',
    name: 'Halfway There',
    description: 'Complete 3 story stages',
    icon: '🚶‍♂️',
    points: 50,
    category: 'progress',
    unlockCondition: {
      type: 'stage_complete',
      value: 3,
      description: 'Complete 3 stages'
    }
  },
  {
    id: 'story_master',
    name: 'Story Master',
    description: 'Complete all 5 story stages',
    icon: '📚',
    points: 200,
    category: 'progress',
    unlockCondition: {
      type: 'stage_complete',
      value: 5,
      description: 'Complete all stages'
    }
  },

  // Game Completion Achievements
  {
    id: 'first_victory',
    name: 'First Victory',
    description: 'Win your first game',
    icon: '🏆',
    points: 100,
    category: 'victory',
    unlockCondition: {
      type: 'game_complete',
      description: 'Win a game'
    }
  },
  {
    id: 'survivor',
    name: 'Survivor',
    description: 'Complete 5 games',
    icon: '💪',
    points: 150,
    category: 'victory',
    unlockCondition: {
      type: 'game_complete',
      value: 5,
      description: 'Complete 5 games'
    }
  },

  // Score Achievements
  {
    id: 'high_scorer',
    name: 'High Scorer',
    description: 'Reach 500 points in a single game',
    icon: '⭐',
    points: 75,
    category: 'score',
    unlockCondition: {
      type: 'score_reach',
      value: 500,
      description: 'Reach 500 points'
    }
  },
  {
    id: 'point_master',
    name: 'Point Master',
    description: 'Reach 1000 points in a single game',
    icon: '🌟',
    points: 150,
    category: 'score',
    unlockCondition: {
      type: 'score_reach',
      value: 1000,
      description: 'Reach 1000 points'
    }
  },

  // Level Achievements
  {
    id: 'level_up',
    name: 'Level Up',
    description: 'Reach level 2',
    icon: '📈',
    points: 50,
    category: 'level',
    unlockCondition: {
      type: 'level_reach',
      value: 2,
      description: 'Reach level 2'
    }
  },
  {
    id: 'experienced',
    name: 'Experienced',
    description: 'Reach level 5',
    icon: '🧙‍♂️',
    points: 100,
    category: 'level',
    unlockCondition: {
      type: 'level_reach',
      value: 5,
      description: 'Reach level 5'
    }
  },

  // Choice Achievements
  {
    id: 'brave_choice',
    name: 'Brave Choice',
    description: 'Choose the most dangerous option',
    icon: '⚔️',
    points: 75,
    category: 'choice',
    unlockCondition: {
      type: 'choice_made',
      description: 'Choose dangerous options'
    }
  },
  {
    id: 'wise_choice',
    name: 'Wise Choice',
    description: 'Choose the most strategic option',
    icon: '🧠',
    points: 75,
    category: 'choice',
    unlockCondition: {
      type: 'choice_made',
      description: 'Make wise decisions'
    }
  },

  // Special Achievements
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Try different game genres',
    icon: '🗺️',
    points: 100,
    category: 'special',
    unlockCondition: {
      type: 'game_complete',
      description: 'Play different genres'
    }
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Play with 3 different players',
    icon: '🦋',
    points: 125,
    category: 'special',
    unlockCondition: {
      type: 'game_complete',
      description: 'Play with different players'
    }
  }
];

export class AchievementManager {
  private unlockedAchievements: Set<string> = new Set();

  // Check if player should unlock any achievements
  async checkAchievements(
    playerId: string,
    eventType: string,
    eventData: any,
    currentScore: number,
    currentLevel: number,
    completedStages: number,
    completedGames: number
  ): Promise<string[]> {
    const newAchievements: string[] = [];

    for (const achievement of DND_ACHIEVEMENTS) {
      if (this.unlockedAchievements.has(achievement.id)) continue;

      let shouldUnlock = false;

      switch (achievement.unlockCondition.type) {
        case 'dice_roll':
          if (eventType === 'dice_roll' && eventData.roll === achievement.unlockCondition.value) {
            shouldUnlock = true;
          }
          break;

        case 'stage_complete':
          if (eventType === 'stage_complete' && completedStages >= (achievement.unlockCondition.value || 1)) {
            shouldUnlock = true;
          }
          break;

        case 'game_complete':
          if (eventType === 'game_complete') {
            if (achievement.unlockCondition.value) {
              shouldUnlock = completedGames >= achievement.unlockCondition.value;
            } else {
              shouldUnlock = true;
            }
          }
          break;

        case 'score_reach':
          if (currentScore >= (achievement.unlockCondition.value || 0)) {
            shouldUnlock = true;
          }
          break;

        case 'level_reach':
          if (currentLevel >= (achievement.unlockCondition.value || 1)) {
            shouldUnlock = true;
          }
          break;

        case 'choice_made':
          if (eventType === 'choice_made') {
            // Check if it's a brave or wise choice based on DC
            if (achievement.id === 'brave_choice' && eventData.dc >= 15) {
              shouldUnlock = true;
            } else if (achievement.id === 'wise_choice' && eventData.dc <= 10) {
              shouldUnlock = true;
            }
          }
          break;
      }

      if (shouldUnlock) {
        newAchievements.push(achievement.id);
        this.unlockedAchievements.add(achievement.id);
      }
    }

    return newAchievements;
  }

  // Get achievement template by ID
  getAchievementTemplate(id: string): AchievementTemplate | undefined {
    return DND_ACHIEVEMENTS.find(a => a.id === id);
  }

  // Get all achievements by category
  getAchievementsByCategory(category: string): AchievementTemplate[] {
    return DND_ACHIEVEMENTS.filter(a => a.category === category);
  }

  // Get all achievements
  getAllAchievements(): AchievementTemplate[] {
    return DND_ACHIEVEMENTS;
  }
}

export const achievementManager = new AchievementManager();
