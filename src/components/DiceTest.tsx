import React, { useState } from 'react';
import { ModernDice } from './ModernDice';

export const DiceTest: React.FC = () => {
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const handleRoll = () => {
    setIsRolling(true);
    setResult(null);
  };

  const handleRollComplete = (rollResult: number) => {
    setResult(rollResult);
    setIsRolling(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold text-white mb-8">
          تست تاس ریختن
        </h1>
        
        <button
          onClick={handleRoll}
          disabled={isRolling}
          className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-xl rounded-xl hover:from-yellow-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          {isRolling ? 'در حال چرخش...' : 'تاس بینداز'}
        </button>

        <ModernDice
          isRolling={isRolling}
          result={result ?? undefined}
          onRollComplete={handleRollComplete}
          diceType="d20"
          criticalHit={result === 20}
          criticalMiss={result === 1}
        />

        {result && (
          <div className="text-2xl text-white font-bold">
            آخرین نتیجه: {result}
          </div>
        )}
      </div>
    </div>
  );
};
