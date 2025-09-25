import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { CourseService } from '@/services/courseService';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_APIKEY,
});

export async function POST(request: NextRequest) {
  try {
    const { fileId, teacherUid, teacherName, createCourse = false } = await request.json();
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'No file ID provided' },
        { status: 400 }
      );
    }

    // Create an assistant for syllabus analysis
    const assistant = await openai.beta.assistants.create({
      name: "Syllabus Analyzer",
      instructions: `You are an AI assistant that extracts course information from uploaded syllabus documents and structures it for a gamified learning platform called StudyQuest. Extract all relevant information and format it according to the specified JSON schema.

Extract the following information from the uploaded syllabus document and return it in JSON format:

{
  "course_details": {
    "course_title": "string",
    "subject": "string",
    "grade_level": "string", 
    "duration_weeks": "number",
    "school_year": "string"
  },
  "class_information": {
    "class_name": "string",
    "teacher_name": "string",
    "room_number": "string",
    "class_size": "number"
  },
  "schedule": {
    "start_date": "YYYY-MM-DD",
    "end_date": "YYYY-MM-DD", 
    "class_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "class_time": "string"
  },
  "exam_schedule": {
    "midterm_week": "number",
    "final_exam_week": "number",
    "midterm_date": "YYYY-MM-DD",
    "final_exam_date": "YYYY-MM-DD"
  },
  "weekly_topics": [
    {
      "week": 1,
      "topic": "string",
      "description": "string"
    },
    {
      "week": 2, 
      "topic": "string",
      "description": "string"
    }
    // Continue for all weeks
  ],
  "assessment_info": {
    "weekly_assignment_due_day": "string",
    "grading_breakdown": {
      "daily_assignments": "percentage",
      "weekly_quizzes": "percentage", 
      "monthly_tests": "percentage",
      "midterm_exam": "percentage",
      "final_exam": "percentage"
    }
  }
}

Instructions:
1. If any information is not explicitly stated, use null for that field
2. Extract week-by-week topics exactly as listed in the syllabus
3. Convert all dates to YYYY-MM-DD format
4. For grade_level, use format like "5th Grade" or "Grade 5"
5. For duration_weeks, count the total number of instructional weeks
6. If midterm/final weeks are not numbered, estimate based on the schedule
7. Extract class days from any mention of when classes meet
8. For percentages, include the % symbol in the string

Return only the JSON object, no additional text or formatting.`,
      model: "gpt-4o-mini",
      tools: [{ type: "file_search" }]
    });

    // Create a thread with the file
    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: "user",
          content: "Extract the following information from the uploaded syllabus document and return it in JSON format as specified in your instructions. Return only the JSON object, no additional text or formatting.",
          attachments: [
            {
              file_id: fileId,
              tools: [{ type: "file_search" }]
            }
          ]
        }
      ]
    });

    if (!thread || !thread.id) {
      throw new Error('Failed to create thread');
    }
    if (!assistant || !assistant.id) {
      throw new Error('Failed to create assistant');
    }

    console.log('Thread created:', thread.id);
    console.log('Assistant created:', assistant.id);

    // Run the assistant
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id
    });

    if (!run || !run.id) {
      throw new Error('Failed to create run');
    }

    console.log('Run created:', run.id);

    // Wait for completion with timeout
    let runStatus = run;
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds timeout
    
    while ((runStatus.status === 'queued' || runStatus.status === 'in_progress') && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      try {
        console.log('Retrieving run status for thread:', thread.id, 'run:', run.id);
        
        // Try the newer API structure first
        try {
          // @ts-ignore - OpenAI v5 typing issue
          runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        } catch (apiError: any) {
          console.log('First API call failed, trying alternative structure:', apiError.message);
          // Fallback to alternative API structure
          runStatus = await openai.beta.threads.runs.retrieve(run.id, { thread_id: thread.id });
        }
        
        console.log('Run status:', runStatus.status);
      } catch (retrieveError: any) {
        console.error('Error retrieving run status:', retrieveError.message);
        console.error('Full error:', retrieveError);
        throw new Error(`Failed to retrieve run status: ${retrieveError.message}`);
      }
      attempts++;
    }

    if (runStatus.status === 'completed') {
      // Get the response
      const messages = await openai.beta.threads.messages.list(thread.id);
      const response = messages.data[0].content[0];
      
      if (response.type === 'text') {
        try {
          // Extract JSON from the response (remove any markdown formatting)
          let jsonText = response.text.value;
          const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            jsonText = jsonMatch[0];
          }
          
          // Parse JSON response
          const analysisResult = JSON.parse(jsonText);
          
          let courseId = null;
          
          // Create course in Firestore if requested
          if (createCourse && teacherUid && teacherName) {
            try {
              courseId = await CourseService.createCourse(
                analysisResult,
                teacherUid,
                teacherName
              );
              console.log('Course created with ID:', courseId);
            } catch (courseError: any) {
              console.error('Failed to create course in Firestore:', courseError.message);
              // Return error response if course creation fails
              return NextResponse.json(
                { success: false, error: `Failed to create course: ${courseError.message}` },
                { status: 500 }
              );
            }
          }
          
          // Cleanup
          await openai.beta.assistants.delete(assistant.id);
          
          return NextResponse.json({
            success: true,
            analysisResult,
            courseId
          });
        } catch (parseError) {
          console.error('JSON parsing error:', parseError);
          // Cleanup
          await openai.beta.assistants.delete(assistant.id);
          
          // Return a structured error response with new format
          return NextResponse.json({
            success: true,
            analysisResult: {
              course_details: {
                course_title: 'Analyzed Course',
                subject: 'General',
                grade_level: null,
                duration_weeks: null,
                school_year: null
              },
              class_information: {
                class_name: null,
                teacher_name: null,
                room_number: null,
                class_size: null
              },
              schedule: {
                start_date: null,
                end_date: null,
                class_days: [],
                class_time: null
              },
              exam_schedule: {
                midterm_week: null,
                final_exam_week: null,
                midterm_date: null,
                final_exam_date: null
              },
              weekly_topics: [],
              assessment_info: {
                weekly_assignment_due_day: null,
                grading_breakdown: {
                  daily_assignments: null,
                  weekly_quizzes: null,
                  monthly_tests: null,
                  midterm_exam: null,
                  final_exam: null
                }
              },
              error: 'Failed to parse AI response',
              rawResponse: response.text.value
            }
          });
        }
      }
    }

    // Cleanup on failure
    await openai.beta.assistants.delete(assistant.id);
    
    return NextResponse.json(
      { error: `Analysis failed with status: ${runStatus.status}` },
      { status: 500 }
    );

  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: `Analysis failed: ${error.message}` },
      { status: 500 }
    );
  }
}