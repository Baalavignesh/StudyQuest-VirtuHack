import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  increment
} from "firebase/firestore";
import { db } from "./firebase";
import { StudyQuestUser, UserRole } from '@/interfaces';

// Simple password hashing utility
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export class AuthService {
  // Sign up new user
  static async signUp(email: string, password: string, role: UserRole, displayName: string): Promise<StudyQuestUser> {
    if (!db) {
      throw new Error('Firestore is not properly configured.');
    }
    
    try {
      // Check if user already exists
      const userDoc = await getDoc(doc(db, "users", email));
      if (userDoc.exists()) {
        throw new Error('An account with this email already exists.');
      }

      // Hash the password
      const hashedPassword = await hashPassword(password);

      // Create user document
      const userData: StudyQuestUser & { password: string } = {
        uid: email, // Using email as uid since that's the document ID
        email,
        password: hashedPassword,
        role,
        displayName,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        ...(role === 'student' && {
          level: 1,
          xp: 0,
          streak: 0
        }),
        ...(role === 'teacher' && {
          school: '',
          subjects: []
        })
      };

      await setDoc(doc(db, "users", email), userData);
      
      // Return user data without password
      const { password: _, ...userWithoutPassword } = userData;
      return userWithoutPassword;
    } catch (error: any) {
      throw new Error(`Failed to create account: ${error.message}`);
    }
  }

  // Sign in existing user
  static async signIn(email: string, password: string): Promise<StudyQuestUser> {
    if (!db) {
      throw new Error('Firestore is not properly configured.');
    }

    try {
      // Get user document
      const userDoc = await getDoc(doc(db, "users", email));
      
      if (!userDoc.exists()) {
        throw new Error('No account found with this email address.');
      }

      const userData = userDoc.data();
      
      // Hash the provided password and compare
      const hashedPassword = await hashPassword(password);
      
      if (userData.password !== hashedPassword) {
        throw new Error('Incorrect password.');
      }

      // Update last login
      await updateDoc(doc(db, "users", email), {
        lastLogin: serverTimestamp()
      });

      // Return user data without password
      const { password: _, ...userWithoutPassword } = userData;
      return { ...userWithoutPassword, uid: email } as StudyQuestUser;
    } catch (error: any) {
      throw new Error(`Failed to sign in: ${error.message}`);
    }
  }

  // Get current user from localStorage
  static getCurrentUser(): StudyQuestUser | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const userStr = localStorage.getItem('studyquest_user');
      if (!userStr) return null;
      
      return JSON.parse(userStr) as StudyQuestUser;
    } catch {
      return null;
    }
  }

  // Save user to localStorage
  static saveUser(user: StudyQuestUser): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('studyquest_user', JSON.stringify(user));
  }

  // Sign out
  static signOut(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('studyquest_user');
  }

  static async awardStudentXp(uid: string, amount: number): Promise<void> {
    if (!db || !amount) {
      return;
    }

    try {
      await updateDoc(doc(db, 'users', uid), {
        xp: increment(amount)
      });
    } catch (error: any) {
      throw new Error(`Failed to award XP: ${error.message}`);
    }

    const currentUser = this.getCurrentUser();
    if (currentUser?.uid === uid) {
      const updatedUser: StudyQuestUser = {
        ...currentUser,
        xp: (currentUser.xp || 0) + amount
      };
      this.saveUser(updatedUser);
    }
  }

  static async updateUserFields(uid: string, fields: Record<string, any>): Promise<void> {
    if (!db) {
      throw new Error('Firestore is not properly configured.');
    }

    try {
      await updateDoc(doc(db, 'users', uid), fields);
    } catch (error: any) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    const currentUser = this.getCurrentUser();
    if (currentUser?.uid === uid) {
      const updatedUser: StudyQuestUser = {
        ...currentUser,
        ...fields
      };
      this.saveUser(updatedUser);
    }
  }

  static async refreshUserData(uid: string): Promise<StudyQuestUser | null> {
    if (!db) {
      return null;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) {
        return null;
      }

      const userData = { uid: userDoc.id, ...userDoc.data() } as StudyQuestUser;
      
      // Update local storage
      const currentUser = this.getCurrentUser();
      if (currentUser?.uid === uid) {
        this.saveUser(userData);
      }

      return userData;
    } catch (error: any) {
      console.error('Failed to refresh user data:', error);
      return null;
    }
  }
}