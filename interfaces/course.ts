export interface CourseData {
  // Extracted from syllabus
  course_details: {
    course_title: string;
    subject: string;
    grade_level: string;
    duration_weeks: number;
    school_year: string;
  };
  class_information: {
    class_name: string;
    teacher_name: string;
    room_number: string;
    class_size: number;
  };
  schedule: {
    start_date: string;
    end_date: string;
    class_days: string[];
    class_time: string;
  };
  exam_schedule: {
    midterm_week: number;
    final_exam_week: number;
    midterm_date: string;
    final_exam_date: string;
  };
  weekly_topics: Array<{
    week: number;
    topic: string;
    description: string;
  }>;
  assessment_info: {
    weekly_assignment_due_day: string;
    grading_breakdown: {
      daily_assignments: string;
      weekly_quizzes: string;
      monthly_tests: string;
      midterm_exam: string;
      final_exam: string;
    };
  };
  
  // Course management
  created_by: string;
  created_at?: any;
  last_modified?: any;
  course_code: string;
  
  // Student management
  enrolled_students: string[];
  student_count: number;
  max_students: number;
}

export interface WeeklyContent {
  week_number: number;
  topic: string;
  description: string;
  
  // Teacher content
  video: {
    uploaded: boolean;
    video_url?: string;
    video_duration?: number;
    upload_date?: any;
  };
  
  // Comprehensive Educational Content
  study_content: {
    created: boolean;
    lesson_content?: {
      introduction: string;
      main_concepts: Array<{
        title: string;
        explanation: string;
        examples: string[];
      }>;
      key_vocabulary: Array<{
        term: string;
        definition: string;
        example?: string;
      }>;
      step_by_step_guide?: Array<{
        step: number;
        title: string;
        description: string;
        example?: string;
      }>;
      summary: string;
      learning_objectives: string[];
    };
    practice_materials?: {
      worked_examples: Array<{
        problem: string;
        solution_steps: string[];
        final_answer: string;
        explanation: string;
      }>;
      practice_problems: Array<{
        problem: string;
        hint?: string;
        solution: string;
        difficulty: 'easy' | 'medium' | 'hard';
      }>;
    };
    additional_resources?: Array<{
      title: string;
      type: 'link' | 'reading' | 'video' | 'exercise';
      content: string;
      description?: string;
    }>;
    created_at?: any;
  };
  
  weekly_assignment: {
    created: boolean;
    questions?: Array<{
      id: string;
      question: string;
      type: 'mcq' | 'short_answer' | 'essay';
      options?: string[];
      correct_answer?: number | string;
      difficulty: 'easy' | 'medium' | 'hard';
      points: number;
      explanation?: string;
      learning_objective?: string;
    }>;
    total_questions?: number;
    total_points?: number;
    time_limit?: number;
  };
  
  daily_challenges: Array<{
    day: number;
    question: string;
    type: 'mcq' | 'short_answer';
    options?: string[];
    correct_answer: number | string;
    points: number;
  }>;
  
  due_date: string;
}

export interface QuizSubmission {
  student_uid: string;
  course_id: string;
  week_number: number;
  total_questions: number;
  correct_answers: number;
  total_points: number;
  points_earned: number;
  xp_awarded: number;
  score_percentage: number;
  time_taken_seconds: number;
  started_at: string;
  completed_at: string;
  answers: Array<{
    question_id: string;
    selected: number | string | null;
    is_correct: boolean;
    timed_out?: boolean;
    points_awarded: number;
  }>;
  submitted_at?: any;
}


export interface StudentProgress {
  student_uid: string;
  course_id?: string;
  enrollment_date?: any;
  current_week: number;
  completed_weeks?: number[];
  overall_progress: number;
  
  weekly_progress: {
    [weekNumber: string]: {
      video_watched: boolean;
      assignment_completed: boolean;
      assignment_score?: number;
      assignment_submitted_at?: any;
      daily_challenges_completed: number[];
      total_daily_points: number;
    };
  };
  
  streaks: {
    current_streak: number;
    longest_streak: number;
    last_activity?: any;
    last_activity_date?: string;
  };
  
  total_points: number;
  
  exam_scores: {
    midterm?: number;
    final?: number;
  };
  
  last_updated?: string;
}
