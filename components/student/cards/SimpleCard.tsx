"use client";
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface SimpleCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: 'default' | 'primary' | 'success';
}

export function SimpleCard({ 
  title, 
  children, 
  className = "", 
  delay = 0,
  variant = 'default'
}: SimpleCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-quest-blue-50 border-quest-blue-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  return (
    <motion.div
      className={`rounded-game-lg border shadow-sm p-6 ${getVariantStyles()} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {title}
        </h3>
      )}
      {children}
    </motion.div>
  );
}