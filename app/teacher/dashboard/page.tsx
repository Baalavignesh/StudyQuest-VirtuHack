"use client";
import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faPlus, 
  faChartLine, 
  faTasks,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CourseService } from '@/services/courseService';
import { CourseData } from '@/interfaces';
import { CourseList, ViewStudents, Analytics } from '@/components/teacher';

type ViewType = 'dashboard' | 'students' | 'analytics';

function TeacherDashboardContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [courses, setCourses] = useState<(CourseData & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedCourseName, setSelectedCourseName] = useState<string>('');

  const fetchCourses = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      setError(null);
      const teacherCourses = await CourseService.getTeacherCourses(user.uid);
      setCourses(teacherCourses);
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleEditCourse = (courseId: string) => {
    // TODO: Navigate to course edit page
    router.push(`/teacher/course/${courseId}/edit`);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }
    
    try {
      await CourseService.deleteCourse(courseId);
      // Refresh the courses list
      fetchCourses();
    } catch (err: any) {
      console.error('Error deleting course:', err);
      alert('Failed to delete course. Please try again.');
    }
  };

  const handleShareCourse = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      // Copy course code to clipboard
      navigator.clipboard.writeText(course.course_code);
      alert(`Course code ${course.course_code} copied to clipboard!`);
    }
  };

  const handleViewStudents = () => {
    if (courses.length === 1) {
      // If only one course, go directly to it
      setSelectedCourseId(courses[0].id);
      setSelectedCourseName(courses[0].course_details.course_title);
      setCurrentView('students');
    } else if (courses.length > 1) {
      // If multiple courses, show course selection (for now, use first course)
      setSelectedCourseId(courses[0].id);
      setSelectedCourseName(courses[0].course_details.course_title);
      setCurrentView('students');
    }
  };

  const handleViewAnalytics = () => {
    if (courses.length === 1) {
      // If only one course, go directly to it
      setSelectedCourseId(courses[0].id);
      setSelectedCourseName(courses[0].course_details.course_title);
      setCurrentView('analytics');
    } else if (courses.length > 1) {
      // If multiple courses, show course selection (for now, use first course)
      setSelectedCourseId(courses[0].id);
      setSelectedCourseName(courses[0].course_details.course_title);
      setCurrentView('analytics');
    }
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedCourseId('');
    setSelectedCourseName('');
  };

  // Render different views based on currentView
  if (currentView === 'students') {
    return (
      <ViewStudents
        courseId={selectedCourseId}
        courseName={selectedCourseName}
        onBack={handleBackToDashboard}
      />
    );
  }

  if (currentView === 'analytics') {
    return (
      <Analytics
        courseId={selectedCourseId}
        courseName={selectedCourseName}
        onBack={handleBackToDashboard}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-quest-blue-50 via-quest-purple-50 to-quest-blue-100">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.button
            className="bg-white rounded-game-lg p-6 shadow-game hover:shadow-game-hover hover:scale-105 transition-all duration-150 border-l-4 border-quest-fire-500 text-left group"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.2 }}
            onClick={() => router.push('/teacher/course/new')}
          >
            <FontAwesomeIcon icon={faPlus} className="text-quest-fire-500 text-2xl mb-4 group-hover:scale-110 transition-transform duration-150" />
            <h3 className="text-lg font-bold text-quest-gray-800 mb-2">Create Course</h3>
            <p className="text-quest-gray-600 font-game text-sm">Start a new learning adventure</p>
          </motion.button>

          <motion.button
            className="bg-white rounded-game-lg p-6 shadow-game hover:shadow-game-hover transition-all duration-150 border-l-4 border-quest-success-500 text-left group"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.2 }}
            onClick={handleViewStudents}
            disabled={courses.length === 0}
          >
            <FontAwesomeIcon icon={faUsers} className="text-quest-success-500 text-2xl mb-4 group-hover:scale-110 transition-transform duration-150" />
            <h3 className="text-lg font-bold text-quest-gray-800 mb-2">View Students</h3>
            <p className="text-quest-gray-600 font-game text-sm">Monitor progress & analytics</p>
          </motion.button>

          <motion.button
            className="bg-white rounded-game-lg p-6 shadow-game hover:shadow-game-hover transition-all duration-150 border-l-4 border-quest-fire-600 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.2 }}
            onClick={handleViewAnalytics}
            disabled={courses.length === 0}
          >
            <FontAwesomeIcon icon={faChartLine} className="text-quest-fire-600 text-2xl mb-4 group-hover:scale-110 transition-transform duration-150" />
            <h3 className="text-lg font-bold text-quest-gray-800 mb-2">Analytics</h3>
            <p className="text-quest-gray-600 font-game text-sm">Track class performance</p>
          </motion.button>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Course Overview */}
          <motion.div
            className="lg:col-span-2 bg-white rounded-game-xl p-8 shadow-game"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-heading font-bold text-quest-gray-800">
                Your Courses
              </h2>
              <motion.button
                className="bg-quest-fire-500 hover:bg-quest-fire-600 text-white font-bold py-2 px-4 rounded-game transition-colors duration-150 flex items-center"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/teacher/course/new')}
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                New Course
              </motion.button>
            </div>
            
            <CourseList
              courses={courses}
              loading={loading}
              error={error}
              onRetry={fetchCourses}
              showActions={true}
              onEditCourse={handleEditCourse}
              onDeleteCourse={handleDeleteCourse}
              onShareCourse={handleShareCourse}
            />
          </motion.div>

          {/* Side Panel */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            {/* Recent Activity */}
            <div className="bg-white rounded-game-xl p-6 shadow-game">
              <h3 className="text-xl font-heading font-bold text-quest-gray-800 mb-4">
                Recent Activity
              </h3>
              <div className="text-center py-6">
                <FontAwesomeIcon icon={faChartLine} className="text-4xl text-quest-fire-300 mb-4" />
                <p className="text-quest-gray-600 font-game text-sm">
                  Activity will appear here once you create your first course and students start participating!
                </p>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-game-xl p-6 shadow-game">
              <h3 className="text-xl font-heading font-bold text-quest-gray-800 mb-4">
                Calendar
              </h3>
              <div className="text-center py-6">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-4xl text-quest-fire-300 mb-4" />
                <p className="text-quest-gray-600 font-game text-sm">
                  Schedule boss battles, exams, and special events to keep students engaged!
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function TeacherDashboard() {
  return (
    <ProtectedRoute requiredRole="teacher">
      <TeacherDashboardContent />
    </ProtectedRoute>
  );
}