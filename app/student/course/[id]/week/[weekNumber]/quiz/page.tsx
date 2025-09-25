"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faBolt,
  faClock,
  faCircleCheck,
  faCircleExclamation,
  faCircleQuestion,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { CourseService } from "@/services/courseService";
import { CourseData, StudentProgress, WeeklyContent, QuizSubmission } from "@/interfaces";

const QUESTION_DURATION = 60; // seconds

type QuizQuestion = NonNullable<WeeklyContent["weekly_assignment"]["questions"]>[number];

type QuizResponse = {
  questionId: string;
  selected: string | number | null;
  isCorrect: boolean;
  timedOut?: boolean;
};

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.max(seconds % 60, 0)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

function formatPoints(points: number) {
  if (!Number.isFinite(points)) {
    return "0";
  }
  return Number.isInteger(points) ? points.toString() : points.toFixed(2);
}

function QuizContent() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();

  const courseId = params.id as string;
  const weekNumber = Number(params.weekNumber);

  const [course, setCourse] = useState<(CourseData & { id: string }) | null>(null);
  const [weekContent, setWeekContent] = useState<(WeeklyContent & { id: string }) | null>(null);
  const [studentProgress, setStudentProgress] = useState<(StudentProgress & { id: string }) | null>(null);
  const [submission, setSubmission] = useState<(QuizSubmission & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const [phase, setPhase] = useState<"intro" | "question" | "result">("intro");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [timeLeft, setTimeLeft] = useState(QUESTION_DURATION);
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  const [quizEndTime, setQuizEndTime] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState("");

  useEffect(() => {
    const fetchQuizData = async () => {
      if (!courseId || Number.isNaN(weekNumber) || !user?.uid) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [courseData, weekData, progressData, submissionData] = await Promise.all([
          CourseService.getCourse(courseId),
          CourseService.getWeekContent(courseId, weekNumber),
          CourseService.getStudentProgress(courseId, user.uid),
          CourseService.getQuizSubmission(courseId, weekNumber, user.uid),
        ]);

        if (!courseData) {
          setError("Course not found.");
          return;
        }

        if (!courseData.enrolled_students.includes(user.uid)) {
          setError("You are not enrolled in this course.");
          return;
        }

        if (!weekData) {
          setError("Week content not available yet.");
          return;
        }

        setCourse(courseData as CourseData & { id: string });
        setWeekContent(weekData);
        setStudentProgress(progressData);
        setSubmission(submissionData);
      } catch (err: any) {
        console.error("Failed to load quiz:", err);
        setError(err?.message ?? "Failed to load quiz data.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [courseId, weekNumber, user?.uid]);

  const questions: QuizQuestion[] = useMemo(() => {
    return weekContent?.weekly_assignment?.questions ?? [];
  }, [weekContent]);

  const assignmentMeta = weekContent?.weekly_assignment;
  const totalQuestions = questions.length;

  const questionPointValues = useMemo(() => {
    if (!questions.length) {
      return [];
    }

    const values = questions.map((question) =>
      typeof question.points === "number" ? question.points : undefined
    );

    const unspecifiedIndexes = values
      .map((value, index) => (typeof value === "number" ? null : index))
      .filter((index): index is number => index !== null);

    if (assignmentMeta?.total_points && unspecifiedIndexes.length) {
      const specifiedTotal = values.reduce<number>((sum, value) => {
        if (typeof value === "number") {
          return sum + value;
        }
        return sum;
      }, 0);
      const remainder = assignmentMeta.total_points - specifiedTotal;
      const fillValue =
        unspecifiedIndexes.length > 0 ? remainder / unspecifiedIndexes.length : 0;

      unspecifiedIndexes.forEach((index) => {
        values[index] = fillValue > 0 ? fillValue : 0;
      });
    } else if (unspecifiedIndexes.length) {
      unspecifiedIndexes.forEach((index) => {
        values[index] = 10;
      });
    }

    return values.map((value) =>
      typeof value === "number" && !Number.isNaN(value) ? value : 0
    );
  }, [questions, assignmentMeta?.total_points]);

  const totalPossiblePoints = useMemo(() => {
    if (assignmentMeta?.total_points) {
      return assignmentMeta.total_points;
    }
    return questionPointValues.reduce((sum, value) => sum + value, 0);
  }, [assignmentMeta?.total_points, questionPointValues]);

  const weekKey = Number.isNaN(weekNumber) ? "" : String(weekNumber);
  const courseProgressForWeek = studentProgress?.weekly_progress?.[weekKey];
  const videoWatched = courseProgressForWeek?.video_watched ?? false;
  const hasSubmitted = Boolean(submission);

  const resetQuestionState = useCallback(() => {
    setTimeLeft(QUESTION_DURATION);
    setTextAnswer("");
  }, []);

  const startQuiz = () => {
    if (hasSubmitted) {
      setPhase("result");
      return;
    }

    setSubmissionError(null);
    setPhase("question");
    setCurrentQuestionIndex(0);
    setResponses([]);
    resetQuestionState();
    setQuizStartTime(Date.now());
    setQuizEndTime(null);
  };

  const evaluateCorrectness = useCallback((question: QuizQuestion, answer: string | number | null) => {
    if (answer === null || question.correct_answer === undefined || question.correct_answer === null) {
      return false;
    }

    if (typeof question.correct_answer === "number") {
      return answer === question.correct_answer;
    }

    return (
      String(answer).trim().toLowerCase() ===
      String(question.correct_answer).trim().toLowerCase()
    );
  }, []);

  const handleAnswer = useCallback(
    (answer: string | number | null, timedOut = false) => {
      const question = questions[currentQuestionIndex];
      if (!question) {
        return;
      }

      setResponses((prev) => {
        const next = [...prev];
        next[currentQuestionIndex] = {
          questionId: question.id ?? `question-${currentQuestionIndex}`,
          selected: answer,
          isCorrect: evaluateCorrectness(question, answer),
          timedOut,
        };
        return next;
      });

      const isLastQuestion = currentQuestionIndex + 1 >= totalQuestions;

      if (isLastQuestion) {
        setPhase("result");
        setQuizEndTime(Date.now());
      } else {
        setCurrentQuestionIndex((prev) => prev + 1);
        resetQuestionState();
      }
    },
    [currentQuestionIndex, totalQuestions, questions, resetQuestionState, evaluateCorrectness]
  );

  useEffect(() => {
    if (phase !== "question") {
      return;
    }

    if (!totalQuestions) {
      return;
    }

    if (timeLeft === 0) {
      handleAnswer(null, true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, timeLeft, totalQuestions, handleAnswer]);

  const score = useMemo(() => {
    return responses.filter((response) => response?.isCorrect).length;
  }, [responses]);

  const pointsEarned = useMemo(() => {
    if (!questionPointValues.length) {
      return 0;
    }

    return responses.reduce((sum, response, index) => {
      if (!response?.isCorrect) {
        return sum;
      }
      return sum + (questionPointValues[index] ?? 0);
    }, 0);
  }, [responses, questionPointValues]);

  const scorePercentage = useMemo(() => {
    if (!totalQuestions) {
      return 0;
    }
    return Math.round((score / totalQuestions) * 100);
  }, [score, totalQuestions]);

  const computedXpAward = useMemo(() => {
    if (submission?.xp_awarded !== undefined) {
      return submission.xp_awarded;
    }
    const roundedPoints = Math.round(pointsEarned);
    return Math.max(roundedPoints, score * 10);
  }, [submission?.xp_awarded, pointsEarned, score]);

  const timeTakenSeconds = useMemo(() => {
    if (!quizStartTime || !quizEndTime) {
      return 0;
    }
    return Math.max(Math.ceil((quizEndTime - quizStartTime) / 1000), 0);
  }, [quizStartTime, quizEndTime]);

  const displayPointsEarned = Math.round(pointsEarned * 100) / 100;
  const displayTotalPoints = Math.round(totalPossiblePoints * 100) / 100;

  const answeredCount = responses.filter((response) => response !== undefined).length;

  const currentQuestion = phase === "question" ? questions[currentQuestionIndex] : null;
  const progressPercentage = Math.min(
    100,
    ((QUESTION_DURATION - timeLeft) / QUESTION_DURATION) * 100
  );

  useEffect(() => {
    if (phase !== "result") {
      return;
    }
    if (!user?.uid || hasSubmitted || isSubmitting) {
      return;
    }
    if (!quizStartTime || !quizEndTime) {
      return;
    }
    if (!totalQuestions || !questions.length) {
      return;
    }

    const answeredQuestions = responses.filter((response) => response !== undefined).length;
    if (answeredQuestions < totalQuestions) {
      return;
    }

    const submitResults = async () => {
      try {
        setIsSubmitting(true);
        setSubmissionError(null);

        const answersPayload = questions.map((question, index) => {
          const response = responses[index];
          const pointsAwarded = response?.isCorrect
            ? Math.round((questionPointValues[index] ?? 0) * 100) / 100
            : 0;

          return {
            questionId: question.id ?? `question-${index}`,
            selected: response?.selected ?? null,
            isCorrect: response?.isCorrect ?? false,
            timedOut: response?.timedOut ?? false,
            pointsAwarded,
          };
        });

        const totalPointsForSubmission =
          Math.round(
            ((totalPossiblePoints || questionPointValues.reduce((sum, value) => sum + value, 0)) * 100)
          ) / 100;

        const xpAwardValue = Math.max(Math.round(pointsEarned), score * 10);

        const result = await CourseService.submitQuizResult({
          courseId,
          weekNumber,
          studentUid: user.uid,
          answers: answersPayload,
          correctAnswers: score,
          pointsEarned,
          totalPoints: totalPointsForSubmission,
          totalQuestions,
          scorePercentage,
          timeTakenSeconds,
          startedAt: new Date(quizStartTime).toISOString(),
          completedAt: new Date(quizEndTime).toISOString(),
          xpAward: xpAwardValue,
        });

        setSubmission(result);
        setSubmissionError(null);

        setStudentProgress((prev) => {
          if (!prev) {
            return prev;
          }

          const weekKeyLocal = String(weekNumber);
          const previouslyCompleted = prev.completed_weeks?.includes(weekNumber);
          const updatedCompletedWeeks = previouslyCompleted
            ? prev.completed_weeks
            : [...(prev.completed_weeks ?? []), weekNumber].sort((a, b) => a - b);

          const previousWeekProgress =
            prev.weekly_progress?.[weekKeyLocal] ?? {
              video_watched: false,
              assignment_completed: false,
              daily_challenges_completed: [],
              total_daily_points: 0,
            };

          const updatedWeekProgress = {
            ...previousWeekProgress,
            assignment_completed: true,
            assignment_score: result.points_earned,
            assignment_submitted_at: result.completed_at,
          };

          const updatedWeeklyProgress = {
            ...prev.weekly_progress,
            [weekKeyLocal]: updatedWeekProgress,
          };

          const totalWeeksFromCourse = course?.course_details?.duration_weeks;
          const safeCompletedWeeks = updatedCompletedWeeks ?? [];
          const courseTotalWeeks =
            totalWeeksFromCourse && totalWeeksFromCourse > 0
              ? totalWeeksFromCourse
              : Math.max(safeCompletedWeeks.length, 1);
          const updatedOverallProgress = Math.round(
            (safeCompletedWeeks.length / courseTotalWeeks) * 100
          );

          const nextWeekCandidate = Math.min(weekNumber + 1, courseTotalWeeks);

          return {
            ...prev,
            weekly_progress: updatedWeeklyProgress,
            completed_weeks: updatedCompletedWeeks,
            overall_progress: updatedOverallProgress,
            total_points: previouslyCompleted
              ? prev.total_points
              : (prev.total_points || 0) + result.xp_awarded,
            current_week: previouslyCompleted
              ? prev.current_week
              : Math.max(prev.current_week, nextWeekCandidate),
          };
        });
      } catch (err: any) {
        console.error('Failed to submit quiz results:', err);
        setSubmissionError(err?.message ?? 'Failed to save quiz results.');
      } finally {
        setIsSubmitting(false);
      }
    };

    submitResults();
  }, [
    phase,
    user?.uid,
    hasSubmitted,
    isSubmitting,
    quizStartTime,
    quizEndTime,
    totalQuestions,
    questions,
    responses,
    questionPointValues,
    totalPossiblePoints,
    pointsEarned,
    score,
    scorePercentage,
    timeTakenSeconds,
    courseId,
    weekNumber,
    course,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon
            icon={faCircleQuestion}
            className="text-6xl text-quest-blue-500 animate-spin mb-4"
          />
          <p className="text-gray-600 text-lg">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md bg-white border border-gray-200 rounded-game-lg p-8 text-center shadow-sm">
          <FontAwesomeIcon
            icon={faCircleExclamation}
            className="text-4xl text-red-500 mb-4"
          />
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Quiz Unavailable</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push(`/student/course/${courseId}/week/${weekNumber}`)}
            className="bg-quest-blue-500 hover:bg-quest-blue-600 text-white font-medium py-2 px-4 rounded-game transition-colors"
          >
            Return to Week Overview
          </button>
        </div>
      </div>
    );
  }

  if (!weekContent || !course) {
    return null;
  }

  if (!assignmentMeta?.created || totalQuestions === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-12 flex-1 flex items-center justify-center">
          <div className="max-w-lg bg-white border border-gray-200 rounded-game-lg p-10 text-center shadow-sm">
            <FontAwesomeIcon
              icon={faCircleQuestion}
              className="text-4xl text-quest-blue-500 mb-4"
            />
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Quiz Coming Soon</h2>
            <p className="text-gray-600 mb-6">
              Your teacher has not published this week&apos;s quiz yet. Check back after they finish setting it up.
            </p>
            <button
              onClick={() => router.push(`/student/course/${courseId}/week/${weekNumber}`)}
              className="bg-quest-blue-500 hover:bg-quest-blue-600 text-white font-medium py-2 px-4 rounded-game transition-colors"
            >
              Back to Week Overview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-quest-blue-50 via-quest-purple-50 to-quest-blue-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.push(`/student/course/${courseId}/week/${weekNumber}`)}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium mb-6 transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back to Week {weekNumber}
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-gray-200 rounded-game-lg shadow-sm p-6 md:p-10"
        >
          {phase === "intro" && (
            <div className="grid gap-8 md:grid-cols-[1.1fr,0.9fr]">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Week {weekNumber} Blitz Quiz
                </h1>
                <p className="text-gray-600 mb-6">
                  You&apos;re about to sprint through {totalQuestions} fast-paced questions covering {weekContent.topic}. Stay focused—each question gives you just one minute.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="bg-quest-blue-50 border border-quest-blue-200 rounded-game p-4">
                    <div className="flex items-center text-quest-blue-600 font-semibold mb-2">
                      <FontAwesomeIcon icon={faClock} className="mr-2" />
                      Timing Rules
                    </div>
                    <ul className="text-sm text-quest-blue-700 space-y-1">
                      <li>• 60 seconds per question</li>
                      <li>• Timer resets when you answer</li>
                      <li>• Auto-moves on timeout</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-game p-4">
                    <div className="flex items-center text-purple-600 font-semibold mb-2">
                      <FontAwesomeIcon icon={faBolt} className="mr-2" />
                      Quick Tips
                    </div>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Review your study notes</li>
                      <li>• Trust your first instinct</li>
                      <li>• Stay calm and keep pace</li>
                    </ul>
                  </div>
                </div>

                {assignmentMeta?.total_points !== undefined && (
                  <div className="mt-6 text-sm text-gray-600">
                    This quiz is worth {assignmentMeta.total_points} points in your weekly grade.
                  </div>
                )}
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-game p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Quiz Summary</h2>
                <div className="space-y-4 text-sm text-gray-700">
                  <div className="flex items-center justify-between">
                    <span>Total Questions</span>
                    <span className="font-semibold">{totalQuestions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Time Allocation</span>
                    <span className="font-semibold">{totalQuestions} minutes max</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Difficulty Mix</span>
                    <span className="font-semibold capitalize">{currentQuestion?.difficulty ?? questions[0]?.difficulty ?? "varied"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Lesson Video</span>
                    <span className={`font-semibold ${videoWatched ? "text-green-600" : "text-amber-600"}`}>
                      {videoWatched ? "Watched" : "Not yet"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={startQuiz}
                  disabled={hasSubmitted}
                  className={`mt-6 w-full font-semibold py-3 rounded-game transition-colors ${
                    hasSubmitted
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-quest-blue-500 hover:bg-quest-blue-600 text-white'
                  }`}
                >
                  {hasSubmitted ? 'Quiz Submitted' : 'Launch Quiz'}
                </button>

                {!hasSubmitted && !videoWatched && (
                  <p className="mt-3 text-xs text-amber-600 text-center">
                    Tip: watching the lesson video first can help you move faster through the quiz.
                  </p>
                )}
              </div>
            </div>
          )}

          {phase === "question" && currentQuestion && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div className="text-sm font-medium text-gray-700">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </div>
                <div className="flex items-center text-quest-blue-600 font-semibold mt-3 md:mt-0">
                  <FontAwesomeIcon icon={faClock} className="mr-2" />
                  {formatTime(timeLeft)}
                </div>
              </div>

              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-6">
                <div
                  className="h-full bg-quest-blue-500 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-game p-6 mb-6">
                <div className="flex items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-quest-blue-100 text-quest-blue-600 flex items-center justify-center mr-4">
                    <FontAwesomeIcon icon={faCircleQuestion} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                      {currentQuestion.question}
                    </h2>
                    <p className="text-sm text-gray-500 capitalize">
                      Difficulty: {currentQuestion.difficulty}
                    </p>
                  </div>
                </div>

                {currentQuestion.type === "mcq" && currentQuestion.options ? (
                  <div className="grid gap-3">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={`${currentQuestion.id ?? "question"}-${index}`}
                        onClick={() => handleAnswer(index)}
                        className="text-left border border-gray-200 hover:border-quest-blue-400 hover:bg-quest-blue-50 rounded-game px-4 py-3 transition-colors"
                      >
                        <span className="font-semibold text-quest-blue-600 mr-2">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        {option}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <textarea
                      value={textAnswer}
                      onChange={(event) => setTextAnswer(event.target.value)}
                      className="w-full border border-gray-300 rounded-game px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-quest-blue-500 focus:border-transparent"
                      rows={4}
                      placeholder="Type your response..."
                    />
                    <button
                      onClick={() => handleAnswer(textAnswer)}
                      className="inline-flex items-center bg-quest-blue-500 hover:bg-quest-blue-600 text-white font-semibold py-2 px-4 rounded-game transition-colors"
                    >
                      Submit Answer
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Auto-advances when the timer hits 0</span>
                <span>{answeredCount} / {totalQuestions} answered</span>
              </div>
            </div>
          )}

          {phase === "result" && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                <FontAwesomeIcon icon={faCircleCheck} className="text-2xl" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
              <p className="text-gray-600 mb-4">
                Great effort on this lightning round. Here&apos;s how you did.
              </p>

              {isSubmitting && (
                <div className="flex items-center justify-center text-sm text-quest-blue-600 mb-2">
                  <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
                  Saving your results...
                </div>
              )}
              {submissionError && (
                <p className="text-sm text-red-600 mb-2">{submissionError}</p>
              )}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="bg-quest-blue-50 border border-quest-blue-200 rounded-game p-4 text-left">
                  <div className="text-sm text-quest-blue-600 mb-1">Correct Answers</div>
                  <div className="text-2xl font-bold text-quest-blue-700">{score}/{totalQuestions}</div>
                  <div className="text-xs text-quest-blue-600 mt-1">Accuracy {scorePercentage}%</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-game p-4 text-left">
                  <div className="text-sm text-purple-600 mb-1">Points Earned</div>
                  <div className="text-2xl font-bold text-purple-700">
                    {formatPoints(displayPointsEarned)}
                    {displayTotalPoints ? ` / ${formatPoints(displayTotalPoints)}` : ""}
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-game p-4 text-left">
                  <div className="text-sm text-green-600 mb-1">XP Awarded</div>
                  <div className="text-2xl font-bold text-green-700">{computedXpAward}</div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-game p-4 text-left">
                  <div className="text-sm text-amber-600 mb-1">Time Used</div>
                  <div className="text-2xl font-bold text-amber-700">
                    {timeTakenSeconds ? formatTime(timeTakenSeconds) : "--:--"}
                  </div>
                </div>
              </div>

              <div className="text-left bg-gray-50 border border-gray-200 rounded-game p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Question Review</h3>
                <div className="space-y-4">
                  {questions.map((question, index) => {
                    const response = responses[index];
                    const answeredOption =
                      typeof response?.selected === "number" && question.options
                        ? question.options[response.selected]
                        : response?.selected;
                    const correctOption =
                      typeof question.correct_answer === "number" && question.options
                        ? question.options[question.correct_answer]
                        : question.correct_answer;

                    return (
                      <div
                        key={question.id ?? `review-${index}`}
                        className="bg-white border border-gray-200 rounded-game p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-gray-800">
                            Q{index + 1}. {question.question}
                          </h4>
                          <span
                            className={`text-sm font-semibold ${response?.isCorrect ? "text-green-600" : "text-red-500"}`}
                          >
                            {response?.isCorrect ? "Correct" : response?.timedOut ? "Timed Out" : "Missed"}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <span className="font-medium text-gray-700">Your answer:</span>
                            {answeredOption !== undefined && answeredOption !== null && answeredOption !== ""
                              ? ` ${answeredOption}`
                              : " —"}
                          </p>
                          <p>
                            <span className="font-medium text-gray-700">Correct answer:</span>
                            {correctOption !== undefined && correctOption !== null
                              ? ` ${correctOption}`
                              : " —"}
                          </p>
                          {question.explanation && (
                            <p className="text-xs text-gray-500 mt-2">{question.explanation}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-6">
                Your score and XP are synced with your dashboard. Review the breakdown above or jump back to the weekly hub.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => router.push(`/student/course/${courseId}/week/${weekNumber}`)}
                  className="inline-flex items-center justify-center bg-quest-blue-500 hover:bg-quest-blue-600 text-white font-semibold py-2 px-6 rounded-game transition-colors"
                >
                  Back to Week
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function WeekQuizPage() {
  return (
    <ProtectedRoute requiredRole="student">
      <QuizContent />
    </ProtectedRoute>
  );
}

