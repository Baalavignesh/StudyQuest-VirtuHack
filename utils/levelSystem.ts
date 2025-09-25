export interface PlayerLevel {
  name: string;
  minXp: number;
  maxXp: number;
  color: string;
  bgColor: string;
  icon: string;
}

export const LEVEL_TIERS: PlayerLevel[] = [
  {
    name: 'Beginner',
    minXp: 0,
    maxXp: 99,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: '🌱'
  },
  {
    name: 'Intermediate',
    minXp: 100,
    maxXp: 499,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: '⚡'
  },
  {
    name: 'Expert',
    minXp: 500,
    maxXp: 1499,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: '🔥'
  },
  {
    name: 'Legend',
    minXp: 1500,
    maxXp: 3999,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    icon: '⭐'
  },
  {
    name: 'Master',
    minXp: 4000,
    maxXp: 9999,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: '👑'
  },
  {
    name: 'Champion',
    minXp: 10000,
    maxXp: Infinity,
    color: 'text-yellow-600',
    bgColor: 'bg-gradient-to-r from-yellow-100 to-amber-100',
    icon: '🏆'
  }
];

export function getPlayerLevel(xp: number): PlayerLevel {
  for (const level of LEVEL_TIERS) {
    if (xp >= level.minXp && xp <= level.maxXp) {
      return level;
    }
  }
  // Fallback to Beginner if something goes wrong
  return LEVEL_TIERS[0];
}

export function getNextLevel(xp: number): PlayerLevel | null {
  const currentLevel = getPlayerLevel(xp);
  const currentIndex = LEVEL_TIERS.findIndex(level => level.name === currentLevel.name);
  
  if (currentIndex < LEVEL_TIERS.length - 1) {
    return LEVEL_TIERS[currentIndex + 1];
  }
  
  return null; // Already at max level
}

export function getProgressToNextLevel(xp: number): {
  current: number;
  required: number;
  percentage: number;
} {
  const nextLevel = getNextLevel(xp);
  if (!nextLevel) {
    return { current: 0, required: 0, percentage: 100 };
  }
  
  const currentLevel = getPlayerLevel(xp);
  const progressInCurrentLevel = xp - currentLevel.minXp;
  const totalXpNeededForNextLevel = nextLevel.minXp - currentLevel.minXp;
  
  return {
    current: progressInCurrentLevel,
    required: totalXpNeededForNextLevel,
    percentage: Math.min(100, (progressInCurrentLevel / totalXpNeededForNextLevel) * 100)
  };
}
