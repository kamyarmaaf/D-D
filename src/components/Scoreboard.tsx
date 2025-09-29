import React from 'react';
import { Trophy, Crown, Star, Award, Target, Shield } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

interface PlayerScore {
  id: string;
  nickname: string;
  score: number;
  titles: string[];
  achievements: string[];
}

interface ScoreboardProps {
  players: PlayerScore[];
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ players = [] }) => {
  const { t } = useLanguage();

  // Mock data for demonstration
  const mockPlayers: PlayerScore[] = [
    {
      id: '1',
      nickname: 'DragonSlayer',
      score: 850,
      titles: ['Bravest', 'Most Intelligent'],
      achievements: ['First Kill', 'Puzzle Master', 'Leadership']
    },
    {
      id: '2',
      nickname: 'MysticMage',
      score: 720,
      titles: ['Most Creative'],
      achievements: ['Spell Caster', 'Problem Solver']
    },
    {
      id: '3',
      nickname: 'ShadowRogue',
      score: 690,
      titles: ['Stealthiest'],
      achievements: ['Sneak Attack', 'Lock Picker']
    },
    {
      id: '4',
      nickname: 'NobleKnight',
      score: 580,
      titles: ['Most Heroic'],
      achievements: ['Defender', 'Team Player']
    }
  ];

  const displayPlayers = players.length > 0 ? players : mockPlayers;
  const sortedPlayers = displayPlayers.sort((a, b) => b.score - a.score);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-6 w-6 text-yellow-400" />;
      case 1:
        return <Award className="h-6 w-6 text-gray-300" />;
      case 2:
        return <Star className="h-6 w-6 text-ink-muted" />;
      default:
        return <Target className="h-6 w-6 text-purple-400" />;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return 'from-yellow-600/40 to-amber-600/40 border-yellow-500/30';
      case 1:
        return 'from-gray-600/40 to-slate-600/40 border-gray-500/30';
      case 2:
        return 'from-amber-700/40 to-orange-700/40 border-amber-500/30';
      default:
        return 'from-purple-600/40 to-indigo-600/40 border-purple-500/30';
    }
  };

  const getTitleIcon = (title: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Bravest': <Shield className="h-4 w-4 text-red-400" />,
      'Most Intelligent': <Star className="h-4 w-4 text-blue-400" />,
      'Most Creative': <Award className="h-4 w-4 text-purple-400" />,
      'Stealthiest': <Target className="h-4 w-4 text-gray-400" />,
      'Most Heroic': <Crown className="h-4 w-4 text-yellow-400" />
    };
    return icons[title] || <Star className="h-4 w-4 text-cyan-400" />;
  };

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-0">
      <div className="text-center mb-12">
        <div className="bg-gradient-to-br from-yellow-600/20 to-amber-600/20 rounded-full p-4 sm:p-6 w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
          <Trophy className="h-8 w-8 sm:h-12 sm:w-12 text-yellow-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text mb-4">
          {t('nav.scoreboard')}
        </h1>
        <p className="text-lg sm:text-xl text-ink-muted">
          Adventure Hall of Fame
        </p>
      </div>

      {/* Podium for top 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
        {sortedPlayers.slice(0, 3).map((player, index) => (
          <div
            key={player.id}
            className={`bg-gradient-to-br ${getRankColor(index)} backdrop-blur-sm rounded-2xl p-4 sm:p-6 border text-center transform hover:scale-105 transition-all ${
              index === 0 ? 'sm:col-span-2 lg:col-span-1 lg:order-2 lg:scale-110' : index === 1 ? 'lg:order-1' : 'lg:order-3'
            }`}
          >
            <div className="mb-4">
              {getRankIcon(index)}
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{player.nickname}</h3>
            <p className="text-2xl sm:text-3xl font-bold text-white mb-4">{player.score}</p>
            
            {player.titles.length > 0 && (
              <div className="space-y-2 mb-4">
                {player.titles.map((title, titleIndex) => (
                  <div key={titleIndex} className="flex items-center justify-center space-x-2 text-xs sm:text-sm">
                    {getTitleIcon(title)}
                    <span className="text-gray-300">{title}</span>
                  </div>
                ))}
              </div>
            )}

            {player.achievements.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                {player.achievements.map((achievement, achIndex) => (
                  <span
                    key={achIndex}
                    className="text-xs px-2 py-1 bg-black/20 text-gray-300 rounded-full whitespace-nowrap"
                  >
                    {achievement}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Remaining players */}
      {sortedPlayers.length > 3 && (
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 text-center">Other Adventurers</h2>
          {sortedPlayers.slice(3).map((player, index) => (
            <div
              key={player.id}
              className="bg-gradient-to-r from-slate-800/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-slate-500/20 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-700/40 transition-all gap-2 sm:gap-0"
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="bg-purple-600/20 rounded-full p-2">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-semibold text-white">{player.nickname}</h4>
                  <div className="flex flex-col sm:flex-row sm:space-x-2 text-xs sm:text-sm text-gray-400">
                    <span>Rank #{index + 4}</span>
                    {player.titles.length > 0 && (
                      <span className="sm:before:content-['•_']">{player.titles.join(', ')}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xl sm:text-2xl font-bold text-white">{player.score}</p>
                <p className="text-xs sm:text-sm text-gray-400">points</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      <div className="mt-8 sm:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-purple-800/20 to-indigo-800/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center border border-purple-500/20">
          <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400 mx-auto mb-2" />
          <p className="text-xl sm:text-2xl font-bold text-white">{displayPlayers.length}</p>
          <p className="text-xs sm:text-sm text-purple-200">Players</p>
        </div>
        <div className="bg-gradient-to-br from-cyan-800/20 to-teal-800/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center border border-cyan-500/20">
          <Star className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400 mx-auto mb-2" />
          <p className="text-xl sm:text-2xl font-bold text-white">
            {displayPlayers.reduce((sum, p) => sum + p.score, 0)}
          </p>
          <p className="text-xs sm:text-sm text-cyan-200">Total Points</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-800/20 to-orange-800/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center border border-yellow-500/20">
          <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 mx-auto mb-2" />
          <p className="text-xl sm:text-2xl font-bold text-white">
            {sortedPlayers[0]?.score || 0}
          </p>
          <p className="text-xs sm:text-sm text-yellow-200">High Score</p>
        </div>
        <div className="bg-gradient-to-br from-amber-800/20 to-yellow-800/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center border border-amber-500/20 col-span-2 lg:col-span-1">
          <Award className="h-6 w-6 sm:h-8 sm:w-8 text-ink-muted mx-auto mb-2" />
          <p className="text-xl sm:text-2xl font-bold text-white">
            {displayPlayers.reduce((sum, p) => sum + p.titles.length, 0)}
          </p>
          <p className="text-xs sm:text-sm text-ink-muted">Total Titles</p>
        </div>
      </div>
    </div>
  );
};