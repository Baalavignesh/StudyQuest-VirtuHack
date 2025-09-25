import { NextRequest, NextResponse } from 'next/server';
import { CourseService } from '@/services/courseService';

export async function POST(request: NextRequest) {
  try {
    const { courseId, studentEmail, studentUid } = await request.json();
    
    if (!courseId || !studentEmail || !studentUid) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get course to check if it exists and has space
    const course = await CourseService.getCourse(courseId);
    
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if course is full
    if (course.student_count >= course.max_students) {
      return NextResponse.json(
        { success: false, error: 'Course is full. Cannot add more students.' },
        { status: 400 }
      );
    }

    // Check if student is already enrolled
    if (course.enrolled_students.includes(studentUid)) {
      return NextResponse.json(
        { success: false, error: 'Student is already enrolled in this course' },
        { status: 400 }
      );
    }

    // Enroll the student
    await CourseService.enrollStudent(courseId, studentUid);

    return NextResponse.json({
      success: true,
      message: 'Student enrolled successfully'
    });

  } catch (error: any) {
    console.error('Error enrolling student:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to enroll student in course' 
      },
      { status: 500 }
    );
  }
}