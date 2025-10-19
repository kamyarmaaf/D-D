import React from 'react';
import { Trophy, Skull, Clock, X, RotateCcw, Home } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useNavigate } from 'react-router-dom';

interface GameEndModalProps {
  gameEnd: {
    type: 'win' | 'lose' | 'timeout' | 'abandoned';
    reason: string;
    finalScore?: number;
    completedStages: number;
    totalStages: number;
    endMessage: string;
  };
  onClose: () => void;
  onRestart: () => void;
}

export const GameEndModal: React.FC<GameEndModalProps> = ({ 
  gameEnd, 
  onClose, 
  onRestart 
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const getEndIcon = () => {
    switch (gameEnd.type) {
      case 'win':
        return <Trophy className="h-16 w-16 text-yellow-500 animate-bounce" />;
      case 'lose':
        return <Skull className="h-16 w-16 text-red-500 animate-pulse" />;
      case 'timeout':
        return <Clock className="h-16 w-16 text-orange-500 animate-spin" />;
      case 'abandoned':
        return <X className="h-16 w-16 text-gray-500" />;
      default:
        return <Trophy className="h-16 w-16 text-yellow-500" />;
    }
  };

  const getEndTitle = () => {
    switch (gameEnd.type) {
      case 'win':
        return t('gameEnd.victory');
      case 'lose':
        return t('gameEnd.defeat');
      case 'timeout':
        return t('gameEnd.timeout');
      case 'abandoned':
        return t('gameEnd.abandoned');
      default:
        return t('gameEnd.gameOver');
    }
  };

  const getEndColor = () => {
    switch (gameEnd.type) {
      case 'win':
        return 'from-green-500 to-emerald-600';
      case 'lose':
        return 'from-red-500 to-rose-600';
      case 'timeout':
        return 'from-orange-500 to-amber-600';
      case 'abandoned':
        return 'from-gray-500 to-slate-600';
      default:
        return 'from-blue-500 to-indigo-600';
    }
  };

  const handleGoHome = () => {
    navigate('/');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-2xl w-full mx-auto relative overflow-hidden">
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getEndColor()} opacity-10`}></div>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ink-muted hover:text-ink transition-colors z-10"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="relative p-8 text-center">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            {getEndIcon()}
          </div>

          {/* Title */}
          <h2 className="text-4xl font-bold text-ink mb-4">
            {getEndTitle()}
          </h2>

          {/* End message */}
          <div className="mb-8">
            <p className="text-lg text-ink-muted leading-relaxed whitespace-pre-line">
              {gameEnd.endMessage}
            </p>
          </div>

          {/* Game stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-card p-4">
              <div className="text-2xl font-bold text-ink mb-1">
                {gameEnd.completedStages}/{gameEnd.totalStages}
              </div>
              <div className="text-sm text-ink-muted">
                {t('gameEnd.stagesCompleted')}
              </div>
            </div>
            
            {gameEnd.finalScore !== undefined && (
              <div className="glass-card p-4">
                <div className="text-2xl font-bold text-ink mb-1">
                  {gameEnd.finalScore}
                </div>
                <div className="text-sm text-ink-muted">
                  {t('gameEnd.finalScore')}
                </div>
              </div>
            )}

            <div className="glass-card p-4">
              <div className="text-2xl font-bold text-ink mb-1">
                {Math.round((gameEnd.completedStages / gameEnd.totalStages) * 100)}%
              </div>
              <div className="text-sm text-ink-muted">
                {t('gameEnd.completion')}
              </div>
            </div>
          </div>

          {/* Reason */}
          {gameEnd.reason && (
            <div className="mb-8 p-4 bg-amber-100/20 dark:bg-amber-900/20 rounded-xl border border-amber-300/30">
              <p className="text-sm text-ink-muted">
                <strong>{t('gameEnd.reason')}:</strong> {gameEnd.reason}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onRestart}
              className="group relative bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:via-yellow-400 hover:to-amber-400 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <RotateCcw className="h-5 w-5" />
              <span>{t('gameEnd.playAgain')}</span>
            </button>

            <button
              onClick={handleGoHome}
              className="group relative bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 hover:from-blue-400 hover:via-indigo-400 hover:to-blue-400 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <Home className="h-5 w-5" />
              <span>{t('gameEnd.goHome')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
