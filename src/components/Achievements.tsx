import React, { useState } from 'react';
import { Trophy, Star, Target, Users, BookOpen, Zap, Lock, CheckCircle } from 'lucide-react';
import { Achievement } from '../types/game';
import { useLanguage } from '../hooks/useLanguage';

interface AchievementsProps {
  achievements: Achievement[];
  totalPoints: number;
  onAchievementClick: (achievement: Achievement) => void;
}

const categoryIcons = {
  combat: Target,
  exploration: BookOpen,
  social: Users,
  story: Star,
  special: Zap
};

const categoryColors = {
  combat: 'from-red-500 to-rose-500',
  exploration: 'from-amber-500 to-yellow-500',
  social: 'from-blue-500 to-cyan-500',
  story: 'from-purple-500 to-indigo-500',
  special: 'from-yellow-500 to-orange-500'
};

const categoryBorders = {
  combat: 'border-red-500/30',
  exploration: 'border-amber-500/30',
  social: 'border-blue-500/30',
  story: 'border-purple-500/30',
  special: 'border-yellow-500/30'
};

export const Achievements: React.FC<AchievementsProps> = ({ 
  achievements, 
  totalPoints, 
  onAchievementClick 
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('unlocked');
  const { t } = useLanguage();

  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'all') return true;
    return achievement.category === filter;
  });

  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    switch (sortBy) {
      case 'unlocked':
        return b.unlockedAt.getTime() - a.unlockedAt.getTime();
      case 'points':
        return b.points - a.points;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'category':
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });

  const getCategoryStats = () => {
    const stats = achievements.reduce((acc, achievement) => {
      if (!acc[achievement.category]) {
        acc[achievement.category] = { count: 0, points: 0 };
      }
      acc[achievement.category].count++;
      acc[achievement.category].points += achievement.points;
      return acc;
    }, {} as Record<string, { count: number; points: number }>);

    return stats;
  };

  const categoryStats = getCategoryStats();

  return (
    <div className="max-w-7xl mx-auto glass-card p-4 sm:p-6 lg:p-8 shadow-2xl">
      <div className="glass-card p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500/40 to-orange-500/40 rounded-xl flex items-center justify-center">
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-lg" />
            </div>
            <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-ink">{t('achievements.title')}</h2>
            <p className="text-sm sm:text-base text-ink-muted">{t('achievements.trackProgress')}</p>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <div className="text-2xl sm:text-3xl font-bold text-yellow-400">{totalPoints}</div>
            <div className="text-xs sm:text-sm text-ink-muted">{t('achievements.totalPoints')}</div>
          </div>
        </div>

        {/* Category Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {Object.entries(categoryStats).map(([category, stats]) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons];
            return (
              <div key={category} className={`glass-card p-3 sm:p-4 text-center border ${categoryBorders[category as keyof typeof categoryBorders]}`}>
                <div className="flex items-center justify-center mb-1 sm:mb-2">
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ${categoryColors[category as keyof typeof categoryColors].split(' ')[0].replace('from-', 'text-')}`} />
                </div>
                <div className="text-lg sm:text-xl font-bold text-ink">{stats.count}</div>
                <div className="text-xs sm:text-sm text-ink-muted capitalize">{category}</div>
                <div className="text-xs text-ink-muted">{stats.points} pts</div>
              </div>
            );
          })}
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 sm:px-3 py-1 sm:py-1 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 ${
                filter === 'all' 
                  ? 'bg-yellow-600 text-ink' 
                  : 'bg-amber-100/50 text-ink hover:bg-amber-200/50'
              }`}
            >
              All
            </button>
            {Object.keys(categoryIcons).map(category => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-2 sm:px-3 py-1 sm:py-1 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 capitalize ${
                  filter === category 
                    ? 'bg-yellow-600 text-ink' 
                    : 'bg-amber-100/50 text-ink hover:bg-amber-200/50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs sm:text-sm text-ink-muted">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 sm:px-3 py-1 sm:py-1 bg-amber-50/80 border border-yellow-500/30 rounded-lg text-ink text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="unlocked">Recently Unlocked</option>
              <option value="points">Points</option>
              <option value="name">Name</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {sortedAchievements.map((achievement) => {
          const Icon = categoryIcons[achievement.category];
          const isUnlocked = achievement.unlockedAt.getTime() > 0;
          
          return (
            <div
              key={achievement.id}
              className={`group glass-card p-3 sm:p-4 lg:p-6 hover:scale-105 transition-all duration-300 cursor-pointer border ${
                isUnlocked 
                  ? categoryBorders[achievement.category as keyof typeof categoryBorders]
                  : 'border-gray-600/30 opacity-60'
              }`}
              onClick={() => onAchievementClick(achievement)}
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center ${
                    isUnlocked 
                      ? `bg-gradient-to-br ${categoryColors[achievement.category as keyof typeof categoryColors]}/30`
                      : 'bg-gray-600/30'
                  }`}>
                    {isUnlocked ? (
                      <Icon className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ${
                        categoryColors[achievement.category as keyof typeof categoryColors].split(' ')[0].replace('from-', 'text-')
                      }`} />
                    ) : (
                      <Lock className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-gray-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className={`text-sm sm:text-base lg:text-lg font-bold ${
                      isUnlocked ? 'text-ink group-hover:gradient-text' : 'text-ink-muted'
                    } transition-all duration-300 truncate`}>
                      {achievement.name}
                    </h3>
                    <p className={`text-xs sm:text-sm font-semibold capitalize ${
                      isUnlocked 
                        ? categoryColors[achievement.category as keyof typeof categoryColors].split(' ')[0].replace('from-', 'text-')
                        : 'text-gray-600'
                    }`}>
                      {achievement.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  {isUnlocked && (
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-ink-muted" />
                  )}
                  <div className="text-right">
                    <div className={`text-sm sm:text-base lg:text-lg font-bold ${
                      isUnlocked ? 'text-yellow-400' : 'text-gray-500'
                    }`}>
                      {achievement.points}
                    </div>
                    <div className="text-xs text-ink-muted">pts</div>
                  </div>
                </div>
              </div>

              <p className={`text-xs sm:text-sm mb-3 sm:mb-4 ${
                isUnlocked ? 'text-ink' : 'text-ink-muted'
              }`}>
                {achievement.description}
              </p>

              {isUnlocked && (
                <div className="text-xs text-ink-muted">
                  Unlocked: {achievement.unlockedAt.toLocaleDateString()}
                </div>
              )}

              {!isUnlocked && (
                <div className="text-xs text-ink-muted italic">
                  Locked - Complete requirements to unlock
                </div>
              )}
            </div>
          );
        })}
      </div>

      {sortedAchievements.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <Trophy className="h-12 w-12 sm:h-16 sm:w-16 text-gray-500 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-400 mb-2">No Achievements Found</h3>
          <p className="text-sm sm:text-base text-gray-500">No achievements match your current filter or you haven't unlocked any yet.</p>
        </div>
      )}

      {/* Achievement Detail Modal */}
      {achievements.length > 0 && (
        <div className="mt-6 sm:mt-8 glass-card p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Achievement Progress</h3>
          <div className="space-y-3 sm:space-y-4">
            {Object.entries(categoryStats).map(([category, stats]) => {
              const Icon = categoryIcons[category as keyof typeof categoryIcons];
              const totalInCategory = achievements.filter(a => a.category === category).length;
              const unlockedInCategory = achievements.filter(a => a.category === category && a.unlockedAt.getTime() > 0).length;
              const progress = totalInCategory > 0 ? (unlockedInCategory / totalInCategory) * 100 : 0;
              
              return (
                <div key={category} className="space-y-1 sm:space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${
                        categoryColors[category as keyof typeof categoryColors].split(' ')[0].replace('from-', 'text-')
                      }`} />
                      <span className="text-xs sm:text-sm font-semibold text-white capitalize">{category}</span>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-400">
                      {unlockedInCategory}/{totalInCategory} ({Math.round(progress)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5 sm:h-2">
                    <div
                      className={`h-1.5 sm:h-2 rounded-full bg-gradient-to-r ${categoryColors[category as keyof typeof categoryColors]}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
