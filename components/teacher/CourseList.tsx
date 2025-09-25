"use client";
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faChartLine, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { CourseData } from '@/interfaces';
import { CourseCard } from './CourseCard';

interface CourseListProps {
  courses: (CourseData & { id: string })[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  showActions?: boolean;
  onEditCourse?: (courseId: string) => void;
  onDeleteCourse?: (courseId: string) => void;
  onShareCourse?: (courseId: string) => void;
}

export const CourseList: React.FC<CourseListProps> = ({
  courses,
  loading,
  error,
  onRetry,
  showActions = false,
  onEditCourse,
  onDeleteCourse,
  onShareCourse
}) => {
  const router = useRouter();

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-xl mb-4">⚠️</div>
        <p className="text-gray-600 mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded transition-colors duration-150"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12 flex flex-col">
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">
          Ready to Create Your First Course?
        </h3>
        <p className="text-gray-600 text-lg max-w-md mx-auto mb-6">
          Transform your curriculum into an engaging learning experience that students will love!
        </p>
        <motion.button
          className="bg-gray-900 hover:bg-gray-800 w-fit mx-auto text-white font-medium py-3 px-6 rounded text-lg transition-all duration-150"
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
          onClick={() => router.push('/teacher/course/new')}
        >
          Create Your First Course
        </motion.button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Grid */}
      <div className="grid gap-6">
        {courses.map((course, index) => (
          <CourseCard
            key={course.id}
            course={course}
            index={index}
            showActions={showActions}
            onEdit={onEditCourse}
            onDelete={onDeleteCourse}
            onShare={onShareCourse}
          />
        ))}
      </div>

    </div>
  );
};
