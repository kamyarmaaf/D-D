import React from 'react';
import { Dice6 } from 'lucide-react';

export const DiceRoll: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 rounded-3xl p-8 sm:p-12 shadow-2xl mx-4 border-4 border-yellow-300/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin duration-500">
              <Dice6 className="h-16 w-16 sm:h-20 sm:w-20 text-white mx-auto mb-4 sm:mb-6 drop-shadow-lg" />
            </div>
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-300 rounded-full animate-ping"></div>
            <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-orange-300 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          </div>
          <p className="text-white text-xl sm:text-2xl font-black tracking-wide mb-2">در حال چرخش...</p>
          <div className="flex justify-center space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-white rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};