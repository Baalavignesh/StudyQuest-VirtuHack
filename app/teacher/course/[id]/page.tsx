"use client";
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Tooltip } from '@/components/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft,
  faBook,
  faUsers,
  faCalendarAlt,
  faClock,
  faGraduationCap,
  faChartLine,
  faEdit,
  faShare,
  faTasks,
  faCheckCircle,
  faExclamationCircle,
  faCog,
  faPlus,
  faEye,
  faUserGraduate
} from '@fortawesome/free-solid-svg-icons';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CourseService } from '@/services/courseService';
import { CourseData, WeeklyContent } from '@/interfaces';
import { useEffect, useState } from 'react';
import { AssignmentCreationModal } from '@/components/teacher/AssignmentCreationModal';
import { AddStudentModal } from '@/components/teacher/AddStudentModal';

function CourseDetailContent() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<(CourseData & { id: string }) | null>(null);
  const [weeklyContent, setWeeklyContent] = useState<(WeeklyContent & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'students' | 'analytics'>('overview');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<WeeklyContent | null>(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [enrolledStudents, setEnrolledStudents] = useState<Array<{
    uid: string;
    name: string;
    email: string;
    enrollmentDate?: any;
    progress?: number;
  }>>([]);

  const courseId = params.id as string;

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch course details, weekly content, and enrolled students in parallel
        const [courseData, weeklyData, studentsData] = await Promise.all([
          CourseService.getCourse(courseId),
          CourseService.getWeeklyContent(courseId),
          CourseService.getEnrolledStudents(courseId)
        ]);
        
        if (!courseData) {
          setError('Course not found');
          return;
        }
        
        // Check if user owns this course
        if (courseData.created_by !== user?.uid) {
          setError('You do not have permission to view this course');
          return;
        }
        
        setCourse(courseData as CourseData & { id: string });
        setWeeklyContent(weeklyData);
        setEnrolledStudents(studentsData);
      } catch (err: any) {
        console.error('Error fetching course data:', err);
        setError(err.message || 'Failed to load course data');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, user?.uid]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProgressPercentage = () => {
    if (!weeklyContent.length) return 0;
    const completedWeeks = weeklyContent.filter(week => 
      week.video.uploaded && 
      week.study_content?.created && 
      week.weekly_assignment.created
    ).length;
    return Math.round((completedWeeks / weeklyContent.length) * 100);
  };

  const handleCreateAssignment = (week: WeeklyContent) => {
    setSelectedWeek(week);
    setShowAssignmentModal(true);
  };

  const handleAssignmentCreated = async () => {
    // Refresh weekly content data after successful creation
    try {
      const weeklyData = await CourseService.getWeeklyContent(courseId);
      setWeeklyContent(weeklyData);
    } catch (err: any) {
      console.error('Error refreshing weekly content:', err);
    }
  };

  const fetchEnrolledStudents = async () => {
    try {
      const students = await CourseService.getEnrolledStudents(courseId);
      setEnrolledStudents(students);
    } catch (err: any) {
      console.error('Error fetching enrolled students:', err);
    }
  };

  const handleStudentAdded = async () => {
    // Refresh both course data and enrolled students
    try {
      const [courseData, students] = await Promise.all([
        CourseService.getCourse(courseId),
        CourseService.getEnrolledStudents(courseId)
      ]);
      
      if (courseData) {
        setCourse(courseData as CourseData & { id: string });
      }
      setEnrolledStudents(students);
    } catch (err: any) {
      console.error('Error refreshing data after student addition:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-300 mx-auto mb-4"></div>
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
            onClick={() => router.push('/teacher/dashboard')}
            className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded transition-colors duration-150"
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
            onClick={() => router.push('/teacher/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 font-medium mb-4 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to Dashboard
          </button>
          
          <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
              <div className="flex-1 mb-4 lg:mb-0">
                <h1 className="text-4xl font-semibold text-gray-900 mb-4">
                  {course.course_details.course_title}
                </h1>
                <div className="flex flex-wrap gap-2 text-sm text-gray-600 items-center">
                  <span className="inline-flex items-center bg-gray-50 p-2 rounded-lg">
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
              
              <div className="flex flex-col items-end ml-6">
                <div className="text-xs text-gray-500 mb-1">Course Code</div>
                <div className="font-mono text-sm font-medium text-gray-800 bg-gray-50 px-2 py-1 rounded border mb-4">
                  {course.course_code}
                </div>
                <div className="flex gap-2">
                  <Tooltip content="Coming Soon" position="bottom">
                    <motion.button
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded transition-colors duration-150 flex items-center cursor-not-allowed opacity-75"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <FontAwesomeIcon icon={faShare} className="mr-2" />
                      Share
                    </motion.button>
                  </Tooltip>
                  <Tooltip content="Coming Soon" position="bottom">
                    <motion.button
                      className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded transition-colors duration-150 flex items-center cursor-not-allowed opacity-75"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <FontAwesomeIcon icon={faEdit} className="mr-2" />
                      Edit
                    </motion.button>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg border">
                <div className="text-3xl font-semibold text-gray-900">
                  {course.student_count || 0}
                </div>
                <div className="text-sm text-gray-600">Enrolled Students</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border">
                <div className="text-3xl font-semibold text-gray-900">
                  {course.weekly_topics?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Total Weeks</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border">
                <div className="text-3xl font-semibold text-orange-600">
                  {getProgressPercentage()}%
                </div>
                <div className="text-sm text-gray-600">Content Ready</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border">
                <div className="text-3xl font-semibold text-gray-900">
                  {course.schedule.class_days?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Days per Week</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <div className="bg-white rounded-lg p-2 border border-gray-200 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'overview', label: 'Overview', icon: faEye },
                { id: 'content', label: 'Weekly Content', icon: faTasks },
                { id: 'students', label: 'Students', icon: faUsers },
                { id: 'analytics', label: 'Analytics', icon: faChartLine }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-4 py-2 rounded font-medium transition-all duration-150 ${
                    activeTab === tab.id
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <FontAwesomeIcon icon={tab.icon} className="mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Course Information */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    Course Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Class Details</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div><strong>Class Name:</strong> {course.class_information.class_name}</div>
                        <div><strong>Teacher:</strong> {course.class_information.teacher_name}</div>
                        <div><strong>Room:</strong> {course.class_information.room_number || 'TBD'}</div>
                        <div><strong>Max Students:</strong> {course.max_students}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Schedule</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div><strong>Start Date:</strong> {formatDate(course.schedule.start_date)}</div>
                        <div><strong>End Date:</strong> {formatDate(course.schedule.end_date)}</div>
                        <div><strong>Class Days:</strong> {course.schedule.class_days?.join(', ') || 'TBD'}</div>
                        <div><strong>Class Time:</strong> {course.schedule.class_time || 'TBD'}</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Side Panel */}
              <div className="space-y-6">


                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Content Progress
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Overall Progress</span>
                        <span>{getProgressPercentage()}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getProgressPercentage()}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex justify-between mb-1">
                        <span>Videos Uploaded:</span>
                        <span>{weeklyContent.filter(w => w.video.uploaded).length}/{weeklyContent.length}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Study Materials:</span>
                        <span>{weeklyContent.filter(w => w.study_content?.created).length}/{weeklyContent.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Assessments Ready:</span>
                        <span>{weeklyContent.filter(w => w.weekly_assignment.created).length}/{weeklyContent.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Weekly Content
                </h3>
                <Tooltip content="Coming Soon" position="bottom">
                  <button className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded transition-colors duration-150 flex items-center cursor-not-allowed opacity-75">
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Add Week
                  </button>
                </Tooltip>
              </div>
              
              <div className="space-y-4">
                {weeklyContent.map((week, index) => (
                  <motion.div
                    key={week.id}
                    className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          Week {week.week_number}: {week.topic}
                        </h4>
                        <p className="text-gray-600 text-sm mb-3">{week.description}</p>
                      </div>
                      <div className="flex gap-2 ml-4 flex-wrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          week.video.uploaded 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                        }`}>
                          <FontAwesomeIcon icon={week.video.uploaded ? faCheckCircle : faExclamationCircle} className="w-3 h-3 mr-1" />
                          Video
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          week.study_content?.created 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                        }`}>
                          <FontAwesomeIcon icon={week.study_content?.created ? faCheckCircle : faExclamationCircle} className="w-3 h-3 mr-1" />
                          Study Materials
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          week.weekly_assignment.created 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                        }`}>
                          <FontAwesomeIcon icon={week.weekly_assignment.created ? faCheckCircle : faExclamationCircle} className="w-3 h-3 mr-1" />
                          Assessment
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <strong className="text-gray-700">Video Status:</strong>
                        <div className={week.video.uploaded ? 'text-green-600' : 'text-gray-500'}>
                          {week.video.uploaded ? 'Uploaded' : 'Not uploaded'}
                        </div>
                      </div>
                      <div>
                        <strong className="text-gray-700">Study Materials:</strong>
                        <div className={week.study_content?.created ? 'text-green-600' : 'text-gray-500'}>
                          {week.study_content?.created ? 'Ready' : 'Not created'}
                        </div>
                      </div>
                      <div>
                        <strong className="text-gray-700">Assessment:</strong>
                        <div className={week.weekly_assignment.created ? 'text-green-600' : 'text-gray-500'}>
                          {week.weekly_assignment.created ? 'Ready' : 'Not created'}
                        </div>
                      </div>
                      <div>
                        <strong className="text-gray-700">Due Date:</strong>
                        <div className="text-gray-600">
                          {week.due_date || 'Not set'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-4 gap-2">
                      <Tooltip content="Coming Soon" position="top">
                        <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-1 px-3 rounded text-sm transition-colors duration-150 cursor-not-allowed opacity-75">
                          Upload Video
                        </button>
                      </Tooltip>
                      <button 
                        onClick={() => handleCreateAssignment(week)}
                        disabled={week.study_content?.created && week.weekly_assignment.created}
                        className={`font-medium py-1 px-3 rounded text-sm transition-colors duration-150 ${
                          week.study_content?.created && week.weekly_assignment.created
                            ? 'bg-green-100 text-green-700 cursor-not-allowed'
                            : 'bg-orange-500 hover:bg-orange-600 text-white'
                        }`}
                      >
                        {week.study_content?.created && week.weekly_assignment.created 
                          ? 'Content Ready' 
                          : 'Create Educational Content'
                        }
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Enrolled Students
                </h3>
                <div className="text-sm text-gray-600">
                  {course.student_count || 0} / {course.max_students} students
                </div>
              </div>
              
              {enrolledStudents.length === 0 ? (
                <div className="text-center py-12">
                  <FontAwesomeIcon icon={faUsers} className="text-4xl text-gray-300 mb-4" />
                  <h4 className="text-xl font-semibold text-gray-700 mb-2">
                    No Students Enrolled Yet
                  </h4>
                  
                  <motion.button 
                    onClick={() => setShowAddStudentModal(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded transition-colors duration-150 flex items-center mx-auto"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Add Students
                  </motion.button>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div></div>
                    <motion.button 
                      onClick={() => setShowAddStudentModal(true)}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded transition-colors duration-150 flex items-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FontAwesomeIcon icon={faPlus} className="mr-2" />
                      Add Student
                    </motion.button>
                  </div>
                  
                  <div className="space-y-3">
                    {enrolledStudents.map((student, index) => (
                      <motion.div
                        key={student.uid}
                        className="bg-gray-50 border border-gray-200 rounded-game p-4 hover:border-gray-300 transition-colors"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <FontAwesomeIcon icon={faUserGraduate} className="text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-600">{student.email}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">
                                Progress: {student.progress}%
                              </div>
                              <div className="text-xs text-gray-500">
                                {student.enrollmentDate ? 
                                  `Enrolled ${new Date(student.enrollmentDate.toDate()).toLocaleDateString()}` : 
                                  'Recently enrolled'
                                }
                              </div>
                            </div>
                            
                            <div className="w-16 h-2 bg-gray-200 rounded-full">
                              <div 
                                className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                                style={{ width: `${student.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Course Analytics
              </h3>
              
              <div className="text-center py-12">
                <FontAwesomeIcon icon={faChartLine} className="text-4xl text-gray-300 mb-4" />
                <h4 className="text-xl font-semibold text-gray-700 mb-2">
                  Analytics Coming Soon
                </h4>
                <p className="text-gray-600">
                  Detailed analytics and insights will be available once students start engaging with your course content.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        courseId={courseId}
        courseName={course?.course_details.course_title || 'Course'}
        onStudentAdded={handleStudentAdded}
      />

      {/* Assignment Creation Modal */}
      {selectedWeek && (
        <AssignmentCreationModal
          isOpen={showAssignmentModal}
          onClose={() => {
            setShowAssignmentModal(false);
            setSelectedWeek(null);
          }}
          weekData={{
            week_number: selectedWeek.week_number,
            topic: selectedWeek.topic,
            description: selectedWeek.description
          }}
          courseId={courseId}
          onSuccess={handleAssignmentCreated}
        />
      )}
    </div>
  );
}

export default function CourseDetail() {
  return (
    <ProtectedRoute requiredRole="teacher">
      <CourseDetailContent />
    </ProtectedRoute>
  );
}
