"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar,
  faTrophy,
  faFire,
  faGem,
  faRocket,
  faMedal
} from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';

interface CelebrationAnimationProps {
  isVisible: boolean;
  type: 'week-complete' | 'badge-earned' | 'boss-defeated' | 'streak-milestone';
  title: string;
  description: string;
  onComplete: () => void;
}

export function CelebrationAnimation({ 
  isVisible, 
  type, 
  title, 
  description, 
  onComplete 
}: CelebrationAnimationProps) {
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, color: string}>>([]);

  useEffect(() => {
    if (isVisible) {
      // Generate random particles
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: ['text-yellow-400', 'text-orange-400', 'text-red-400', 'text-pink-400', 'text-purple-400'][Math.floor(Math.random() * 5)]
      }));
      setParticles(newParticles);

      // Auto-close after animation
      const timer = setTimeout(() => {
        onComplete();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  const getIcon = () => {
    switch (type) {
      case 'week-complete': return faStar;
      case 'badge-earned': return faTrophy;
      case 'boss-defeated': return faRocket;
      case 'streak-milestone': return faFire;
      default: return faMedal;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'week-complete': 
        return { bg: 'from-blue-400 to-purple-600', accent: 'text-blue-300' };
      case 'badge-earned': 
        return { bg: 'from-yellow-400 to-orange-600', accent: 'text-yellow-300' };
      case 'boss-defeated': 
        return { bg: 'from-red-500 to-purple-800', accent: 'text-red-300' };
      case 'streak-milestone': 
        return { bg: 'from-orange-400 to-red-600', accent: 'text-orange-300' };
      default: 
        return { bg: 'from-green-400 to-blue-600', accent: 'text-green-300' };
    }
  };

  const colors = getColors();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onComplete}
        >
          {/* Particle Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className={`absolute w-2 h-2 ${particle.color}`}
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  y: [-20, -100, -200],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 3,
                  delay: Math.random() * 2,
                  ease: "easeOut"
                }}
              >
                <FontAwesomeIcon icon={faStar} />
              </motion.div>
            ))}
          </div>

          {/* Main Celebration Card */}
          <motion.div
            className={`relative max-w-md mx-4 p-8 rounded-2xl shadow-2xl text-center overflow-hidden`}
            style={{
              background: `linear-gradient(135deg, var(--tw-gradient-stops))`
            }}
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 180, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              duration: 0.8
            }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-90`} />
            
            <div className="relative z-10">
              {/* Animated Icon */}
              <motion.div
                className="mb-6"
                initial={{ scale: 0, rotate: -360 }}
                animate={{ 
                  scale: [1, 1.2, 1], 
                  rotate: [0, 360, 720],
                }}
                transition={{
                  scale: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  },
                  rotate: {
                    duration: 3,
                    ease: "easeInOut"
                  }
                }}
              >
                <div className="w-24 h-24 mx-auto bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <FontAwesomeIcon 
                    icon={getIcon()} 
                    className="text-4xl text-white drop-shadow-lg"
                  />
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                className="text-3xl font-bold text-white mb-4 drop-shadow-lg"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                {title}
              </motion.h2>

              {/* Description */}
              <motion.p
                className="text-lg text-white text-opacity-90 mb-6 drop-shadow-sm"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                {description}
              </motion.p>

              {/* Floating Gems */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`absolute ${colors.accent}`}
                    style={{
                      left: `${20 + (i * 10)}%`,
                      top: `${20 + (i * 8)}%`,
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 0.8, 0],
                      y: [0, -30, -60],
                      x: [0, Math.random() * 40 - 20, Math.random() * 80 - 40],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 2.5,
                      delay: 0.5 + (i * 0.2),
                      ease: "easeOut"
                    }}
                  >
                    <FontAwesomeIcon icon={faGem} className="text-sm" />
                  </motion.div>
                ))}
              </div>

              {/* Continue Button */}
              <motion.button
                onClick={onComplete}
                className="px-6 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold rounded-full backdrop-blur-sm transition-all duration-200 border border-white border-opacity-20"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1, duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Continue
              </motion.button>
            </div>

            {/* Sparkle Effects */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            >
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={`sparkle-${i}`}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: Math.random() * 2,
                    repeat: Infinity,
                    repeatDelay: Math.random() * 3
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}