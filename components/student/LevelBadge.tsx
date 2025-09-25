"use client";
import { motion } from 'framer-motion';
import { getPlayerLevel, getNextLevel, getProgressToNextLevel } from '@/utils/levelSystem';

interface LevelBadgeProps {
  xp: number;
  className?: string;
}

export function LevelBadge({ xp, className = '' }: LevelBadgeProps) {
  const currentLevel = getPlayerLevel(xp);
  const nextLevel = getNextLevel(xp);
  const progress = getProgressToNextLevel(xp);

  return (
    <motion.div
      className={`bg-white rounded-lg p-6 h-full shadow-sm border border-gray-200 col-span-2 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Your Level</h3>
        <div className="text-2xl">{currentLevel.icon}</div>
      </div>

      {/* Current Level Badge */}
      <div className={`inline-flex items-center px-4 py-4 rounded-full text-sm font-semibold mb-4 ${currentLevel.color} ${currentLevel.bgColor}`}>
        <span className="mr-2">{currentLevel.icon}</span>
        {currentLevel.name}
      </div>
<hr className="my-2" />
      {/* XP Display */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2 mt-4">
          <span className="text-sm text-gray-600">Total XP</span>
          <span className="text-lg font-bold text-gray-900">{xp.toLocaleString()}</span>
        </div>
      </div>

      {/* Progress to Next Level */}
      {nextLevel ? (
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              Next: {nextLevel.icon} {nextLevel.name}
            </span>
            <span className="text-xs text-gray-500">
              {progress.current} / {progress.required} XP
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <motion.div
              className="bg-gradient-to-r from-orange-400 to-orange-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            {Math.round(progress.percentage)}% to {nextLevel.name}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-sm font-medium text-yellow-600 mb-2">
            🎉 Maximum Level Achieved!
          </div>
          <div className="text-xs text-gray-500">
            You are a true Champion!
          </div>
        </div>
      )}
    </motion.div>
  );
}
