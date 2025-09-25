import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
  increment,
  collectionGroup,
  runTransaction
} from 'firebase/firestore';
import { db } from './firebase';
import { CourseData, WeeklyContent, StudentProgress, QuizSubmission, DailyMissionStatus, DailyMissionQuestion, DailyMissionTaskType, DailyMissionRecord } from '@/interfaces';
import { AuthService } from './auth';

type SubmitQuizResultParams = {
  courseId: string;
  weekNumber: number;
  studentUid: string;
  totalQuestions: number;
  correctAnswers: number;
  totalPoints: number;
  pointsEarned: number;
  scorePercentage: number;
  timeTakenSeconds: number;
  startedAt: string;
  completedAt: string;
  xpAward: number;
  answers: Array<{
    questionId: string;
    selected: number | string | null;
    isCorrect: boolean;
    timedOut?: boolean;
    pointsAwarded: number;
  }>;
};

export class CourseService {
  private static coursesCollection = 'courses';
  private static userProfilesCollection = 'users';
  private static dailyMissionsCollection = 'daily_missions';
  private static dailyMissionAttemptsCollection = 'daily_mission_attempts';
  private static dailyMissionRecordsCollection = 'daily_mission_records';

  /**
   * Create a new course from syllabus analysis
   */
  static async createCourse(
    syllabusData: any, 
    teacherUid: string, 
    teacherName: string
  ): Promise<string> {
    try {
      // Generate unique course code
      const courseCode = this.generateCourseCode(
        syllabusData.course_details?.subject || 'GEN',
        syllabusData.course_details?.grade_level || '1',
        syllabusData.course_details?.school_year || '2024'
      );

      const courseData: CourseData = {
        // Syllabus data
        course_details: {
          course_title: syllabusData.course_details?.course_title || 'Untitled Course',
          subject: syllabusData.course_details?.subject || 'General',
          grade_level: syllabusData.course_details?.grade_level || '1st Grade',
          duration_weeks: syllabusData.course_details?.duration_weeks || 16,
          school_year: syllabusData.course_details?.school_year || '2024-2025'
        },
        class_information: {
          class_name: syllabusData.class_information?.class_name || syllabusData.course_details?.course_title || 'Untitled Course',
          teacher_name: syllabusData.class_information?.teacher_name || teacherName,
          room_number: syllabusData.class_information?.room_number || 'TBD',
          class_size: syllabusData.class_information?.class_size || 25
        },
        schedule: {
          start_date: syllabusData.schedule?.start_date || '',
          end_date: syllabusData.schedule?.end_date || '',
          class_days: syllabusData.schedule?.class_days || ['Monday', 'Wednesday', 'Friday'],
          class_time: syllabusData.schedule?.class_time || 'TBD'
        },
        exam_schedule: {
          midterm_week: syllabusData.exam_schedule?.midterm_week || 8,
          final_exam_week: syllabusData.exam_schedule?.final_exam_week || 16,
          midterm_date: syllabusData.exam_schedule?.midterm_date || '',
          final_exam_date: syllabusData.exam_schedule?.final_exam_date || ''
        },
        weekly_topics: syllabusData.weekly_topics || [],
        assessment_info: syllabusData.assessment_info || {
          weekly_assignment_due_day: 'Friday',
          grading_breakdown: {
            daily_assignments: '30%',
            weekly_quizzes: '25%',
            monthly_tests: '20%',
            midterm_exam: '15%',
            final_exam: '10%'
          }
        },
        
        // Course management
        created_by: teacherUid,
        created_at: serverTimestamp(),
        last_modified: serverTimestamp(),
        course_code: courseCode,
        
        // Student management
        enrolled_students: [],
        student_count: 0,
        max_students: syllabusData.class_information?.class_size || 30
      };

      // Create course document
      const courseRef = await addDoc(collection(db, this.coursesCollection), courseData);
      
      // Create weekly content subcollections
      await this.createWeeklyContent(courseRef.id, syllabusData.weekly_topics || []);
      
      // Initialize analytics
      await this.initializeCourseAnalytics(courseRef.id);

      return courseRef.id;
    } catch (error: any) {
      throw new Error(`Failed to create course: ${error.message}`);
    }
  }

  /**
   * Get course by ID
   */
  static async getCourse(courseId: string): Promise<(CourseData & { id: string }) | null> {
    try {
      const courseDoc = await getDoc(doc(db, this.coursesCollection, courseId));
      
      if (!courseDoc.exists()) {
        return null;
      }
      
      return { id: courseDoc.id, ...courseDoc.data() } as CourseData & { id: string };
    } catch (error: any) {
      throw new Error(`Failed to get course: ${error.message}`);
    }
  }

  /**
   * Get courses created by a teacher
   */
  static async getTeacherCourses(teacherUid: string): Promise<(CourseData & { id: string })[]> {
    try {
      const q = query(
        collection(db, this.coursesCollection),
        where('created_by', '==', teacherUid)
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as (CourseData & { id: string })[];
    } catch (error: any) {
      throw new Error(`Failed to get teacher courses: ${error.message}`);
    }
  }

  /**
   * Get course by course code (for student enrollment)
   */
  static async getCourseByCode(courseCode: string): Promise<(CourseData & { id: string }) | null> {
    try {
      const q = query(
        collection(db, this.coursesCollection),
        where('course_code', '==', courseCode.toUpperCase()),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as CourseData & { id: string };
    } catch (error: any) {
      throw new Error(`Failed to get course by code: ${error.message}`);
    }
  }

  /**
   * Enroll student in course
   */
  static async enrollStudent(courseId: string, studentUid: string): Promise<void> {
    try {
      const courseRef = doc(db, this.coursesCollection, courseId);
      
      // Get current course data to update student count
      const courseDoc = await getDoc(courseRef);
      const currentData = courseDoc.data();
      const currentStudents = currentData?.enrolled_students || [];
      
      // Add student to course
      await updateDoc(courseRef, {
        enrolled_students: arrayUnion(studentUid),
        student_count: currentStudents.length + 1
      });
      
      // Initialize student progress
      await this.initializeStudentProgress(courseId, studentUid);
      
    } catch (error: any) {
      throw new Error(`Failed to enroll student: ${error.message}`);
    }
  }

  /**
   * Create weekly content subcollections
   */
  private static async createWeeklyContent(courseId: string, weeklyTopics: any[]): Promise<void> {
    try {
      for (const topic of weeklyTopics) {
        const weekContent: WeeklyContent = {
          week_number: topic.week,
          topic: topic.topic,
          description: topic.description || '',
          
          video: {
            uploaded: false
          },
          
          study_content: {
            created: false
          },
          
          weekly_assignment: {
            created: false
          },
          
          daily_challenges: [],
          
          due_date: '' // Teacher will set this later
        };
        
        await addDoc(
          collection(db, this.coursesCollection, courseId, 'weeks'),
          weekContent
        );
      }
    } catch (error: any) {
      throw new Error(`Failed to create weekly content: ${error.message}`);
    }
  }

  /**
   * Initialize course analytics
   */
  private static async initializeCourseAnalytics(courseId: string): Promise<void> {
    try {
      const analyticsData = {
        class_performance: {
          average_score: 0,
          completion_rate: 0,
          active_students: 0,
          struggling_students: []
        },
        weekly_analytics: {},
        engagement_metrics: {
          daily_active_users: 0,
          average_session_time: 0
        }
      };
      
      await addDoc(
        collection(db, this.coursesCollection, courseId, 'analytics'),
        analyticsData
      );
    } catch (error: any) {
      throw new Error(`Failed to initialize analytics: ${error.message}`);
    }
  }

  /**
   * Initialize student progress
   */
  private static async initializeStudentProgress(courseId: string, studentUid: string): Promise<void> {
    try {
      const progressData: StudentProgress = {
        student_uid: studentUid,
        course_id: courseId,
        enrollment_date: serverTimestamp(),
        current_week: 1,
        completed_weeks: [],
        overall_progress: 0,
        weekly_progress: {},
        streaks: {
          current_streak: 0,
          longest_streak: 0,
          last_activity_date: new Date().toISOString()
        },
        total_points: 0,
        exam_scores: {},
        last_updated: new Date().toISOString()
      };
      
      await addDoc(
        collection(db, this.coursesCollection, courseId, 'student_progress'),
        progressData
      );
    } catch (error: any) {
      throw new Error(`Failed to initialize student progress: ${error.message}`);
    }
  }

  /**
   * Generate unique course code
   */
  private static generateCourseCode(subject: string, gradeLevel: string, year: string): string {
    const subjectCode = subject.substring(0, 4).toUpperCase();
    const grade = gradeLevel.replace(/[^0-9]/g, '') || '1';
    const yearShort = year.substring(2, 4);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    
    return `${subjectCode}${grade}${yearShort}${random}`;
  }

  /**
   * Update course
   */
  static async updateCourse(courseId: string, updates: Partial<CourseData>): Promise<void> {
    try {
      const courseRef = doc(db, this.coursesCollection, courseId);
      await updateDoc(courseRef, {
        ...updates,
        last_modified: serverTimestamp()
      });
    } catch (error: any) {
      throw new Error(`Failed to update course: ${error.message}`);
    }
  }

  /**
   * Delete course
   */
  static async deleteCourse(courseId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.coursesCollection, courseId));
    } catch (error: any) {
      throw new Error(`Failed to delete course: ${error.message}`);
    }
  }

  /**
   * Get weekly content for a course
   */
  static async getWeeklyContent(courseId: string): Promise<(WeeklyContent & { id: string })[]> {
    try {
      const q = query(
        collection(db, this.coursesCollection, courseId, 'weeks'),
        orderBy('week_number', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as (WeeklyContent & { id: string })[];
    } catch (error: any) {
      throw new Error(`Failed to get weekly content: ${error.message}`);
    }
  }

  /**
   * Get student progress for a course
   */
  static async getStudentProgress(courseId: string, studentUid: string): Promise<(StudentProgress & { id: string }) | null> {
    try {
      const q = query(
        collection(db, this.coursesCollection, courseId, 'student_progress'),
        where('student_uid', '==', studentUid),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as StudentProgress & { id: string };
    } catch (error: any) {
      throw new Error(`Failed to get student progress: ${error.message}`);
    }
  }

  /**
   * Update weekly content with educational materials and assignments
   */
  static async updateWeeklyContent(
    courseId: string, 
    weekNumber: number, 
    updates: Partial<WeeklyContent>
  ): Promise<void> {
    try {
      // Find the weekly content document by week number
      const q = query(
        collection(db, this.coursesCollection, courseId, 'weeks'),
        where('week_number', '==', weekNumber),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error(`Week ${weekNumber} not found for course ${courseId}`);
      }
      
      const weekDoc = querySnapshot.docs[0];
      const weekRef = doc(db, this.coursesCollection, courseId, 'weeks', weekDoc.id);
      
      // Update the weekly content with new educational materials
      await updateDoc(weekRef, {
        ...updates,
        last_modified: serverTimestamp()
      });
      
    } catch (error: any) {
      throw new Error(`Failed to update weekly content: ${error.message}`);
    }
  }

  /**
   * Get specific week content by week number
   */
  static async getWeekContent(courseId: string, weekNumber: number): Promise<(WeeklyContent & { id: string }) | null> {
    try {
      const q = query(
        collection(db, this.coursesCollection, courseId, 'weeks'),
        where('week_number', '==', weekNumber),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as WeeklyContent & { id: string };
    } catch (error: any) {
      throw new Error(`Failed to get week content: ${error.message}`);
    }
  }

  /**
   * Update video upload status for a specific week
   */
  static async updateVideoStatus(
    courseId: string, 
    weekNumber: number, 
    videoData: { uploaded: boolean; video_url?: string; video_duration?: number }
  ): Promise<void> {
    try {
      await this.updateWeeklyContent(courseId, weekNumber, {
        video: {
          ...videoData,
          upload_date: serverTimestamp()
        }
      });
    } catch (error: any) {
      throw new Error(`Failed to update video status: ${error.message}`);
    }
  }

  /**
   * Check if comprehensive content exists for a week
   */
  static async hasComprehensiveContent(courseId: string, weekNumber: number): Promise<boolean> {
    try {
      const weekContent = await this.getWeekContent(courseId, weekNumber);
      return weekContent?.study_content?.created === true && weekContent?.weekly_assignment?.created === true;
    } catch (error: any) {
      return false;
    }
  }

  /**
   * Get course progress statistics
   */
  static async getCourseProgressStats(courseId: string): Promise<{
    totalWeeks: number;
    weeksWithContent: number;
    weeksWithVideo: number;
    weeksWithAssignments: number;
    overallProgress: number;
  }> {
    try {
      const weeklyContent = await this.getWeeklyContent(courseId);
      
      const totalWeeks = weeklyContent.length;
      const weeksWithContent = weeklyContent.filter(week => week.study_content?.created === true).length;
      const weeksWithVideo = weeklyContent.filter(week => week.video?.uploaded === true).length;
      const weeksWithAssignments = weeklyContent.filter(week => week.weekly_assignment?.created === true).length;
      
      // Calculate overall progress based on content completion
      const contentProgress = totalWeeks > 0 ? (weeksWithContent / totalWeeks) * 100 : 0;
      
      return {
        totalWeeks,
        weeksWithContent,
        weeksWithVideo,
        weeksWithAssignments,
        overallProgress: Math.round(contentProgress)
      };
    } catch (error: any) {
      throw new Error(`Failed to get course progress stats: ${error.message}`);
    }
  }

  /**
   * Get enrolled students with their details
   */
  static async getEnrolledStudents(courseId: string): Promise<Array<{
    uid: string;
    name: string;
    email: string;
    enrollmentDate?: any;
    progress?: number;
  }>> {
    try {
      // First get the course to get enrolled student UIDs
      const course = await this.getCourse(courseId);
      
      if (!course || !course.enrolled_students?.length) {
        return [];
      }

      // Get student details from users collection
      // In our system, we store emails (which are also UIDs) in enrolled_students
      // and use emails as document IDs in the users collection
      const studentDetails = await Promise.all(
        course.enrolled_students.map(async (studentUid: string) => {
          try {
            // Since our UID is actually the email, we can directly get the document
            const studentDoc = await getDoc(doc(db, this.userProfilesCollection, studentUid));
            
            if (studentDoc.exists()) {
              const studentData = studentDoc.data();
              
              // Try to get student progress for this course
              const progress = await this.getStudentProgress(courseId, studentUid);
              
              return {
                uid: studentUid,
                name: studentData.displayName || studentData.name || 'Unknown Student',
                email: studentData.email || studentUid, // Use UID (email) as fallback
                enrollmentDate: progress?.enrollment_date,
                progress: progress?.overall_progress || 0
              };
            }
            return null;
          } catch (error) {
            console.error(`Error getting student details for ${studentUid}:`, error);
            return {
              uid: studentUid,
              name: 'Unknown Student',
              email: studentUid, // UID is the email in our system
              progress: 0
            };
          }
        })
      );

      // Filter out null results and return
      return studentDetails.filter(student => student !== null) as Array<{
        uid: string;
        name: string;
        email: string;
        enrollmentDate?: any;
        progress?: number;
      }>;

    } catch (error: any) {
      throw new Error(`Failed to get enrolled students: ${error.message}`);
    }
  }

  /**
   * Remove student from course
   */
  static async removeStudent(courseId: string, studentUid: string): Promise<void> {
    try {
      const courseRef = doc(db, this.coursesCollection, courseId);
      
      // Get current course data
      const courseDoc = await getDoc(courseRef);
      const currentData = courseDoc.data();
      const currentStudents = currentData?.enrolled_students || [];
      
      // Remove student from the enrolled list
      const updatedStudents = currentStudents.filter((uid: string) => uid !== studentUid);
      
      // Update course document
      await updateDoc(courseRef, {
        enrolled_students: updatedStudents,
        student_count: updatedStudents.length
      });
      
      // TODO: Optionally remove student progress data
      // For now, we'll keep the progress data in case they re-enroll
      
    } catch (error: any) {
      throw new Error(`Failed to remove student from course: ${error.message}`);
    }
  }

  /**
   * Get course analytics data
   */
  static async getCourseAnalytics(courseId: string): Promise<{
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
  }> {
    try {
      const students = await this.getEnrolledStudents(courseId);
      const totalStudents = students.length;
      
      if (totalStudents === 0) {
        return {
          totalStudents: 0,
          activeStudents: 0,
          averageProgress: 0,
          completionRate: 0,
          averageScore: 0,
          strugglingStudents: 0,
          topPerformers: [],
          weeklyEngagement: []
        };
      }

      // Calculate metrics from student data
      const totalProgress = students.reduce((sum, student) => sum + (student.progress || 0), 0);
      const averageProgress = Math.round(totalProgress / totalStudents);
      const activeStudents = students.filter(student => (student.progress || 0) > 0).length;
      const strugglingStudents = students.filter(student => (student.progress || 0) < 30).length;
      
      // Get detailed student progress for better analytics
      const detailedStudents = await Promise.all(
        students.map(async (student) => {
          const progress = await this.getStudentProgress(courseId, student.uid);
          return {
            ...student,
            totalPoints: progress?.total_points || 0,
            detailedProgress: progress
          };
        })
      );

      // Top performers (by progress and points)
      const topPerformers = detailedStudents
        .filter(student => (student.progress || 0) > 50)
        .sort((a, b) => (b.progress || 0) - (a.progress || 0))
        .slice(0, 5)
        .map(student => ({
          name: student.name,
          email: student.email,
          progress: student.progress || 0,
          totalPoints: student.totalPoints
        }));

      // Weekly engagement data
      const course = await this.getCourse(courseId);
      const totalWeeks = course?.course_details?.duration_weeks || 16;
      const weeklyEngagement = [];
      
      for (let week = 1; week <= totalWeeks; week++) {
        const weekCompletions = detailedStudents.filter(student => 
          student.detailedProgress?.completed_weeks?.includes(week)
        );
        
        weeklyEngagement.push({
          week,
          completionCount: weekCompletions.length,
          averageScore: weekCompletions.length > 0 ? 85 : 0 // Placeholder for now
        });
      }

      return {
        totalStudents,
        activeStudents,
        averageProgress,
        completionRate: Math.round((activeStudents / totalStudents) * 100),
        averageScore: 82, // Placeholder - would come from quiz submissions
        strugglingStudents,
        topPerformers,
        weeklyEngagement
      };
      
    } catch (error: any) {
      throw new Error(`Failed to get course analytics: ${error.message}`);
    }
  }

  /**
   * Get student details with full progress data
   */
  static async getStudentDetails(courseId: string, studentUid: string): Promise<{
    uid: string;
    name: string;
    email: string;
    enrollmentDate?: any;
    progress: number;
    totalPoints: number;
    currentStreak: number;
    completedWeeks: number[];
    weeklyScores: { [week: number]: number };
    badges: string[];
    lastActivity?: any;
  } | null> {
    try {
      const studentDoc = await getDoc(doc(db, this.userProfilesCollection, studentUid));
      
      if (!studentDoc.exists()) {
        return null;
      }
      
      const studentData = studentDoc.data();
      const progress = await this.getStudentProgress(courseId, studentUid);
      
      if (!progress) {
        return null;
      }

      return {
        uid: studentUid,
        name: studentData.displayName || 'Unknown Student',
        email: studentData.email || studentUid,
        enrollmentDate: progress.enrollment_date,
        progress: progress.overall_progress || 0,
        totalPoints: progress.total_points || 0,
        currentStreak: progress.streaks?.current_streak || 0,
        completedWeeks: progress.completed_weeks || [],
        weeklyScores: {}, // Placeholder - would come from quiz submissions
        badges: [], // Placeholder - would come from badge system
        lastActivity: progress.streaks?.last_activity
      };
      
    } catch (error: any) {
      console.error('Error getting student details:', error);
      return null;
    }
  }

  /**
   * Get courses that a student is enrolled in
   */
  static async getStudentCourses(studentUid: string): Promise<Array<CourseData & { 
    id: string; 
    studentProgress?: StudentProgress;
    completedWeeks?: number;
    totalWeeks?: number;
  }>> {
    try {
      // Query courses where the student is enrolled
      const coursesQuery = query(
        collection(db, this.coursesCollection),
        where('enrolled_students', 'array-contains', studentUid)
      );
      
      const querySnapshot = await getDocs(coursesQuery);
      
      if (querySnapshot.empty) {
        return [];
      }

      // Get course data with progress information
      const coursesWithProgress = await Promise.all(
        querySnapshot.docs.map(async (courseDoc) => {
          const courseData = courseDoc.data() as CourseData;
          const courseId = courseDoc.id;
          
          try {
            // Get student progress for this course
            const studentProgress = await this.getStudentProgress(courseId, studentUid);
            
            // Get weekly content to calculate completion
            const weeklyContent = await this.getWeeklyContent(courseId);
            const totalWeeks = weeklyContent.length;
            
            // Calculate completed weeks based on student progress
            let completedWeeks = 0;
            if (studentProgress?.weekly_progress) {
              completedWeeks = Object.keys(studentProgress.weekly_progress).filter(
                (weekKey) => {
                  const weekProgress = studentProgress.weekly_progress[weekKey];
                  return weekProgress?.assignment_completed || weekProgress?.video_watched;
                }
              ).length;
            }
            
            return {
              ...courseData,
              id: courseId,
              studentProgress: studentProgress || undefined,
              completedWeeks,
              totalWeeks
            };
          } catch (progressError) {
            console.error(`Error getting progress for course ${courseId}:`, progressError);
            
            // Return course data without progress if there's an error
            return {
              ...courseData,
              id: courseId,
              completedWeeks: 0,
              totalWeeks: courseData.weekly_topics?.length || 0
            };
          }
        })
      );

      return coursesWithProgress;
      
    } catch (error: any) {
      throw new Error(`Failed to get student courses: ${error.message}`);
    }
  }


  /**
   * Update student progress
   */
  static async updateStudentProgress(
    courseId: string, 
    studentUid: string, 
    updates: (Partial<StudentProgress> & Record<string, unknown>)
  ): Promise<void> {
    try {
      const q = query(
        collection(db, this.coursesCollection, courseId, 'student_progress'),
        where('student_uid', '==', studentUid),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Create progress if it doesn't exist
        await this.initializeStudentProgress(courseId, studentUid);
        return await this.updateStudentProgress(courseId, studentUid, updates);
      }
      
      const docSnapshot = querySnapshot.docs[0];
      const progressRef = doc(db, this.coursesCollection, courseId, 'student_progress', docSnapshot.id);
      
      await updateDoc(progressRef, {
        ...updates,
        last_updated: new Date().toISOString()
      });
    } catch (error: any) {
      throw new Error(`Failed to update student progress: ${error.message}`);
    }
  }

  /**
   * Get a quiz submission for a student and week
   */
  static async getQuizSubmission(
    courseId: string,
    weekNumber: number,
    studentUid: string
  ): Promise<(QuizSubmission & { id: string }) | null> {
    try {
      const submissionRef = doc(
        db,
        this.coursesCollection,
        courseId,
        'quiz_submissions',
        `${studentUid}_week_${weekNumber}`
      );
      const snapshot = await getDoc(submissionRef);

      if (!snapshot.exists()) {
        return null;
      }

      return { id: snapshot.id, ...(snapshot.data() as QuizSubmission) };
    } catch (error: any) {
      throw new Error(`Failed to fetch quiz submission: ${error.message}`);
    }
  }

  /**
   * Submit quiz results, update progress, and award XP
   */
  static async submitQuizResult(params: SubmitQuizResultParams): Promise<QuizSubmission & { id: string }> {
    const {
      courseId,
      weekNumber,
      studentUid,
      answers,
      correctAnswers,
      pointsEarned,
      totalPoints,
      totalQuestions,
      scorePercentage,
      timeTakenSeconds,
      startedAt,
      completedAt,
      xpAward
    } = params;

    try {
      const submissionRef = doc(
        db,
        this.coursesCollection,
        courseId,
        'quiz_submissions',
        `${studentUid}_week_${weekNumber}`
      );
      const existingSnapshot = await getDoc(submissionRef);

      if (existingSnapshot.exists()) {
        return { id: submissionRef.id, ...(existingSnapshot.data() as QuizSubmission) };
      }

      const normalizedPointsEarned = Math.round(pointsEarned * 100) / 100;
      const normalizedTotalPoints = Math.round(totalPoints * 100) / 100;
      const normalizedScorePercentage = Math.min(100, Math.max(0, Math.round(scorePercentage)));
      const normalizedXpAward = Math.max(Math.round(xpAward), 0);

      const payload: QuizSubmission = {
        student_uid: studentUid,
        course_id: courseId,
        week_number: weekNumber,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        total_points: normalizedTotalPoints,
        points_earned: normalizedPointsEarned,
        xp_awarded: normalizedXpAward,
        score_percentage: normalizedScorePercentage,
        time_taken_seconds: timeTakenSeconds,
        started_at: startedAt,
        completed_at: completedAt,
        answers: answers.map((answer) => ({
          question_id: answer.questionId,
          selected: answer.selected ?? null,
          is_correct: answer.isCorrect,
          timed_out: answer.timedOut ?? false,
          points_awarded: Math.round(answer.pointsAwarded * 100) / 100
        })),
        submitted_at: serverTimestamp()
      };

      await setDoc(submissionRef, payload);

      const weekKey = String(weekNumber);
      await this.updateStudentProgress(courseId, studentUid, {
        [`weekly_progress.${weekKey}.assignment_completed`]: true,
        [`weekly_progress.${weekKey}.assignment_score`]: payload.points_earned,
        [`weekly_progress.${weekKey}.assignment_submitted_at`]: payload.completed_at
      });

      await this.completeWeek(courseId, studentUid, weekNumber, normalizedXpAward);

      const savedSnapshot = await getDoc(submissionRef);
      return { id: submissionRef.id, ...(savedSnapshot.data() as QuizSubmission) };
    } catch (error: any) {
      throw new Error(`Failed to submit quiz results: ${error.message}`);
    }
  }


  /**
   * Complete a week and unlock the next one
   */
  static async completeWeek(courseId: string, studentUid: string, weekNumber: number, xpAward: number = 100): Promise<void> {
    try {
      const currentProgress = await this.getStudentProgress(courseId, studentUid);
      
      if (!currentProgress) {
        await this.initializeStudentProgress(courseId, studentUid);
        return await this.completeWeek(courseId, studentUid, weekNumber);
      }
      
      const completedWeeks = currentProgress.completed_weeks || [];
      
      // Don't add if already completed
      if (completedWeeks.includes(weekNumber)) {
        return;
      }
      
      // Add week to completed list
      completedWeeks.push(weekNumber);
      completedWeeks.sort((a, b) => a - b);
      
      // Calculate new current week (next incomplete week)
      let nextWeek = weekNumber + 1;
      
      // Get course to check total weeks
      const course = await this.getCourse(courseId);
      const totalWeeks = course?.course_details?.duration_weeks || 12;
      
      // Ensure we don't go beyond total weeks
      if (nextWeek > totalWeeks) {
        nextWeek = totalWeeks;
      }
      
      // Calculate overall progress
      const overallProgress = Math.round((completedWeeks.length / totalWeeks) * 100);
      
      const xpToAward = Math.max(Math.round(xpAward), 0);

      // Award XP to user profile
      if (xpToAward > 0) {
        await AuthService.awardStudentXp(studentUid, xpToAward);
      }

      await this.updateStudentProgress(courseId, studentUid, {
        completed_weeks: completedWeeks,
        current_week: nextWeek,
        overall_progress: overallProgress,
        total_points: (currentProgress.total_points || 0) + xpToAward
      });
    } catch (error: any) {
      throw new Error(`Failed to complete week: ${error.message}`);
    }
  }

  /**
   * Check if a week is unlocked for a student
   */
  static async isWeekUnlocked(courseId: string, studentUid: string, weekNumber: number): Promise<boolean> {
    try {
      const progress = await this.getStudentProgress(courseId, studentUid);
      
      if (!progress) {
        // If no progress exists, only week 1 is unlocked
        return weekNumber === 1;
      }
      
      return weekNumber <= progress.current_week;
    } catch (error: any) {
      console.error('Error checking week unlock status:', error);
      // Default to only week 1 being unlocked if there's an error
      return weekNumber === 1;
    }
  }

  /**
   * Get week unlock status and completion info
   */
  static async getWeekStatus(courseId: string, studentUid: string, weekNumber: number): Promise<{
    isUnlocked: boolean;
    isCompleted: boolean;
    isCurrentWeek: boolean;
  }> {
    try {
      const progress = await this.getStudentProgress(courseId, studentUid);
      
      if (!progress) {
        return {
          isUnlocked: weekNumber === 1,
          isCompleted: false,
          isCurrentWeek: weekNumber === 1
        };
      }
      
      const completedWeeks = progress.completed_weeks || [];
      const currentWeek = progress.current_week || 1;
      
      return {
        isUnlocked: weekNumber <= currentWeek,
        isCompleted: completedWeeks.includes(weekNumber),
        isCurrentWeek: weekNumber === currentWeek && !completedWeeks.includes(weekNumber)
      };
    } catch (error: any) {
      console.error('Error getting week status:', error);
      return {
        isUnlocked: weekNumber === 1,
        isCompleted: false,
        isCurrentWeek: weekNumber === 1
      };
    }
  }

  /**
   * Get today's daily missions for a student
   */
  static async getDailyMissions(studentUid: string): Promise<DailyMissionStatus> {
    const today = new Date();
    const dateKey = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    try {
      const missionRef = doc(db, this.dailyMissionRecordsCollection, `${studentUid}_${dateKey}`);
      const missionSnap = await getDoc(missionRef);
      
      if (missionSnap.exists()) {
        const data = missionSnap.data() as DailyMissionRecord;
        return {
          dateKey,
          createdAt: data.createdAt,
          totalXpAwarded: data.loginXpAwarded + data.questionXpAwarded + data.focusXpAwarded,
          login: {
            completed: data.loginXpAwarded > 0,
            completedAt: data.loginXpAwarded > 0 ? data.createdAt : undefined,
            xpAwarded: data.loginXpAwarded
          },
          question: {
            completed: data.questionXpAwarded > 0,
            completedAt: data.questionXpAwarded > 0 ? data.createdAt : undefined,
            xpAwarded: data.questionXpAwarded,
            question: await this.getTodaysDailyQuestion(studentUid),
            attempted: data.questionAnswer !== undefined,
            answeredCorrect: data.questionCorrect || false,
            answer: data.questionAnswer
          },
          focus: {
            completed: data.focusXpAwarded > 0,
            completedAt: data.focusXpAwarded > 0 ? data.createdAt : undefined,
            xpAwarded: data.focusXpAwarded,
            response: data.focusReflection
          }
        };
      }

      // Create new mission status for today
      const question = await this.getTodaysDailyQuestion(studentUid);
      return {
        dateKey,
        createdAt: today.toISOString(),
        totalXpAwarded: 0,
        login: {
          completed: false,
          xpAwarded: 0
        },
        question: {
          completed: false,
          xpAwarded: 0,
          question,
          attempted: false,
          answeredCorrect: false
        },
        focus: {
          completed: false,
          xpAwarded: 0
        }
      };
    } catch (error: any) {
      throw new Error(`Failed to get daily missions: ${error.message}`);
    }
  }

  /**
   * Get today's daily question for a student (deterministic based on date and student courses)
   */
  static async getTodaysDailyQuestion(studentUid: string): Promise<DailyMissionQuestion | null> {
    try {
      // Get student's enrolled courses
      const studentCourses = await this.getStudentCourses(studentUid);
      
      if (studentCourses.length === 0) {
        return null;
      }

      const today = new Date();
      const dateKey = today.toISOString().split('T')[0];
      
      // Create a deterministic seed based on date
      const dateSeed = new Date(dateKey).getTime() / (1000 * 60 * 60 * 24); // Days since epoch
      
      // Select a course deterministically
      const courseIndex = Math.floor(dateSeed) % studentCourses.length;
      const selectedCourse = studentCourses[courseIndex];
      
      // Get weekly content for the course
      const weeklyContent = await this.getWeeklyContent(selectedCourse.id);
      
      if (!weeklyContent || weeklyContent.length === 0) {
        return null;
      }

      // Find weeks with questions
      const weeksWithQuestions = weeklyContent.filter(week => 
        week.weekly_assignment?.questions && week.weekly_assignment.questions.length > 0
      );

      if (weeksWithQuestions.length === 0) {
        return null;
      }

      // Select a week deterministically
      const weekIndex = Math.floor(dateSeed * 3) % weeksWithQuestions.length;
      const selectedWeek = weeksWithQuestions[weekIndex];
      
      // Select a question deterministically
      const questions = selectedWeek.weekly_assignment.questions!;
      const questionIndex = Math.floor(dateSeed * 7) % questions.length;
      const selectedQuestion = questions[questionIndex];

      return {
        courseId: selectedCourse.id,
        courseTitle: selectedCourse.course_details.course_title,
        weekNumber: selectedWeek.week_number,
        questionId: selectedQuestion.id,
        prompt: selectedQuestion.question,
        type: selectedQuestion.type as 'mcq' | 'short_answer',
        options: selectedQuestion.options,
        correctAnswer: selectedQuestion.correct_answer || null
      };
    } catch (error: any) {
      console.error('Failed to get daily question:', error);
      return null;
    }
  }

  /**
   * Calculate streak based on last daily mission date
   */
  static calculateStreak(lastDailyMissionDate: string | undefined, todayDateKey: string): number {
    if (!lastDailyMissionDate) {
      // First time completing missions
      return 1;
    }

    const today = new Date(todayDateKey);
    const lastMissionDate = new Date(lastDailyMissionDate);
    const daysDifference = Math.floor((today.getTime() - lastMissionDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDifference === 0) {
      // Same day, don't change streak
      return -1; // Special value to indicate no streak change
    } else if (daysDifference === 1) {
      // Yesterday, continue streak
      return -2; // Special value to indicate increment streak
    } else {
      // More than 1 day gap, reset streak
      return 1;
    }
  }

  /**
   * Complete a daily mission task and award XP
   */
  static async completeDailyMissionTask(
    studentUid: string,
    taskType: DailyMissionTaskType,
    data?: { answer?: string | number | null; reflection?: string }
  ): Promise<DailyMissionStatus> {
    const today = new Date();
    const dateKey = today.toISOString().split('T')[0];
    
    try {
      return await runTransaction(db, async (transaction) => {
        const missionRef = doc(db, this.dailyMissionRecordsCollection, `${studentUid}_${dateKey}`);
        const missionSnap = await transaction.get(missionRef);
        
        // Get user data for streak calculation
        const userRef = doc(db, this.userProfilesCollection, studentUid);
        const userSnap = await transaction.get(userRef);
        const userData = userSnap.data();
        
        let missionData: DailyMissionRecord;
        
        if (missionSnap.exists()) {
          missionData = missionSnap.data() as DailyMissionRecord;
        } else {
          // Create new mission record
          missionData = {
            uid: studentUid,
            dateKey,
            createdAt: today.toISOString(),
            loginXpAwarded: 0,
            questionXpAwarded: 0,
            focusXpAwarded: 0
          };
        }

        // Determine XP award and update mission data
        let xpToAward = 0;
        let shouldUpdateStreak = false;
        
        switch (taskType) {
          case 'login':
            if (missionData.loginXpAwarded === 0) {
              xpToAward = 10;
              missionData.loginXpAwarded = xpToAward;
              shouldUpdateStreak = true; // Update streak only for login mission
            }
            break;
            
          case 'question':
            if (missionData.questionXpAwarded === 0 && data?.answer !== undefined) {
              const question = await this.getTodaysDailyQuestion(studentUid);
              const isCorrect = question && data.answer === question.correctAnswer;
              
              xpToAward = 10; // Base XP for attempting
              if (isCorrect) {
                xpToAward += 10; // Bonus XP for correct answer
              }
              
              missionData.questionXpAwarded = xpToAward;
              missionData.questionAnswer = data.answer;
              missionData.questionCorrect = isCorrect || undefined;
            }
            break;
            
          case 'focus':
            if (missionData.focusXpAwarded === 0 && data?.reflection) {
              xpToAward = 15;
              missionData.focusXpAwarded = xpToAward;
              missionData.focusReflection = data.reflection;
            }
            break;
        }

        // Save mission record
        transaction.set(missionRef, missionData);
        
        // Award XP and update user data
        if (xpToAward > 0) {
          const updateData: any = {
            xp: increment(xpToAward),
            lastDailyMissionDate: dateKey
          };

          // Handle streak logic for login missions
          if (shouldUpdateStreak) {
            const currentStreak = userData?.streak || 0;
            const lastMissionDate = userData?.lastDailyMissionDate;
            const streakCalculation = this.calculateStreak(lastMissionDate, dateKey);
            
            if (streakCalculation === -2) {
              // Increment streak (yesterday was last mission)
              updateData.streak = increment(1);
            } else if (streakCalculation === -1) {
              // Same day, no change to streak
              // Do nothing
            } else {
              // Reset streak or set to calculated value
              updateData.streak = streakCalculation;
            }
          }

          transaction.update(userRef, updateData);
        }

        // Return updated mission status
        const question = await this.getTodaysDailyQuestion(studentUid);
        return {
          dateKey,
          createdAt: missionData.createdAt,
          totalXpAwarded: missionData.loginXpAwarded + missionData.questionXpAwarded + missionData.focusXpAwarded,
          login: {
            completed: missionData.loginXpAwarded > 0,
            completedAt: missionData.loginXpAwarded > 0 ? missionData.createdAt : undefined,
            xpAwarded: missionData.loginXpAwarded
          },
          question: {
            completed: missionData.questionXpAwarded > 0,
            completedAt: missionData.questionXpAwarded > 0 ? missionData.createdAt : undefined,
            xpAwarded: missionData.questionXpAwarded,
            question,
            attempted: missionData.questionAnswer !== undefined,
            answeredCorrect: missionData.questionCorrect || false,
            answer: missionData.questionAnswer
          },
          focus: {
            completed: missionData.focusXpAwarded > 0,
            completedAt: missionData.focusXpAwarded > 0 ? missionData.createdAt : undefined,
            xpAwarded: missionData.focusXpAwarded,
            response: missionData.focusReflection
          }
        };
      });
    } catch (error: any) {
      throw new Error(`Failed to complete daily mission: ${error.message}`);
    }
  }

  /**
   * Get global leaderboard of all students ranked by XP
   */
  static async getGlobalLeaderboard(limitCount: number = 10): Promise<Array<{
    uid: string;
    displayName: string;
    xp: number;
    streak: number;
    rank: number;
  }>> {
    try {
      // Query all student users (avoid composite index by not ordering in query)
      const q = query(
        collection(db, this.userProfilesCollection),
        where('role', '==', 'student')
      );

      const querySnapshot = await getDocs(q);
      const allStudents = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          uid: doc.id,
          displayName: data.displayName || 'Anonymous Student',
          xp: data.xp || 0,
          streak: data.streak || 0
        };
      });

      // Sort by XP in descending order and apply limit in memory
      const leaderboard = allStudents
        .sort((a, b) => b.xp - a.xp)
        .slice(0, limitCount)
        .map((student, index) => ({
          ...student,
          rank: index + 1
        }));

      return leaderboard;
    } catch (error: any) {
      throw new Error(`Failed to fetch global leaderboard: ${error.message}`);
    }
  }

  /**
   * Get course-specific leaderboard of students in a course ranked by XP
   */
  static async getCourseLeaderboard(courseId: string, limitCount: number = 10): Promise<Array<{
    uid: string;
    displayName: string;
    xp: number;
    streak: number;
    rank: number;
    courseProgress?: number;
  }>> {
    try {
      // Get course to get enrolled students
      const course = await this.getCourse(courseId);
      if (!course || !course.enrolled_students?.length) {
        return [];
      }

      // Get all enrolled students' data
      const studentPromises = course.enrolled_students.map(async (studentUid) => {
        const userDoc = await getDoc(doc(db, this.userProfilesCollection, studentUid));
        if (!userDoc.exists()) return null;
        
        const userData = userDoc.data();
        
        // Get student progress in this course
        const progress = await this.getStudentProgress(courseId, studentUid);
        
        return {
          uid: studentUid,
          displayName: userData.displayName || 'Anonymous Student',
          xp: userData.xp || 0,
          streak: userData.streak || 0,
          courseProgress: progress?.overall_progress || 0
        };
      });

      const students = (await Promise.all(studentPromises))
        .filter(student => student !== null)
        .sort((a, b) => b.xp - a.xp) // Sort by XP descending
        .slice(0, limitCount)
        .map((student, index) => ({
          ...student,
          rank: index + 1
        }));

      return students as Array<{
        uid: string;
        displayName: string;
        xp: number;
        streak: number;
        rank: number;
        courseProgress?: number;
      }>;
    } catch (error: any) {
      throw new Error(`Failed to fetch course leaderboard: ${error.message}`);
    }
  }
}