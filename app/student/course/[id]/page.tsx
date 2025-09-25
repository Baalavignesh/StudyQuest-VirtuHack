"use client";
import { motion } from "framer-motion";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faBook,
  faUser,
  faCalendarAlt,
  faClock,
  faGraduationCap,
  faSpinner,
  faTrophy,
  faFire,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { CourseService } from "@/services/courseService";
import { CourseData, StudentProgress, WeeklyContent } from "@/interfaces";
import { WeekLevelMap } from "@/components/student/WeekLevelMap";
import { BadgeSystem } from "@/components/student/BadgeSystem";
import { useEffect, useState } from "react";

function StudentCourseContent() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<(CourseData & { id: string }) | null>(
    null
  );
  const [studentProgress, setStudentProgress] =
    useState<StudentProgress | null>(null);
  const [weeklyContent, setWeeklyContent] = useState<WeeklyContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const courseId = params.id as string;

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId || !user?.uid) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch course details, student progress, and weekly content
        const [courseData, progressData, weeklyData] = await Promise.all([
          CourseService.getCourse(courseId),
          CourseService.getStudentProgress(courseId, user.uid),
          CourseService.getWeeklyContent(courseId),
        ]);

        if (!courseData) {
          setError("Course not found");
          return;
        }

        // Check if student is enrolled in this course
        if (!courseData.enrolled_students.includes(user.uid)) {
          setError("You are not enrolled in this course");
          return;
        }

        setCourse(courseData as CourseData & { id: string });
        setStudentProgress(progressData);
        setWeeklyContent(weeklyData || []);
      } catch (err: any) {
        console.error("Error fetching course data:", err);
        setError(err.message || "Failed to load course data");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, user?.uid]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "TBD";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getProgressPercentage = () => {
    if (!studentProgress) return 0;
    return Math.round(studentProgress.overall_progress || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon
            icon={faSpinner}
            className="text-6xl text-quest-blue-500 animate-spin mb-4"
          />
          <p className="text-gray-600 text-lg">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg p-8 border border-gray-200 shadow-sm max-w-md">
          <div className="text-gray-400 text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/student/dashboard")}
            className="bg-quest-blue-500 hover:bg-quest-blue-600 text-white font-medium py-2 px-4 rounded-game transition-colors duration-150"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={() => router.push("/student/dashboard")}
            className="flex items-center text-gray-600 hover:text-gray-900 font-medium mb-4 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to Dashboard
          </button>

          <div className="bg-white rounded-game-lg p-8 border border-gray-200 shadow-sm">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
              <div className="flex-1 mb-4 lg:mb-0">
                <h1 className="text-4xl font-semibold text-gray-900 mb-4">
                  {course.course_details.course_title}
                </h1>
                <div className="flex flex-wrap gap-2 text-sm text-gray-600 items-center">
                  <span className="inline-flex items-center bg-quest-blue-50 text-quest-blue-700 p-2 rounded-game border border-quest-blue-200">
                    <FontAwesomeIcon icon={faBook} className="w-3 h-3 mr-1" />
                    {course.course_details.subject}
                  </span>
                  <span className="inline-flex items-center bg-quest-blue-50 text-quest-blue-700 p-2 rounded-game border border-quest-blue-200">
                    <FontAwesomeIcon icon={faUser} className="w-3 h-3 mr-1" />
                    {course.class_information.teacher_name}
                  </span>

                  <span className="text-gray-400">•</span>
                  <span className="inline-flex items-center bg-gray-50 p-2 rounded-game">
                    <FontAwesomeIcon
                      icon={faGraduationCap}
                      className="w-3 h-3 mr-1"
                    />
                    {course.course_details.grade_level}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="inline-flex items-center bg-gray-50 p-2 rounded-game">
                    <FontAwesomeIcon icon={faClock} className="w-3 h-3 mr-1" />
                    {course.course_details.duration_weeks} weeks
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end ml-6">
                <div className="text-xs text-gray-500 mb-1">Course Code</div>
                <div className="font-mono text-sm font-medium text-gray-800 bg-gray-50 px-2 py-1 rounded border mb-4">
                  {course.course_code}
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {getProgressPercentage()}%
                  </div>
                  <div className="text-xs text-green-600">Complete</div>
                </div>
              </div>
            </div>

            {/* Progress Summary */}
            <motion.div
              className="mt-8 bg-blue-50 rounded-game p-4 border border-blue-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div>
                <div className="text-sm font-medium text-quest-blue-800 mb-1">
                  Overall Progress
                </div>
                <div className="text-xs text-quest-blue-600">
                  {studentProgress?.completed_weeks?.length || 0} of{" "}
                  {weeklyContent.length} weeks completed
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-300 rounded-full h-2">
                  <motion.div
                    className="bg-green-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        ((studentProgress?.completed_weeks?.length || 0) /
                          weeklyContent.length) *
                        100
                      }%`,
                    }}
                    transition={{ delay: 0.8, duration: 1 }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Course Level Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <WeekLevelMap
            courseId={courseId}
            weeks={weeklyContent}
            studentProgress={studentProgress || undefined}
            currentWeek={studentProgress?.current_week || 1}
            midtermWeek={course.exam_schedule?.midterm_week}
            finalExamWeek={course.exam_schedule?.final_exam_week}
          />
        </motion.div>

        {/* Badge System */}
        <BadgeSystem
          studentProgress={studentProgress || undefined}
          totalWeeks={weeklyContent.length}
        />
      </div>
    </div>
  );
}

export default function StudentCourse() {
  return (
    <ProtectedRoute requiredRole="student">
      <StudentCourseContent />
    </ProtectedRoute>
  );
}
