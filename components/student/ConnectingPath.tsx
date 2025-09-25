"use client";
import { motion } from 'framer-motion';

interface ConnectingPathProps {
  isUnlocked: boolean;
  isCompleted: boolean;
}

export function ConnectingPath({ isUnlocked, isCompleted }: ConnectingPathProps) {
  const getPathColor = () => {
    if (isCompleted) return 'border-green-500';
    if (isUnlocked) return 'border-blue-400';
    return 'border-gray-300';
  };

  const getPathOpacity = () => {
    if (isCompleted) return 'opacity-100';
    if (isUnlocked) return 'opacity-70';
    return 'opacity-40';
  };

  return (
    <motion.div 
      className="relative flex items-center"
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Main dotted line */}
      <div 
        className={`
          w-24 h-0 border-t-2 border-dotted 
          ${getPathColor()} ${getPathOpacity()}
          transition-all duration-300
        `}
      />
      
      {/* Optional: Add small connecting circles for extra visual flair */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div 
          className={`
            w-1.5 h-1.5 rounded-full 
            ${isCompleted ? 'bg-green-500' : isUnlocked ? 'bg-blue-400' : 'bg-gray-300'}
            ${getPathOpacity()}
            transition-all duration-300
          `}
        />
      </div>
    </motion.div>
  );
}