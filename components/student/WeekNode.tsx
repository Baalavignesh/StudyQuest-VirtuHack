"use client";
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLock,
  faCheckCircle,
  faPlay,
  faStar,
  faSkull,
  faCrown
} from '@fortawesome/free-solid-svg-icons';

interface WeekNodeProps {
  weekNumber: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  isCurrentWeek: boolean;
  isBossWeek: boolean;
  onClick: () => void;
}

export function WeekNode({ 
  weekNumber, 
  isUnlocked, 
  isCompleted, 
  isCurrentWeek,
  isBossWeek,
  onClick 
}: WeekNodeProps) {
  const getNodeStyle = () => {
    if (isCompleted) {
      return isBossWeek 
        ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-700 text-white shadow-lg shadow-green-500/50' 
        : 'bg-green-500 border-green-600 text-white';
    }
    if (isCurrentWeek && isUnlocked) {
      return isBossWeek 
        ? 'bg-gradient-to-br from-purple-900 to-black border-red-600 text-white ring-4 ring-red-400 shadow-xl shadow-red-500/30' 
        : 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white ring-2 ring-blue-300 shadow-[0_0_18px_rgba(59,130,246,0.35)] border-transparent';
    }
    if (isUnlocked) {
      return isBossWeek 
        ? 'bg-gradient-to-br from-purple-800 to-gray-900 border-purple-700 text-white shadow-lg' 
        : 'bg-blue-400 border-blue-500 text-white';
    }
    return isBossWeek 
      ? 'bg-gray-800 border-gray-700 text-gray-500 shadow-md' 
      : 'bg-gray-300 border-gray-400 text-gray-600';
  };

  const getIconStyle = () => {
    if (isCompleted) return 'text-white';
    if (isUnlocked) return 'text-white';
    return 'text-gray-500';
  };

  const getIcon = () => {
    if (!isUnlocked) return faLock;
    if (isCompleted && isBossWeek) return faCrown;
    if (isCompleted) return faCheckCircle;
    if (isBossWeek) return faSkull;
    if (isCurrentWeek) return faStar;
    return faPlay;
  };

  const handleClick = () => {
    if (isUnlocked) {
      onClick();
    }
  };

  const getNodeSize = () => {
    return isBossWeek ? 'w-28 h-28' : 'w-20 h-20';
  };

  return (
    <div className="flex flex-col items-center">
      <motion.div
        className={`
          ${getNodeSize()} rounded-full border-3 flex flex-col items-center justify-center
          transition-all duration-300 transform
          ${getNodeStyle()}
          ${isUnlocked ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'}
          ${isBossWeek ? 'shadow-2xl' : 'shadow-md'}
        `}
        onClick={handleClick}
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          y: 0,
          ...(isCurrentWeek && !isBossWeek ? {
            boxShadow: [
              '0 0 14px rgba(59, 130, 246, 0.35)',
              '0 0 22px rgba(59, 130, 246, 0.55)',
              '0 0 14px rgba(59, 130, 246, 0.35)'
            ],
            transition: {
              boxShadow: {
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }
          } : {}),
          ...(isBossWeek && isCurrentWeek ? {
            boxShadow: [
              "0 0 20px rgba(239, 68, 68, 0.5)",
              "0 0 30px rgba(239, 68, 68, 0.8)",
              "0 0 20px rgba(239, 68, 68, 0.5)"
            ],
            transition: {
              boxShadow: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }
          } : {})
        }}
        transition={{ duration: 0.5, delay: weekNumber * 0.1 }}
        
        whileTap={isUnlocked ? { scale: 0.95 } : undefined}
      >
        <FontAwesomeIcon 
          icon={getIcon()} 
          className={`${isBossWeek ? 'text-2xl' : 'text-lg'} mb-1 ${getIconStyle()}`}
        />
        
        {isUnlocked && (
          <div className="text-xs font-bold">
            {weekNumber}
          </div>
        )}
      </motion.div>
      
      <motion.div
        className={`mt-3 text-sm font-medium text-center ${
          isBossWeek 
            ? (isUnlocked ? 'text-purple-800 font-bold' : 'text-gray-600') 
            : (isUnlocked ? 'text-gray-700' : 'text-gray-500')
        }`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: weekNumber * 0.1 + 0.2 }}
      >
        {isBossWeek ? 'BOSS' : 'Week'} {weekNumber}
      </motion.div>
      
      {isCurrentWeek && isUnlocked && !isCompleted && (
        <motion.div
          className={`mt-1 text-xs font-bold ${
            isBossWeek ? 'text-red-600' : 'text-blue-600'
          }`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: weekNumber * 0.1 + 0.4 }}
        >
          {isBossWeek ? 'CHALLENGE!' : 'Current'}
        </motion.div>
      )}
      
      {isCompleted && (
        <motion.div
          className={`mt-1 text-xs font-bold ${
            isBossWeek ? 'text-yellow-600' : 'text-green-600'
          }`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: weekNumber * 0.1 + 0.4 }}
        >
          {isBossWeek ? 'DEFEATED!' : 'Complete'}
        </motion.div>
      )}
    </div>
  );
}