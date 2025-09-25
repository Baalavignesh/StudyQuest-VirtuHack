"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useState, ReactNode } from 'react';

interface SwipeableCardProps {
  items: any[];
  renderCard: (item: any, index: number) => ReactNode;
  title?: string;
  className?: string;
}

export function SwipeableCard({ items, renderCard, title, className = "" }: SwipeableCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };
  
  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-game-lg border border-gray-200 shadow-sm ${className} w-full p-4`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      
      <div className="relative p-6">
        {/* Navigation buttons */}
        {items.length > 1 && (
          <>
            <button
              onClick={prevCard}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-quest-blue-500 text-white rounded-full flex items-center justify-center hover:bg-quest-blue-600 transition-colors shadow-md"
              disabled={items.length <= 1}
            >
              <FontAwesomeIcon icon={faChevronLeft} className="text-sm" />
            </button>
            
            <button
              onClick={nextCard}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-quest-blue-500 text-white rounded-full flex items-center justify-center hover:bg-quest-blue-600 transition-colors shadow-md"
              disabled={items.length <= 1}
            >
              <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
            </button>
          </>
        )}

        {/* Card content */}
        <div className="mx-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="min-h-[200px] flex items-center justify-center"
            >
              {renderCard(items[currentIndex], currentIndex)}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress indicators */}
        {items.length > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex 
                    ? 'bg-quest-blue-500' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}

        {/* Counter */}
        {items.length > 1 && (
          <div className="text-center mt-2 text-sm text-gray-500">
            {currentIndex + 1} of {items.length}
          </div>
        )}
      </div>
    </div>
  );
}