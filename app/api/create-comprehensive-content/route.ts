import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { CourseService } from '@/services/courseService';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_APIKEY,
});

interface ContentGenerationRequest {
  courseId: string;
  weekData: {
    week_number: number;
    topic: string;
    description: string;
  };
  formData: {
    additionalDescription: string;
    learningFocus: string[];
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
    contentDepth: 'basic' | 'detailed' | 'comprehensive';
    includeExamples: boolean;
    includePracticeProblems: boolean;
    timeEstimate: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { courseId, weekData, formData }: ContentGenerationRequest = await request.json();
    
    if (!courseId || !weekData || !formData) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Create comprehensive educational content generation prompt
    const systemPrompt = `You are an expert educational content creator that generates comprehensive learning materials for K-12 students. You create complete educational packages that include study materials, practice examples, and assessments.

Your task is to generate a complete educational content package in JSON format that includes:
1. Detailed lesson content with explanations and examples
2. Practice materials with worked examples and practice problems  
3. Assessment questions with detailed explanations
4. Learning objectives and key vocabulary

Always provide educational content appropriate for the specified grade level and difficulty.`;

    const userPrompt = `Create a comprehensive educational content package for:

**Week Information:**
- Week Number: ${weekData.week_number}
- Topic: "${weekData.topic}"
- Description: "${weekData.description}"

**Additional Context:**
${formData.additionalDescription || 'No additional context provided'}

**Content Requirements:**
- Learning Focus: ${formData.learningFocus.join(', ') || 'General understanding'}
- Difficulty Level: ${formData.difficultyLevel}
- Content Depth: ${formData.contentDepth}
- Include Examples: ${formData.includeExamples ? 'Yes' : 'No'}
- Include Practice Problems: ${formData.includePracticeProblems ? 'Yes' : 'No'}
- Estimated Study Time: ${formData.timeEstimate} minutes

**Output Requirements:**
Generate a JSON object with the following structure:

{
  "study_content": {
    "lesson_content": {
      "introduction": "Engaging introduction to the topic (2-3 sentences)",
      "main_concepts": [
        {
          "title": "First Key Concept",
          "explanation": "Clear, detailed explanation of the concept",
          "examples": ["Example 1", "Example 2", "Example 3"]
        },
        {
          "title": "Second Key Concept", 
          "explanation": "Clear, detailed explanation",
          "examples": ["Example 1", "Example 2"]
        }
        // Include 3-5 main concepts based on content depth
      ],
      "key_vocabulary": [
        {
          "term": "Important Term 1",
          "definition": "Clear definition",
          "example": "Usage example"
        }
        // Include 5-8 key terms
      ],
      "step_by_step_guide": [
        {
          "step": 1,
          "title": "Step Title",
          "description": "What to do in this step",
          "example": "Concrete example"
        }
        // Include 4-6 steps for problem-solving or process
      ],
      "summary": "Comprehensive summary of key learnings (3-4 sentences)",
      "learning_objectives": [
        "Students will be able to...",
        "Students will understand...",
        "Students will demonstrate..."
        // Include 3-5 specific, measurable objectives
      ]
    },
    "practice_materials": {
      "worked_examples": [
        {
          "problem": "Complete problem statement",
          "solution_steps": [
            "Step 1: What to do first",
            "Step 2: Next action",
            "Step 3: Final calculation"
          ],
          "final_answer": "The complete answer",
          "explanation": "Why this approach works"
        }
        // Include 3-5 worked examples
      ],
      "practice_problems": [
        {
          "problem": "Practice problem for students to solve",
          "hint": "Helpful hint if needed",
          "solution": "Complete solution with explanation",
          "difficulty": "easy|medium|hard"
        }
        // Include 5-8 practice problems with mix of difficulties
      ]
    },
    "additional_resources": [
      {
        "title": "Resource Title",
        "type": "reading|video|exercise|link",
        "content": "Resource content or URL",
        "description": "Brief description of the resource"
      }
      // Include 2-4 additional resources
    ]
  },
  "assessment_questions": [
    {
      "id": "q1",
      "question": "Complete question text",
      "type": "mcq",
      "options": [
        "Option A",
        "Option B", 
        "Option C",
        "Option D"
      ],
      "correct_answer": 0,
      "difficulty": "easy|medium|hard",
      "points": 5,
      "explanation": "Detailed explanation of why this is correct",
      "learning_objective": "Which learning objective this tests"
    }
    // Generate exactly 10 questions with mix: 3 easy, 5 medium, 2 hard
    // Points: easy=5, medium=10, hard=15
  ]
}

**Content Guidelines:**
1. Make content age-appropriate and engaging
2. Use clear, simple language students can understand
3. Include real-world applications and relatable examples
4. Ensure examples and practice problems are diverse and inclusive
5. Create meaningful connections between concepts
6. Assessment questions should test understanding, not just memorization
7. Provide detailed explanations that help students learn from mistakes
8. Make content depth appropriate to the specified level
9. Ensure all content aligns with the learning objectives

Generate the complete educational package now:`;

    // Create OpenAI completion
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      throw new Error('No response from OpenAI');
    }

    // Extract JSON from response
    let jsonText = responseContent;
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    let generatedContent;
    try {
      generatedContent = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      throw new Error('Failed to parse generated content');
    }

    // Update the course's weekly content with the generated materials
    try {
      await CourseService.updateWeeklyContent(courseId, weekData.week_number, {
        study_content: {
          created: true,
          lesson_content: generatedContent.study_content.lesson_content,
          practice_materials: generatedContent.study_content.practice_materials,
          additional_resources: generatedContent.study_content.additional_resources,
          created_at: new Date()
        },
        weekly_assignment: {
          created: true,
          questions: generatedContent.assessment_questions,
          total_questions: generatedContent.assessment_questions.length,
          total_points: generatedContent.assessment_questions.reduce((sum: number, q: any) => sum + q.points, 0),
          time_limit: formData.timeEstimate
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Comprehensive educational content generated successfully',
        content: generatedContent
      });

    } catch (updateError: any) {
      console.error('Failed to update course content:', updateError);
      return NextResponse.json(
        { error: `Failed to save content: ${updateError.message}` },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Content generation error:', error);
    return NextResponse.json(
      { error: `Content generation failed: ${error.message}` },
      { status: 500 }
    );
  }
}