import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';

interface StudentInfo {
  email: string;
  name: string;
  uid: string;
  role: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists in the users collection
    // Since we use email as document ID, we can directly get the document
    const userDoc = await getDoc(doc(db, 'users', normalizedEmail));
    
    if (!userDoc.exists()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No StudyQuest account found with this email address. The student needs to create an account first.' 
        }
      );
    }

    const userData = userDoc.data();
    
    // Check if the user is a student
    if (userData.role !== 'student') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'This email belongs to a teacher account, not a student account.' 
        }
      );
    }

    // Return student information
    const studentInfo: StudentInfo = {
      email: userData.email,
      name: userData.displayName || userData.name || 'Unknown Student',
      uid: userData.uid || userData.email, // uid might be email in our system
      role: userData.role
    };

    return NextResponse.json({
      success: true,
      student: studentInfo
    });

  } catch (error: any) {
    console.error('Error validating student email:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error checking student account. Please try again.' 
      },
      { status: 500 }
    );
  }
}