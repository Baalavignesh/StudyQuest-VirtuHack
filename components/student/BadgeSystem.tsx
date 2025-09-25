"use client";
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrophy,
  faMedal,
  faFire,
  faStar,
  faCrown,
  faShieldAlt,
  faRocket,
  faGem,
  faBolt
} from '@fortawesome/free-solid-svg-icons';
import { StudentProgress } from '@/interfaces';

interface BadgeSystemProps {
  studentProgress?: StudentProgress;
  totalWeeks: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  requirement: (progress: StudentProgress, totalWeeks: number) => boolean;
  isEarned: boolean;
  isNew?: boolean;
}

export function BadgeSystem({ studentProgress, totalWeeks }: BadgeSystemProps) {
  const getBadges = (): Badge[] => {
    const progress = studentProgress;
    if (!progress) return [];

    const badges: Badge[] = [
      {
        id: 'first-week',
        name: 'First Steps',
        description: 'Complete your first week',
        icon: faStar,
        color: 'text-blue-400',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        requirement: (p) => (p.completed_weeks?.length || 0) >= 1,
        isEarned: false
      },
      {
        id: 'streak-master',
        name: 'Streak Master',
        description: 'Maintain a 7-day streak',
        icon: faFire,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        requirement: (p) => (p.streaks?.current_streak || 0) >= 7,
        isEarned: false
      },
      {
        id: 'half-way',
        name: 'Half Way Hero',
        description: 'Complete 50% of the course',
        icon: faMedal,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        requirement: (p, total) => (p.completed_weeks?.length || 0) >= Math.ceil(total * 0.5),
        isEarned: false
      },
      {
        id: 'point-collector',
        name: 'Point Collector',
        description: 'Earn 1000+ XP points',
        icon: faGem,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        requirement: (p) => (p.total_points || 0) >= 1000,
        isEarned: false
      },
      {
        id: 'speed-demon',
        name: 'Speed Demon',
        description: 'Finish the course faster than 50% of students',
        icon: faBolt,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        requirement: (p) => (p.completed_weeks?.length || 0) > (p.current_week || 1) + 2,
        isEarned: false
      },
      {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Complete 5 weeks in a row',
        icon: faShieldAlt,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        requirement: (p) => (p.completed_weeks?.length || 0) >= 5,
        isEarned: false
      },
      {
        id: 'course-champion',
        name: 'Course Champion',
        description: 'Complete the entire course',
        icon: faCrown,
        color: 'text-gold-500',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-300',
        requirement: (p, total) => (p.completed_weeks?.length || 0) >= total,
        isEarned: false
      },
      {
        id: 'rocket-learner',
        name: 'Rocket Learner',
        description: 'Reach current week 5+',
        icon: faRocket,
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200',
        requirement: (p) => (p.current_week || 1) >= 5,
        isEarned: false
      }
    ];

    // Check which badges are earned
    return badges.map(badge => ({
      ...badge,
      isEarned: badge.requirement(progress, totalWeeks)
    }));
  };

  const badges = getBadges();
  const earnedBadges = badges.filter(badge => badge.isEarned);
  const totalBadges = badges.length;

  return (
    <motion.div 
      className="bg-white rounded-game-lg p-6 border border-gray-200 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
         Achievement Badges
        </h3>
        <div className="text-sm text-gray-600">
          {earnedBadges.length}/{totalBadges} earned
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badges.map((badge, index) => (
          <motion.div
            key={badge.id}
            className={`
              relative p-4 rounded-game border-2 text-center transition-all duration-300
              ${badge.isEarned 
                ? `${badge.bgColor} ${badge.borderColor} shadow-md hover:shadow-lg` 
                : 'bg-gray-50 border-gray-200 opacity-60'
              }
            `}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
            whileHover={badge.isEarned ? { 
              scale: 1.05,
              y: -2
            } : undefined}
          >
            {badge.isEarned && (
              <motion.div
                className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1 + index * 0.1, type: "spring", stiffness: 500 }}
              >
                <FontAwesomeIcon icon={faTrophy} className="text-white text-xs" />
              </motion.div>
            )}
            
            <motion.div
              animate={badge.isEarned ? {
                rotate: [0, -10, 10, 0],
                scale: [1, 1.1, 1]
              } : {}}
              transition={{
                duration: 2,
                repeat: badge.isEarned ? Infinity : 0,
                repeatDelay: 3,
                ease: "easeInOut"
              }}
            >
              <FontAwesomeIcon 
                icon={badge.icon} 
                className={`text-2xl mb-2 ${
                  badge.isEarned ? badge.color : 'text-gray-400'
                }`}
              />
            </motion.div>
            
            <h4 className={`font-semibold text-sm mb-1 ${
              badge.isEarned ? 'text-gray-800' : 'text-gray-500'
            }`}>
              {badge.name}
            </h4>
            
            <p className={`text-xs ${
              badge.isEarned ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {badge.description}
            </p>

            {badge.isEarned && (
              <motion.div
                className="absolute inset-0 rounded-game pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0, 0.3, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 4,
                  ease: "easeInOut"
                }}
                style={{
                  background: `radial-gradient(circle, ${badge.color.replace('text-', 'rgba(').replace('-500', ', 0.2)')} 0%, transparent 70%)`
                }}
              />
            )}
          </motion.div>
        ))}
      </div>

      {earnedBadges.length > 0 && (
        <motion.div
          className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-game"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.3 }}
        >
          <div className="flex items-center justify-center">
            <FontAwesomeIcon icon={faTrophy} className="text-yellow-500 mr-2" />
            <span className="text-sm font-medium text-yellow-800">
              Great job! You&apos;ve earned {earnedBadges.length} badge{earnedBadges.length !== 1 ? 's' : ''}!
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}