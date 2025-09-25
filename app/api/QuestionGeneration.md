Create a weekly assignment for 5th grade mathematics with the following specifications:

**Week Information:**
- Week Number: {week_number}
- Topic: "{topic_title}"
- Learning Objectives: "{learning_objectives}"
- Grade Level: 5th Grade

**Assignment Requirements:**
- Generate exactly 15 multiple choice questions
- Each question should have 4 answer choices (A, B, C, D)
- Include a mix of difficulty levels: 5 easy, 7 medium, 3 hard
- Points per question: Easy = 5 points, Medium = 10 points, Hard = 15 points
- Cover all aspects of the weekly topic
- Use real-world applications where appropriate
- Include common student misconceptions as wrong answer choices

**Question Types to Include:**
- Direct computation problems
- Word problems with practical scenarios
- Conceptual understanding questions
- Multi-step problems
- Visual/diagram-based questions (describe the visual in text)

**Output Format:**
Return a JSON object with the following structure:

{
  "assignment_info": {
    "week_number": {week_number},
    "topic": "{topic_title}",
    "total_questions": 15,
    "total_points": 150,
    "estimated_time": 30
  },
  "questions": [
    {
      "id": "q1",
      "question": "What is the value of the digit 7 in the number 47,382?",
      "type": "mcq",
      "options": [
        "7",
        "70",
        "700",
        "7,000"
      ],
      "correct_answer": 3,
      "difficulty": "easy",
      "points": 5,
      "explanation": "The digit 7 is in the thousands place, so its value is 7,000.",
      "learning_objective": "understand place value"
    },
    {
      "id": "q2",
      "question": "Sarah has 3/4 of a pizza. She eats 1/4 of the whole pizza. How much pizza does she have left?",
      "type": "mcq", 
      "options": [
        "1/2",
        "2/4", 
        "1/4",
        "3/8"
      ],
      "correct_answer": 0,
      "difficulty": "medium",
      "points": 10,
      "explanation": "3/4 - 1/4 = 2/4 = 1/2 of the pizza remains.",
      "learning_objective": "subtract fractions with like denominators"
    }
    // Continue for all 15 questions
  ]
}

**Important Guidelines:**
1. Make distractors (wrong answers) believable - use common student errors
2. Ensure questions are grade-appropriate for 5th graders
3. Use clear, simple language in questions
4. Include diverse problem contexts (money, measurement, real-world scenarios)
5. Avoid trick questions or ambiguous wording
6. Make sure correct_answer index corresponds to the right option (0-indexed)
7. Each explanation should be 1-2 sentences explaining the correct solution

Generate questions now for:
Week {week_number}: {topic_title}
Learning Objectives: {learning_objectives}