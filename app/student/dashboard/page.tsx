"use client";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrophy,
  faFire,
  faStar,
  faRocket,
  faGamepad,
  faBook,
  faGraduationCap,
  faSpinner,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { CourseCard } from "@/components/student/CourseCard";
import { DailyMissions } from "@/components/student/DailyMissions";
import { LevelBadge } from "@/components/student/LevelBadge";
import { CourseService } from "@/services/courseService";
import { CourseData, StudentProgress } from "@/interfaces";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

function StudentDashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<
    Array<
      CourseData & {
        id: string;
        studentProgress?: StudentProgress;
        completedWeeks?: number;
        totalWeeks?: number;
      }
    >
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dailyMissionsCompleted, setDailyMissionsCompleted] = useState(0);

  const fetchStudentData = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);

      const [studentCourses, missions] = await Promise.all([
        CourseService.getStudentCourses(user.uid),
        CourseService.getDailyMissions(user.uid),
      ]);

      setCourses(studentCourses);

      // Count completed missions
      const completedCount = [
        missions.login,
        missions.question,
        missions.focus,
      ].filter((task) => task.completed).length;
      setDailyMissionsCompleted(completedCount);
    } catch (err: any) {
      console.error("Error fetching student data:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const refreshMissionCount = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const missions = await CourseService.getDailyMissions(user.uid);
      const completedCount = [
        missions.login,
        missions.question,
        missions.focus,
      ].filter((task) => task.completed).length;
      setDailyMissionsCompleted(completedCount);
    } catch (err) {
      console.error("Error refreshing mission count:", err);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Single Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Day Streak */}
          <motion.div
            className="bg-gradient-to-br from-orange-400 via-red-500 to-orange-600 rounded-game-lg p-6 shadow-lg text-white relative overflow-hidden"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.2 }}
            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(251, 146, 60, 0.3)" }}
          >
            <div className="absolute inset-0 bg-[url('/textures/noise.png')] opacity-10 pointer-events-none" />
            <div className="relative text-center mt-8">
              <motion.div
                className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm"
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <FontAwesomeIcon icon={faFire} className="text-2xl" />
              </motion.div>
              <h3 className="text-3xl font-bold mb-1">
                {user?.streak || 0}
              </h3>
              <p className="text-white/90 font-medium">Day Streak</p>
            
            </div>
          </motion.div>

          {/* Missions Complete */}
          <motion.div
            className="bg-gradient-to-br from-quest-blue-500 via-purple-600 to-quest-blue-700 rounded-game-lg p-6 shadow-lg text-white relative overflow-hidden"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)" }}
          >
            <div className="absolute inset-0 bg-[url('/textures/noise.png')] opacity-10 pointer-events-none" />
            <div className="relative text-center mt-8">
              <motion.div
                className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm"
                animate={{ 
                  y: [0, -3, 0],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <FontAwesomeIcon icon={faRocket} className="text-2xl" />
              </motion.div>
              <h3 className="text-3xl font-bold mb-1">
                {dailyMissionsCompleted}
              </h3>
              <p className="text-white/90 font-medium">Missions Complete</p>
              
            </div>
          </motion.div>

          {/* Player Level */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.2 }}
            className="lg:col-span-2"
          >
            <LevelBadge xp={user?.xp || 0} />
          </motion.div>

          {/* Daily Missions */}
          <motion.div
            className="lg:row-span-2 lg:row-start-1 lg:col-start-3"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <DailyMissions onMissionsUpdate={refreshMissionCount} />
          </motion.div>

          {/* My Courses */}
          <motion.div
            className="lg:col-span-3 bg-white rounded-lg p-8 shadow-sm border border-gray-200"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-semibold text-gray-900">
                My Courses
              </h2>
              <div className="text-sm text-gray-600">
                {courses.length} {courses.length === 1 ? "course" : "courses"}{" "}
                enrolled
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="text-4xl text-quest-blue-500 animate-spin mb-4"
                />
                <p className="text-gray-600">Loading your courses...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <FontAwesomeIcon
                  icon={faGamepad}
                  className="text-4xl text-red-300 mb-4"
                />
                <h3 className="text-xl font-semibold text-red-600 mb-2">
                  Error Loading Courses
                </h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-quest-blue-500 hover:bg-quest-blue-600 text-white font-medium py-2 px-4 rounded-game transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-12">
                <FontAwesomeIcon
                  icon={faGraduationCap}
                  className="text-4xl text-gray-300 mb-4"
                />
                <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                  No Courses Yet
                </h3>
                <p className="text-gray-600 text-lg max-w-md mx-auto mb-6">
                  You haven&apos;t been enrolled in any courses yet. Ask your
                  teacher for a course code to get started!
                </p>
                <div className="bg-quest-blue-50 border border-quest-blue-200 rounded-game p-4 max-w-md mx-auto">
                  <div className="text-sm text-quest-blue-800">
                    <strong>How to Join:</strong> Get a course code from your
                    teacher and ask them to add you to their class.
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {courses.map((course, index) => (
                  <CourseCard key={course.id} course={course} index={index} />
                ))}
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <ProtectedRoute requiredRole="student">
      <StudentDashboardContent />
    </ProtectedRoute>
  );
}
