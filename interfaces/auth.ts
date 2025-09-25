export type UserRole = "student" | "teacher";

export interface StudyQuestUser {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
  createdAt: any;
  lastLogin: any;
  // Student-specific fields
  level?: number;
  xp?: number;
  streak?: number;
  lastDailyMissionDate?: string;
  // Teacher-specific fields
  school?: string;
  subjects?: string[];
}

export interface AuthContextType {
  user: StudyQuestUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => void;
}
