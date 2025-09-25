"use client";
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrophy, 
  faMedal, 
  faSpinner, 
  faStar, 
  faFire,
  faCrown
} from '@fortawesome/free-solid-svg-icons';
import { CourseService } from '@/services/courseService';
import { useAuth } from '@/contexts/AuthContext';
import { getPlayerLevel } from '@/utils/levelSystem';

type LeaderboardEntry = {
  uid: string;
  displayName: string;
  xp: number;
  streak: number;
  rank: number;
};

interface LeaderboardProps {
  limit?: number;
}

export function Leaderboard({ limit = 10 }: LeaderboardProps) {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CourseService.getGlobalLeaderboard(limit);
      setLeaderboard(data);
    } catch (err: any) {
      console.error('Failed to fetch leaderboard:', err);
      setError(err.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return { icon: faCrown, color: 'text-yellow-500' };
      case 2:
        return { icon: faMedal, color: 'text-gray-400' };
      case 3:
        return { icon: faMedal, color: 'text-amber-600' };
      default:
        return { icon: faStar, color: 'text-gray-400' };
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-500 to-amber-600 text-white';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-center py-8">
          <FontAwesomeIcon icon={faSpinner} className="text-2xl text-gray-400 animate-spin mr-3" />
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchLeaderboard}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
            <FontAwesomeIcon icon={faTrophy} className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Global Leaderboard</h3>
            <p className="text-sm text-gray-600">Top students by experience points</p>
          </div>
        </div>
      </div>

      {/* Leaderboard List */}
      {leaderboard.length === 0 ? (
        <div className="text-center py-8">
          <FontAwesomeIcon icon={faTrophy} className="text-4xl text-gray-300 mb-4" />
          <p className="text-gray-600">No students found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((student, index) => {
            const { icon, color } = getRankIcon(student.rank);
            const isCurrentUser = user?.uid === student.uid;
            const playerLevel = getPlayerLevel(student.xp);
            
            return (
              <motion.div
                key={student.uid}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                  isCurrentUser 
                    ? 'bg-blue-50 border-blue-200 shadow-sm' 
                    : 'bg-gray-50 border-gray-200 hover:shadow-sm'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center gap-4">
                  {/* Rank Badge */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankBadge(student.rank)}`}>
                    {student.rank <= 3 ? (
                      <FontAwesomeIcon icon={icon} className={`w-3 h-3 ${student.rank === 1 ? 'text-yellow-100' : ''}`} />
                    ) : (
                      student.rank
                    )}
                  </div>

                  {/* Student Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold ${isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
                        {student.displayName}
                        {isCurrentUser && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                            You
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <FontAwesomeIcon icon={faTrophy} className="w-3 h-3 text-orange-500" />
                        <span className="font-medium">{student.xp.toLocaleString()} XP</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <FontAwesomeIcon icon={faFire} className="w-3 h-3 text-orange-500" />
                        <span>{student.streak}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rank Position */}
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    student.rank === 1 ? 'text-yellow-600' : 
                    student.rank === 2 ? 'text-gray-600' : 
                    student.rank === 3 ? 'text-amber-600' : 'text-gray-500'
                  }`}>
                    #{student.rank}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

    </motion.div>
  );
}
