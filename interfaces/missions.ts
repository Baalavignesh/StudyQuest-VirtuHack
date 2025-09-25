export type DailyMissionTaskType = 'login' | 'question' | 'focus';

export interface DailyMissionQuestion {
  courseId: string;
  courseTitle: string;
  weekNumber: number;
  questionId: string;
  prompt: string;
  type: 'mcq' | 'short_answer';
  options?: string[];
  correctAnswer: number | string | null;
}

export interface DailyMissionTaskState {
  completed: boolean;
  completedAt?: string;
  xpAwarded: number;
}

export interface DailyMissionQuestionState extends DailyMissionTaskState {
  question: DailyMissionQuestion | null;
  attempted: boolean;
  answeredCorrect: boolean;
  answer?: string | number | null;
}

export interface DailyMissionFocusState extends DailyMissionTaskState {
  response?: string;
}

export interface DailyMissionStatus {
  dateKey: string;
  createdAt: string;
  totalXpAwarded: number;
  login: DailyMissionTaskState;
  question: DailyMissionQuestionState;
  focus: DailyMissionFocusState;
}

export interface DailyMissionRecord {
  uid: string;
  dateKey: string;
  createdAt: string;
  loginXpAwarded: number;
  questionXpAwarded: number;
  focusXpAwarded: number;
  questionAnswer?: string | number | null;
  questionCorrect?: boolean;
  focusReflection?: string;
}

export interface DailyQuestionAnswerPayload {
  answer: string | number | null;
}


