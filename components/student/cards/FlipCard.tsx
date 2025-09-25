"use client";
import { motion } from 'framer-motion';
import { useState, ReactNode } from 'react';

interface FlipCardProps {
  frontContent: ReactNode;
  backContent: ReactNode;
  className?: string;
}

export function FlipCard({ frontContent, backContent, className = "" }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className={`relative w-full h-48 cursor-pointer ${className}`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="absolute inset-0 w-full h-full"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.4 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front of card */}
        <div 
          className="absolute inset-0 w-full h-full bg-white border-2 border-quest-blue-200 rounded-game-lg p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow"
          style={{ backfaceVisibility: "hidden" }}
        >
          
          {frontContent}
          <div className="text-xs text-gray-500 mt-2">Click to reveal</div>
        </div>
        
        {/* Back of card */}
        <div 
          className="absolute inset-0 w-full h-full bg-quest-blue-50 border-2 border-quest-blue-200 rounded-game-lg p-4 flex flex-col items-center justify-center text-center shadow-sm"
          style={{ 
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
        >
        
          {backContent}
        </div>
      </motion.div>
    </div>
  );
}