"use client";
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft,
  faBook,
  faPlay,
  faCheckCircle,
  faSpinner,
  faLock,
  faVideo,
  faClock,
  faQuestionCircle,
  faFlagCheckered,
  faArrowRight,
  faLightbulb
} from '@fortawesome/free-solid-svg-icons';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CourseService } from '@/services/courseService';
import { CourseData, StudentProgress, WeeklyContent } from '@/interfaces';
import { useEffect, useState } from 'react';
import { StudyContentCards } from '@/components/student/cards/StudyContentCards';
import { PracticeCards } from '@/components/student/cards/PracticeCards';
import { ResourcesCard } from '@/components/student/cards/ResourcesCard';
import { SimpleCard } from '@/components/student/cards/SimpleCard';




function QuizSection({ 
  weekNumber, 
  courseId, 
  hasQuiz, 
  isWeekCompleted,
  videoWatched 
}: { 
  weekNumber: number;
  courseId: string;
  hasQuiz: boolean;
  isWeekCompleted: boolean;
  videoWatched: boolean;
}) {
  const router = useRouter();
  
  const handleStartQuiz = () => {
    router.push(`/student/course/${courseId}/week/${weekNumber}/quiz`);
  };

  if (!hasQuiz) {
    return (
      <motion.div
        className="relative rounded-game-xl bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 text-gray-800 shadow-lg overflow-hidden border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.3 }}
      >
        <div className="absolute inset-0 bg-[url('/textures/noise.png')] opacity-[0.04]" aria-hidden="true"></div>
        <div className="relative z-10 px-6 py-8 lg:px-10 lg:py-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-inner">
              <FontAwesomeIcon icon={faQuestionCircle} className="text-gray-500 text-xl" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold">Week {weekNumber} Quiz Mission</h3>
              <p className="text-gray-600 mt-2 text-sm">
                Your teacher is preparing this week&apos;s challenge. Check back soon to test your skills!
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const headerBadge = isWeekCompleted ? 'Mission Complete' : 'Final Challenge';
  const subtitle = isWeekCompleted
    ? 'Revisit the mission to review your answers and lock in your learning.'
    : 'Face the final challenge and show how much you’ve learned this week.';
  const actionLabel = isWeekCompleted ? 'Review Quiz' : 'Start Quiz';

  return (
    <motion.div
      className="relative rounded-game-xl bg-gradient-to-br from-quest-blue-500 via-quest-purple-500 to-quest-blue-700 text-white shadow-xl overflow-hidden border border-transparent"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.3 }}
      whileHover={{ translateY: -4, boxShadow: '0 18px 45px rgba(59,130,246,0.25)' }}
    >
      <div className="absolute inset-0 bg-[url('/textures/noise.png')] opacity-[0.08] pointer-events-none" aria-hidden="true"></div>
      <div className="relative z-10 px-6 py-9 lg:px-10 lg:py-12 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 text-xs font-semibold uppercase tracking-wide backdrop-blur-sm">
              {headerBadge}
            </span>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-inner">
                <FontAwesomeIcon icon={isWeekCompleted ? faCheckCircle : faQuestionCircle} className="text-xl" />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold">Week {weekNumber} Quiz Mission</h3>
                <p className="text-white/85 text-sm md:text-base mt-2 leading-relaxed">
                  {subtitle}
                </p>
              </div>
            </div>
          </div>

          <motion.button
            onClick={handleStartQuiz}
            className="inline-flex items-center justify-center font-semibold px-5 py-3 rounded-game bg-white text-quest-blue-600 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-white/95"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <FontAwesomeIcon icon={faArrowRight} className="mr-2" />
            {actionLabel}
          </motion.button>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 bg-white/10 border border-white/15 rounded-game-lg p-6 backdrop-blur-sm">
          <div className="lg:col-span-3 space-y-4">
            <h5 className="font-semibold text-sm uppercase tracking-wide text-white/80 mb-3">Mission Checklist</h5>
            <div className="space-y-3">
              <div className={`flex items-center rounded-game px-4 py-3 transition-all duration-200 ${videoWatched ? 'bg-white/15 text-white' : 'bg-white/10 text-white/80'}`}>
                <FontAwesomeIcon
                  icon={videoWatched ? faCheckCircle : faVideo}
                  className={`mr-3 w-4 h-4 ${videoWatched ? 'text-green-300' : 'text-white/60'}`}
                />
                <span className="text-sm font-medium">
                  Watch the lesson video
                </span>
              </div>
              <div className="flex items-center rounded-game px-4 py-3 bg-white/15 text-white transition-all duration-200">
                <FontAwesomeIcon icon={faCheckCircle} className="mr-3 w-4 h-4 text-green-300" />
                <span className="text-sm font-medium">
                  Review study materials
                </span>
              </div>
            </div>
            {!videoWatched && (
              <div className="mt-4 p-3 bg-amber-500/15 border border-amber-400/20 rounded-game">
                <p className="text-xs text-amber-200 flex items-center">
                  <FontAwesomeIcon icon={faLightbulb} className="mr-2 w-3 h-3" />
                  Tip: watching the lesson video first can boost your score.
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 h-fit mt-10">
            <div className="bg-white/12 border border-white/20 rounded-game-lg p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faFlagCheckered} className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white/90 mb-1">
                    {isWeekCompleted ? 'Mission Debrief' : 'Mission Rewards'}
                  </p>
                  <p className="text-xs text-white/75 leading-relaxed">
                    {isWeekCompleted
                      ? 'Review the quiz to reinforce mastery and track your growth.'
                      : 'Beat the quiz to earn XP and climb the leaderboard!'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StudentWeekContent() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<(CourseData & { id: string }) | null>(null);
  const [studentProgress, setStudentProgress] = useState<StudentProgress | null>(null);
  const [weekContent, setWeekContent] = useState<WeeklyContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [lockedReason, setLockedReason] = useState<'progress' | 'unreleased' | null>(null);
  const [lockedMessage, setLockedMessage] = useState<string | null>(null);

  const courseId = params.id as string;
  const weekNumber = parseInt(params.weekNumber as string);

  useEffect(() => {
    const fetchWeekData = async () => {
      if (!courseId || !user?.uid || !weekNumber) return;
      
      try {
        setLoading(true);
        setError(null);
        setAccessDenied(false);
        
        // Fetch course details and student progress
        const [courseData, progressData, weeklyData] = await Promise.all([
          CourseService.getCourse(courseId),
          CourseService.getStudentProgress(courseId, user.uid),
          CourseService.getWeeklyContent(courseId)
        ]);
        
        if (!courseData) {
          setError('Course not found');
          return;
        }
        
        if (!courseData.enrolled_students.includes(user.uid)) {
          setError('You are not enrolled in this course');
          return;
        }

        setCourse(courseData as CourseData & { id: string });
        setStudentProgress(progressData);

        const weekContent = weeklyData?.find((week) => week.week_number === weekNumber) || null;
        const isWeekReleased = Boolean(
          weekContent && (
            weekContent.study_content?.created ||
            weekContent.weekly_assignment?.created ||
            weekContent.video?.uploaded
          )
        );

        if (!weekContent || !isWeekReleased) {
          setWeekContent(null);
          setAccessDenied(true);
          setLockedReason('unreleased');
          setLockedMessage(`Week ${weekNumber} is waiting for your teacher to publish the lesson.`);
          return;
        }

        const currentWeek = progressData?.current_week || 1;

        if (weekNumber > currentWeek) {
          setWeekContent(null);
          setAccessDenied(true);
          setLockedReason('progress');
          setLockedMessage(
            `You need to complete the previous weeks to unlock Week ${weekNumber}. Your current access goes up to Week ${currentWeek}.`
          );
          return;
        }

        setAccessDenied(false);
        setLockedReason(null);
        setLockedMessage(null);
        setWeekContent(weekContent);
        
      } catch (err: any) {
        console.error('Error fetching week data:', err);
        setError(err.message || 'Failed to load week data');
      } finally {
        setLoading(false);
      }
    };

    fetchWeekData();
  }, [courseId, user?.uid, weekNumber]);

  const isWeekCompleted = () => {
    return studentProgress?.completed_weeks?.includes(weekNumber) || false;
  };

  const isCurrentWeek = () => {
    return (studentProgress?.current_week || 1) === weekNumber && !isWeekCompleted();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="text-6xl text-quest-blue-500 animate-spin mb-4" />
          <p className="text-gray-600 text-lg">Loading week content...</p>
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
            onClick={() => router.push(`/student/course/${courseId}`)}
            className="bg-quest-blue-500 hover:bg-quest-blue-600 text-white font-medium py-2 px-4 rounded-game transition-colors duration-150"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    const icon = lockedReason === 'unreleased' ? faClock : faLock;
    const title = lockedReason === 'unreleased' ? 'Week Not Released' : 'Week Locked';
    const description =
      lockedMessage ??
      `You need to complete the previous weeks to unlock Week ${weekNumber}. Your current progress allows access up to Week ${studentProgress?.current_week || 1}.`;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg p-8 border border-gray-200 shadow-sm max-w-md">
          <FontAwesomeIcon
            icon={icon}
            className={`text-6xl mb-4 ${lockedReason === 'unreleased' ? 'text-quest-blue-500' : 'text-gray-400'}`}
          />
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">{title}</h2>
          <p className="text-gray-600 mb-6">{description}</p>
          <button
            onClick={() => router.push(`/student/course/${courseId}`)}
            className="bg-quest-blue-500 hover:bg-quest-blue-600 text-white font-medium py-2 px-4 rounded-game transition-colors duration-150"
          >
            Back to Course Map
          </button>
        </div>
      </div>
    );
  }

  if (!course || !weekContent) {
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
            onClick={() => router.push(`/student/course/${courseId}`)}
            className="flex items-center text-gray-600 hover:text-gray-900 font-medium mb-4 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to Course Map
          </button>
          
          <div className="bg-white rounded-game-lg p-8 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center mr-4
                    ${isWeekCompleted() 
                      ? 'bg-green-500 text-white' 
                      : isCurrentWeek() 
                        ? 'bg-quest-blue-500 text-white' 
                        : 'bg-quest-blue-400 text-white'
                    }
                  `}>
                    <FontAwesomeIcon 
                      icon={isWeekCompleted() ? faCheckCircle : isCurrentWeek() ? faPlay : faBook} 
                      className="text-xl"
                    />
                  </div>
                  <div>
                    <h1 className="text-3xl font-semibold text-gray-900">
                      Welcome to Week {weekNumber}
                    </h1>
                    <p className="text-gray-600">
                      {course.course_details.course_title}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {isWeekCompleted() && (
                  <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                    <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                    Completed
                  </div>
                )}
                {isCurrentWeek() && (
                  <div className="flex items-center text-quest-blue-600 bg-quest-blue-50 px-3 py-1 rounded-full text-sm font-medium">
                    <FontAwesomeIcon icon={faPlay} className="mr-2" />
                    Current Week
                  </div>
                )}
              </div>
            </div>

            {weekContent.topic && (
              <div className="bg-quest-blue-50 border border-quest-blue-200 rounded-game p-4">
                <h2 className="text-xl font-semibold text-quest-blue-800 mb-2">
                  {weekContent.topic}
                </h2>
                {weekContent.description && (
                  <p className="text-quest-blue-700">{weekContent.study_content.lesson_content?.introduction}</p>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Week Content */}
        <div className="space-y-6">
          {weekContent.study_content.created ? (
            <>
              {/* Video Content Section */}
              {weekContent.video.uploaded && (
                <SimpleCard delay={0.2}>
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-quest-blue-500 rounded-full flex items-center justify-center mr-3">
                      <FontAwesomeIcon icon={faVideo} className="text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Week {weekNumber} Video Lesson
                    </h3>
                    {weekContent.video.video_duration && (
                      <span className="ml-auto flex items-center text-sm text-gray-600">
                        <FontAwesomeIcon icon={faClock} className="mr-1" />
                        {Math.ceil(weekContent.video.video_duration / 60)} min
                      </span>
                    )}
                  </div>
                  
                  <div className="bg-gray-100 rounded-game h-48 flex items-center justify-center">
                    {weekContent.video.video_url ? (
                      <div className="w-full h-full bg-black rounded-game flex items-center justify-center">
                        <FontAwesomeIcon icon={faPlay} className="text-white text-3xl" />
                        <span className="text-white ml-3 text-sm">Video Player Coming Soon</span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <FontAwesomeIcon icon={faVideo} className="text-gray-400 text-3xl mb-2" />
                        <p className="text-gray-600 text-sm">Video content is being prepared</p>
                      </div>
                    )}
                  </div>
                </SimpleCard>
              )}

              {/* Study Content Section */}
              {weekContent.study_content.lesson_content && (
                <StudyContentCards 
                  lessonContent={weekContent.study_content.lesson_content}
                  weekNumber={weekNumber}
                  summary={weekContent.study_content.lesson_content?.summary}
                  resources={weekContent.study_content.additional_resources || []}
                />
              )}

              {/* Additional Resources Section (if not handled in StudyContentCards) */}
              {!weekContent.study_content.lesson_content && weekContent.study_content.additional_resources && weekContent.study_content.additional_resources.length > 0 && (
                <ResourcesCard 
                  resources={weekContent.study_content.additional_resources}
                />
              )}

              {/* Quiz Section */}
              <QuizSection 
                weekNumber={weekNumber}
                courseId={courseId}
                hasQuiz={weekContent.weekly_assignment.created}
                isWeekCompleted={isWeekCompleted()}
                videoWatched={true} // TODO: Track video completion
              />
            </>
          ) : (
            <motion.div
              className="bg-white rounded-game-lg p-8 border border-gray-200 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <div className="text-center py-16">
                <FontAwesomeIcon icon={faBook} className="text-6xl text-blue-300 mb-6" />
                <h3 className="text-3xl font-semibold text-gray-900 mb-4">
                  Content Coming Soon
                </h3>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
                  Your teacher is preparing the learning materials for this week. Check back soon!
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentWeek() {
  return (
    <ProtectedRoute requiredRole="student">
      <StudentWeekContent />
    </ProtectedRoute>
  );
}