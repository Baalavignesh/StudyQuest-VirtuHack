"use client";
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, 
  faSpinner, 
  faUsers,
  faTrophy,
  faExclamationTriangle,
  faFire,
  faArrowLeft,
  faUserGraduate,
  faCheckCircle,
  faChartBar,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import { CourseService } from '@/services/courseService';

interface AnalyticsData {
  totalStudents: number;
  activeStudents: number;
  averageProgress: number;
  completionRate: number;
  averageScore: number;
  strugglingStudents: number;
  topPerformers: Array<{
    name: string;
    email: string;
    progress: number;
    totalPoints: number;
  }>;
  weeklyEngagement: Array<{
    week: number;
    completionCount: number;
    averageScore: number;
  }>;
}

interface AnalyticsProps {
  courseId: string;
  courseName: string;
  onBack: () => void;
}

export function Analytics({ courseId, courseName, onBack }: AnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CourseService.getCourseAnalytics(courseId);
      setAnalytics(data);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const getEngagementColor = (completionCount: number, totalStudents: number) => {
    const rate = totalStudents > 0 ? (completionCount / totalStudents) * 100 : 0;
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 60) return 'bg-blue-500';
    if (rate >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-quest-blue-50 via-quest-purple-50 to-quest-blue-100 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon
            icon={faSpinner}
            className="text-4xl text-quest-fire-500 animate-spin mb-4"
          />
          <p className="text-quest-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-quest-blue-50 via-quest-purple-50 to-quest-blue-100 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon
            icon={faChartLine}
            className="text-4xl text-red-300 mb-4"
          />
          <h3 className="text-xl font-semibold text-red-600 mb-2">
            Error Loading Analytics
          </h3>
          <p className="text-quest-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="bg-quest-fire-500 hover:bg-quest-fire-600 text-white font-medium py-2 px-4 rounded-game transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-quest-blue-50 via-quest-purple-50 to-quest-blue-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-4">
            <motion.button
              onClick={onBack}
              className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-quest-fire-500" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-heading font-bold text-quest-gray-800">
                Class Analytics
              </h1>
              <p className="text-quest-gray-600">{courseName}</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            className="bg-white rounded-game-lg p-6 shadow-game border-l-4 border-blue-500"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-quest-gray-600 text-sm">Total Students</p>
                <p className="text-2xl font-bold text-quest-gray-800">{analytics.totalStudents}</p>
              </div>
              <FontAwesomeIcon icon={faUsers} className="text-3xl text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-game-lg p-6 shadow-game border-l-4 border-green-500"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-quest-gray-600 text-sm">Active Students</p>
                <p className="text-2xl font-bold text-quest-gray-800">{analytics.activeStudents}</p>
                <p className="text-xs text-green-600">{analytics.completionRate}% completion</p>
              </div>
              <FontAwesomeIcon icon={faCheckCircle} className="text-3xl text-green-500" />
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-game-lg p-6 shadow-game border-l-4 border-quest-fire-500"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-quest-gray-600 text-sm">Average Progress</p>
                <p className="text-2xl font-bold text-quest-gray-800">{analytics.averageProgress}%</p>
              </div>
              <FontAwesomeIcon icon={faChartBar} className="text-3xl text-quest-fire-500" />
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-game-lg p-6 shadow-game border-l-4 border-red-500"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-quest-gray-600 text-sm">Need Help</p>
                <p className="text-2xl font-bold text-quest-gray-800">{analytics.strugglingStudents}</p>
                <p className="text-xs text-red-600">&lt;30% progress</p>
              </div>
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-3xl text-red-500" />
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top Performers */}
          <motion.div
            className="bg-white rounded-game-xl p-8 shadow-game"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <FontAwesomeIcon icon={faTrophy} className="text-2xl text-yellow-500" />
              <h3 className="text-xl font-heading font-bold text-quest-gray-800">
                Top Performers
              </h3>
            </div>
            
            {analytics.topPerformers.length === 0 ? (
              <div className="text-center py-8">
                <FontAwesomeIcon icon={faUserGraduate} className="text-4xl text-quest-gray-300 mb-4" />
                <p className="text-quest-gray-600">No students have made significant progress yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.topPerformers.map((student, index) => (
                  <div key={student.email} className="flex items-center justify-between p-4 bg-quest-gray-50 rounded-game">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-quest-gray-800">{student.name}</p>
                        <p className="text-sm text-quest-gray-600">{student.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-quest-gray-800">{student.progress}%</p>
                      <p className="text-xs text-quest-gray-600">{student.totalPoints} XP</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Weekly Engagement */}
          <motion.div
            className="bg-white rounded-game-xl p-8 shadow-game"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <FontAwesomeIcon icon={faFire} className="text-2xl text-quest-fire-500" />
              <h3 className="text-xl font-heading font-bold text-quest-gray-800">
                Weekly Engagement
              </h3>
            </div>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {analytics.weeklyEngagement.slice(0, 8).map((week) => (
                <div key={week.week} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-quest-gray-700">
                    Week {week.week}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-quest-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getEngagementColor(week.completionCount, analytics.totalStudents)}`}
                        style={{ 
                          width: `${analytics.totalStudents > 0 ? (week.completionCount / analytics.totalStudents) * 100 : 0}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm text-quest-gray-600 w-16 text-right">
                      {week.completionCount}/{analytics.totalStudents}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {analytics.weeklyEngagement.length === 0 && (
              <div className="text-center py-8">
                <FontAwesomeIcon icon={faChartLine} className="text-4xl text-quest-gray-300 mb-4" />
                <p className="text-quest-gray-600">No engagement data available yet.</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* In Depth Analysis Section */}
        <motion.div
          className="mt-8 bg-white rounded-game-xl shadow-game overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <div className="bg-gradient-to-r from-quest-fire-500 to-quest-fire-600 p-6">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faChartLine} className="text-2xl text-white" />
              <h3 className="text-2xl font-heading font-bold text-white">
                In Depth Analysis
              </h3>
            </div>
            <p className="text-quest-fire-100 mt-2">
              Advanced analytics and predictive insights for your class
            </p>
          </div>
          
          <div className="p-12">
            <div className="text-center max-w-md mx-auto">
              <div className="w-20 h-20 bg-quest-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FontAwesomeIcon icon={faChartBar} className="text-3xl text-quest-gray-400" />
              </div>
              <h4 className="text-2xl font-semibold text-quest-gray-800 mb-4">
                Advanced Analytics Suite
              </h4>
              <p className="text-quest-gray-600 text-lg leading-relaxed mb-6">
                Get detailed insights into learning patterns, predictive performance analytics, 
                personalized intervention recommendations, and AI-powered teaching suggestions.
              </p>
              <div className="inline-flex items-center gap-2 bg-quest-fire-50 text-quest-fire-700 px-6 py-3 rounded-game-lg font-medium">
                <FontAwesomeIcon icon={faClock} className="text-quest-fire-500" />
                Coming Soon
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}