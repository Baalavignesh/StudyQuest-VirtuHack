"use client";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay, faSpinner, faTrophy } from '@fortawesome/free-solid-svg-icons';
import { DailyMissionStatus } from '@/interfaces';
import { CourseService } from '@/services/courseService';
import { AuthService } from '@/services/auth';
import { useAuth } from '@/contexts/AuthContext';
import { DailyMissionCard } from './DailyMissionCard';

interface DailyMissionsProps {
  onMissionsUpdate?: () => void;
}

export function DailyMissions({ onMissionsUpdate }: DailyMissionsProps) {
  const { user, refreshUser } = useAuth();
  const [missions, setMissions] = useState<DailyMissionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingTask, setCompletingTask] = useState<string | null>(null);

  useEffect(() => {
    if (user?.uid) {
      fetchMissions();
      // Auto-complete login mission on first load
      autoCompleteLoginMission();
    }
  }, [user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMissions = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);
      const missionData = await CourseService.getDailyMissions(user.uid);
      setMissions(missionData);
    } catch (err: any) {
      console.error('Failed to fetch missions:', err);
      setError(err.message || 'Failed to load daily missions');
    } finally {
      setLoading(false);
    }
  };

  const autoCompleteLoginMission = async () => {
    if (!user?.uid) return;

    try {
      // Check if login mission is already completed today
      const currentMissions = await CourseService.getDailyMissions(user.uid);
      if (!currentMissions.login.completed) {
        await CourseService.completeDailyMissionTask(user.uid, 'login');
        
        // Refresh user data to update streak in the UI
        await AuthService.refreshUserData(user.uid);
        refreshUser();
        
        // Refresh missions to show updated state
        await fetchMissions();
        
        // Notify parent component to update mission count
        if (onMissionsUpdate) {
          onMissionsUpdate();
        }
      }
    } catch (err) {
      console.error('Failed to auto-complete login mission:', err);
    }
  };

  const handleCompleteTask = async (taskType: 'login' | 'question' | 'focus', data?: any) => {
    if (!user?.uid || completingTask) return;

    setCompletingTask(taskType);
    try {
      const updatedMissions = await CourseService.completeDailyMissionTask(user.uid, taskType, data);
      setMissions(updatedMissions);
      
      // Refresh user data to update XP and streak in the UI
      await AuthService.refreshUserData(user.uid);
      refreshUser();
      
      // Notify parent component to update mission count
      if (onMissionsUpdate) {
        onMissionsUpdate();
      }
    } catch (err: any) {
      console.error(`Failed to complete ${taskType} mission:`, err);
      // You might want to show a toast notification here
    } finally {
      setCompletingTask(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <FontAwesomeIcon icon={faSpinner} className="text-2xl text-gray-400 animate-spin mr-3" />
          <p className="text-gray-600">Loading daily missions...</p>
        </div>
      </div>
    );
  }

  if (error || !missions) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">{error || 'No missions available'}</p>
          <button
            onClick={fetchMissions}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalCompleted = [missions.login, missions.question, missions.focus].filter(task => task.completed).length;
  const totalTasks = 3;

  return (
    <motion.div
      className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <FontAwesomeIcon icon={faCalendarDay} className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Daily Missions</h2>
            <p className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faTrophy} className="text-orange-500 w-4 h-4" />
          <span className="text-sm font-medium text-gray-700">
            {totalCompleted}/{totalTasks} Complete
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Daily Progress</span>
          <span>{Math.round((totalCompleted / totalTasks) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(totalCompleted / totalTasks) * 100}%` }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        </div>
      </div>

      {/* Mission Cards */}
      <div className="space-y-4">
        <DailyMissionCard
          type="login"
          task={missions.login}
          onComplete={() => handleCompleteTask('login')}
          loading={completingTask === 'login'}
        />

        <DailyMissionCard
          type="question"
          task={missions.question}
          onComplete={(data) => handleCompleteTask('question', data)}
          loading={completingTask === 'question'}
        />

        <DailyMissionCard
          type="focus"
          task={missions.focus}
          onComplete={(data) => handleCompleteTask('focus', data)}
          loading={completingTask === 'focus'}
        />
      </div>

      {/* Completion Message */}
      {totalCompleted === totalTasks && (
        <motion.div
          className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faTrophy} className="text-green-600 w-5 h-5" />
            <div>
              <p className="font-semibold text-green-800">All missions completed!</p>
              <p className="text-sm text-green-700">
                You earned {missions.totalXpAwarded} XP today. Great job! 🎉
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
