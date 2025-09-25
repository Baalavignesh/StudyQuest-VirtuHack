"use client";
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBook, 
  faUser, 
  faChartLine, 
  faCalendar,
  faPlay,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import { CourseData, StudentProgress } from '@/interfaces';
import { useRouter } from 'next/navigation';

interface CourseCardProps {
  course: CourseData & { 
    id: string; 
    studentProgress?: StudentProgress;
    completedWeeks?: number;
    totalWeeks?: number;
  };
  index: number;
}

export function CourseCard({ course, index }: CourseCardProps) {
  const router = useRouter();
  
  const { course_details, class_information, schedule } = course;
  const completedWeeks = course.completedWeeks ?? 0;
  const totalWeeks = course.totalWeeks ?? 0;
  
  const progressPercentage = totalWeeks > 0 
    ? Math.round((completedWeeks / totalWeeks) * 100) 
    : 0;

  const getNextActivity = () => {
    if (!completedWeeks || completedWeeks === 0) {
      return 'Start your learning journey';
    }
    
    if (completedWeeks < totalWeeks) {
      return `Continue with Week ${(completedWeeks + 1)}`;
    }
    
    return 'Course completed!';
  };

  const handleCourseClick = () => {
    router.push(`/student/course/${course.id}`);
  };

  // Generate a color theme based on subject
  const getSubjectColor = (subject: string) => {
    const colors = {
      'Mathematics': 'bg-blue-500',
      'Math': 'bg-blue-500',
      'Science': 'bg-green-500',
      'English': 'bg-purple-500',
      'History': 'bg-orange-500',
      'Geography': 'bg-teal-500',
      'Physics': 'bg-indigo-500',
      'Chemistry': 'bg-emerald-500',
      'Biology': 'bg-lime-500',
      'Art': 'bg-pink-500'
    };
    
    return colors[subject as keyof typeof colors] || 'bg-quest-blue-500';
  };

  return (
    <motion.div
      className="bg-white rounded-game-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-quest-blue-300 transition-all duration-200 cursor-pointer overflow-hidden"
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      onClick={handleCourseClick}
      whileTap={{ scale: 0.98 }}
    >
      {/* Course Header with Subject Color */}
      <div className={`${getSubjectColor(course.course_details.subject)} p-4 text-white relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <FontAwesomeIcon icon={faBook} className="text-2xl" />
            <span className="text-sm font-medium bg-white bg-opacity-20 px-2 py-1 rounded-full">
              {course.course_details.grade_level}
            </span>
          </div>
          <h3 className="text-xl font-semibold mb-1 line-clamp-2">
            {course.course_details.course_title}
          </h3>
          <p className="text-sm opacity-90">
            {course.course_details.subject}
          </p>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-6">
        {/* Teacher and Schedule Info */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faUser} className="mr-2" />
            <span>{course.class_information.teacher_name}</span>
          </div>
          {course.schedule?.class_days && (
            <div className="flex items-center">
              <FontAwesomeIcon icon={faCalendar} className="mr-2" />
              <span>{course.schedule.class_days.length} days/week</span>
            </div>
          )}
        </div>

        {/* Progress Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-semibold text-quest-blue-600">
              {progressPercentage}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div 
              className="bg-quest-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{completedWeeks} of {totalWeeks} weeks</span>
            {completedWeeks === totalWeeks && totalWeeks > 0 && (
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
            )}
          </div>
        </div>

        {/* Next Activity */}
        <div className="bg-quest-blue-50 rounded-game p-3 border border-quest-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-quest-blue-800 mb-1">
                Next Activity
              </div>
              <div className="text-xs text-quest-blue-600">
                {getNextActivity()}
              </div>
            </div>
            <FontAwesomeIcon 
              icon={progressPercentage === 100 ? faCheckCircle : faPlay} 
              className={`text-lg ${progressPercentage === 100 ? 'text-green-500' : 'text-quest-blue-500'}`}
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {course.studentProgress?.total_points || 0}
            </div>
            <div className="text-xs text-gray-500">XP Earned</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              1
            </div>
            <div className="text-xs text-gray-500">Day Streak</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}