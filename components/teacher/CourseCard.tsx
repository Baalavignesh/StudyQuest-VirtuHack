"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faGraduationCap,
  faClock,
  faEye,
  faEdit,
  faShare,
  faTrash,
  faUserGraduate,
} from "@fortawesome/free-solid-svg-icons";
import { CourseData } from "@/interfaces";

interface CourseCardProps {
  course: CourseData & { id: string };
  index: number;
  onEdit?: (courseId: string) => void;
  onDelete?: (courseId: string) => void;
  onShare?: (courseId: string) => void;
  showActions?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  index,
  onEdit,
  onDelete,
  onShare,
  showActions = false,
}) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/teacher/course/${course.id}`);
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation(); // Prevent card click when clicking action buttons
    action();
  };

  return (
    <motion.div
      className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-pointer group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      onClick={handleCardClick}
    >
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors">
            {course.course_details.course_title}
          </h3>

          {/* Course Tags */}
          <div className="flex flex-wrap gap-2 text-sm text-gray-600 items-center">
            <span className="inline-flex items-center bg-gray-50 p-2 rounded-lg ">
              <FontAwesomeIcon icon={faBook} className="w-3 h-3 mr-1" />
              {course.course_details.subject}
            </span>
            <span className="text-gray-400">•</span>
            <span className="inline-flex items-center bg-gray-50 p-2 rounded-lg">
              <FontAwesomeIcon icon={faGraduationCap} className="w-3 h-3 mr-1" />
              {course.course_details.grade_level}
            </span>
            <span className="text-gray-400">•</span>
            <span className="inline-flex items-center bg-gray-50 p-2 rounded-lg">
              <FontAwesomeIcon icon={faClock} className="w-3 h-3 mr-1" />
              {course.course_details.duration_weeks} weeks
            </span>
            <span className="text-gray-400">•</span>
            <span className="inline-flex items-center bg-gray-50 p-2 rounded-lg">
              <FontAwesomeIcon icon={faUserGraduate} className="w-3 h-3 mr-1" />
              {course.student_count || 0} students
            </span>
          </div>
        </div>

        {/* Course Code */}
        <div className="text-right ml-6">
          <div className="text-xs text-gray-500 mb-1">Course Code</div>
          <div className="font-mono text-sm font-medium text-gray-800 bg-gray-50 px-2 py-1 rounded border">
            {course.course_code}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

