# Complete Firebase Database Structure for StudyQuest

## Main Course Document Structure

```javascript
{
  // Extracted from syllabus
  "course_details": { /* ... existing structure ... */ },
  "class_information": { /* ... existing structure ... */ },
  "schedule": { /* ... existing structure ... */ },
  "exam_schedule": { /* ... existing structure ... */ },
  "weekly_topics": [ /* ... existing structure ... */ ],
  "assessment_info": { /* ... existing structure ... */ },
  
  // Course management
  "created_by": "teacher_uid",
  "created_at": "timestamp",
  "last_modified": "timestamp",
  "course_code": "MATH5A2024", // unique identifier for students to join
  
  // Student management
  "enrolled_students": ["student_uid1", "student_uid2"],
  "student_count": 24,
  "max_students": 30
}
```

## Weekly Content Subcollection: `/courses/{courseId}/weeks/{weekNumber}`

```javascript
{
  "week_number": 1,
  "topic": "Place Value and Number Sense",
  "description": "millions place, rounding, comparing large numbers",
  
  // Teacher content
  "video": {
    "uploaded": true,
    "video_url": "firebase_storage_url",
    "video_duration": 450, // seconds
    "upload_date": "timestamp"
  },
  
  "weekly_assignment": {
    "created": true,
    "questions": [
      {
        "id": "q1",
        "question": "What is 45,672 rounded to the nearest thousand?",
        "type": "mcq",
        "options": ["45,000", "46,000", "50,000", "45,700"],
        "correct_answer": 1,
        "difficulty": "medium",
        "points": 10
      }
    ],
    "total_questions": 15,
    "total_points": 150,
    "time_limit": 1800 // 30 minutes in seconds
  },
  
  "daily_challenges": [
    {
      "day": 1,
      "question": "Which number is larger: 45,672 or 45,627?",
      "type": "mcq",
      "options": ["45,672", "45,627", "They are equal"],
      "correct_answer": 0,
      "points": 5
    }
    // ... days 2-5
  ],
  
  "due_date": "2024-09-13"
}
```

## Student Progress Collection: `/courses/{courseId}/student_progress/{studentId}`

```javascript
{
  "student_uid": "student123",
  "enrollment_date": "timestamp",
  "current_week": 3,
  "overall_progress": 65, // percentage
  
  "weekly_progress": {
    "1": {
      "video_watched": true,
      "assignment_completed": true,
      "assignment_score": 85,
      "assignment_submitted_at": "timestamp",
      "daily_challenges_completed": [1, 2, 3, 4, 5],
      "total_daily_points": 25
    }
  },
  
  "streaks": {
    "current_streak": 12,
    "longest_streak": 15,
    "last_activity": "timestamp"
  },
  
  "total_points": 1250,
  
  "exam_scores": {
    "midterm": 78,
    "final": null
  }
}
```

## Class Analytics Collection: `/courses/{courseId}/analytics`

```javascript
{
  "class_performance": {
    "average_score": 82.5,
    "completion_rate": 95.8,
    "active_students": 23,
    "struggling_students": ["student_uid1", "student_uid2"]
  },
  
  "weekly_analytics": {
    "1": {
      "video_watch_rate": 96,
      "assignment_completion_rate": 88,
      "average_score": 85,
      "common_mistakes": ["place_value_confusion", "rounding_errors"]
    }
  },
  
  "engagement_metrics": {
    "daily_active_users": 20,
    "average_session_time": 45 // minutes
  }
}
```

## Additional Collections You Should Consider:

### `/user_profiles/{userId}` (Students & Teachers)
```javascript
{
  "role": "student", // student, teacher, admin
  "name": "John Doe",
  "email": "john@email.com",
  "avatar_url": "storage_url",
  "school": "Jefferson Elementary",
  "grade": "5th",
  "parent_email": "parent@email.com", // for students
  "enrolled_courses": ["course_id1", "course_id2"],
  "created_at": "timestamp"
}
```

### `/quiz_submissions/{submissionId}`
```javascript
{
  "student_uid": "student123",
  "course_id": "course456",
  "week_number": 1,
  "type": "weekly_assignment", // weekly_assignment, daily_challenge, midterm, final
  "answers": [0, 1, 2, 0, 1], // array of selected option indices
  "score": 85,
  "time_taken": 1200, // seconds
  "submitted_at": "timestamp"
}
```

### `/leaderboards/{courseId}`
```javascript
{
  "weekly": {
    "1": [
      {"student_uid": "student1", "points": 150, "rank": 1},
      {"student_uid": "student2", "points": 145, "rank": 2}
    ]
  },
  "overall": [
    {"student_uid": "student1", "total_points": 1250, "rank": 1}
  ],
  "last_updated": "timestamp"
}
```

## Key Design Considerations:

1. **Scalability**: Use subcollections for weekly content to avoid document size limits
2. **Real-time**: Structure supports real-time leaderboards and progress tracking
3. **Security**: Each collection can have specific Firestore security rules
4. **Analytics**: Built-in analytics structure for teacher dashboard insights
5. **Flexibility**: Easy to add new question types, gamification features later
6. **Parent Access**: Student progress easily shareable with parents

This structure supports your current features while being extensible for future enhancements!