import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dice6, Zap, Star, Target, Heart, Shield, Sparkles } from 'lucide-react';

interface ModernDiceProps {
  isRolling: boolean;
  result?: number;
  onRollComplete?: (result: number) => void;
  diceType?: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';
  modifier?: number;
  advantage?: boolean;
  disadvantage?: boolean;
  criticalHit?: boolean;
  criticalMiss?: boolean;
}

const diceFaces = {
  d4: [1, 2, 3, 4],
  d6: [1, 2, 3, 4, 5, 6],
  d8: [1, 2, 3, 4, 5, 6, 7, 8],
  d10: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  d12: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  d20: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  d100: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
};

const diceIcons = {
  d4: Shield,
  d6: Dice6,
  d8: Star,
  d10: Target,
  d12: Heart,
  d20: Zap,
  d100: Star
};

const diceColors = {
  d4: 'from-red-500 to-rose-500',
  d6: 'from-blue-500 to-cyan-500',
  d8: 'from-amber-500 to-yellow-500',
  d10: 'from-yellow-500 to-orange-500',
  d12: 'from-purple-500 to-indigo-500',
  d20: 'from-pink-500 to-rose-500',
  d100: 'from-amber-500 to-yellow-500'
};

export const ModernDice: React.FC<ModernDiceProps> = ({
  isRolling,
  result,
  onRollComplete,
  diceType = 'd20',
  modifier = 0,
  advantage = false,
  disadvantage = false,
  criticalHit = false,
  criticalMiss = false
}) => {
  const [currentResult, setCurrentResult] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [rollingFaces, setRollingFaces] = useState<number[]>([]);

  const Icon = diceIcons[diceType];
  const faces = diceFaces[diceType];
  const maxValue = Math.max(...faces);

  useEffect(() => {
    if (isRolling) {
      setShowResult(false);
      setCurrentResult(null);
      
      // Generate random faces during rolling
      const interval = setInterval(() => {
        setRollingFaces(Array.from({ length: 3 }, () => 
          faces[Math.floor(Math.random() * faces.length)]
        ));
      }, 100);

      // Stop rolling after animation duration
      const timeout = setTimeout(() => {
        clearInterval(interval);
        const finalResult = result || faces[Math.floor(Math.random() * faces.length)];
        setCurrentResult(finalResult);
        setShowResult(true);
        onRollComplete?.(finalResult);
      }, 2000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isRolling, result, faces, onRollComplete]);

  const getResultColor = () => {
    if (criticalHit) return 'text-ink-muted';
    if (criticalMiss) return 'text-red-400';
    if (currentResult === maxValue) return 'text-yellow-400';
    if (currentResult === 1) return 'text-red-400';
    return 'text-white';
  };

  const getResultGlow = () => {
    if (criticalHit) return 'shadow-[0_0_30px_rgba(34,197,94,0.5)]';
    if (criticalMiss) return 'shadow-[0_0_30px_rgba(239,68,68,0.5)]';
    if (currentResult === maxValue) return 'shadow-[0_0_30px_rgba(251,191,36,0.5)]';
    if (currentResult === 1) return 'shadow-[0_0_30px_rgba(239,68,68,0.5)]';
    return 'shadow-[0_0_20px_rgba(168,85,247,0.3)]';
  };

  const getModifierColor = () => {
    if (modifier > 0) return 'text-ink-muted';
    if (modifier < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const totalResult = (currentResult || 0) + modifier;


  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Dice Type and Modifier Info */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Icon className="h-6 w-6 text-purple-400" />
          <span className="text-lg font-bold text-white uppercase">{diceType}</span>
          {modifier !== 0 && (
            <span className={`text-sm font-semibold ${getModifierColor()}`}>
              {modifier > 0 ? '+' : ''}{modifier}
            </span>
          )}
        </div>
        
        {(advantage || disadvantage) && (
          <div className="text-sm text-yellow-400 font-semibold">
            {advantage ? 'Advantage' : 'Disadvantage'}
          </div>
        )}
      </div>

      {/* Rolling Animation */}
      <AnimatePresence>
        {isRolling ? (
          <motion.div
            key="rolling"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative"
          >
            <div className="flex space-x-2">
              {rollingFaces.map((face, index) => (
                <motion.div
                  key={index}
                  animate={{
                    rotate: [0, 360, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: index * 0.1,
                  }}
                  className={`w-16 h-16 bg-gradient-to-br ${diceColors[diceType]} rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg`}
                  style={{
                    boxShadow: `0 0 30px ${diceColors[diceType].split(' ')[1].replace('to-', '')}40`
                  }}
                >
                  {face}
                </motion.div>
              ))}
            </div>
            
            {/* Rolling particles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  animate={{
                    x: [0, Math.random() * 100 - 50],
                    y: [0, Math.random() * 100 - 50],
                    opacity: [1, 0],
                  }}
                  transition={{
                    duration: 1,
                    delay: i * 0.1,
                    repeat: Infinity,
                  }}
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                />
              ))}
            </div>
          </motion.div>
        ) : showResult && currentResult !== null ? (
          <motion.div
            key="result"
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative"
          >
            <div className={`w-24 h-24 bg-gradient-to-br ${diceColors[diceType]} rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-2xl ${getResultGlow()}`}>
              {currentResult}
            </div>
            
            {/* Critical hit/miss effects */}
            {(criticalHit || criticalMiss) && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.8, 0, 0.8],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                }}
              >
                <div className={`w-full h-full rounded-3xl ${
                  criticalHit ? 'bg-amber-600' : 'bg-red-400'
                } opacity-30`} />
              </motion.div>
            )}
            
            {/* Success/failure indicators */}
            {currentResult === maxValue && (
              <motion.div
                className="absolute -top-3 -right-3 text-3xl"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ⭐
              </motion.div>
            )}
            
            {currentResult === 1 && (
              <motion.div
                className="absolute -top-3 -right-3 text-3xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                💥
              </motion.div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Result Display */}
      {showResult && currentResult !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-2"
        >
          <div className="text-2xl font-bold text-white">
            <span className={getResultColor()}>{currentResult}</span>
            {modifier !== 0 && (
              <>
                <span className="text-gray-400 mx-2">
                  {modifier > 0 ? '+' : ''}{modifier}
                </span>
                <span className="text-gray-300">=</span>
                <span className={`ml-2 ${totalResult >= 20 ? 'text-ink-muted' : totalResult <= 5 ? 'text-red-400' : 'text-white'}`}>
                  {totalResult}
                </span>
              </>
            )}
          </div>
          
          {(criticalHit || criticalMiss) && (
            <div className={`text-lg font-bold ${
              criticalHit ? 'text-ink-muted' : 'text-red-400'
            }`}>
              {criticalHit ? 'CRITICAL HIT!' : 'CRITICAL MISS!'}
            </div>
          )}
          
          {currentResult === maxValue && (
            <div className="text-yellow-400 font-semibold">NATURAL {maxValue}!</div>
          )}
          
          {currentResult === 1 && (
            <div className="text-red-400 font-semibold">NATURAL 1!</div>
          )}
        </motion.div>
      )}


      {/* Roll Again Button */}
      {showResult && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
          onClick={() => {
            setShowResult(false);
            setCurrentResult(null);
          }}
        >
          Roll Again
        </motion.button>
      )}
    </div>
  );
};
