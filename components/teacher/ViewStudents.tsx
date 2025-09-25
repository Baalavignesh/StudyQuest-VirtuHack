"use client";
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faSpinner, 
  faUserGraduate,
  faChartLine,
  faTrophy,
  faFire,
  faCalendarAlt,
  faTrash,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { CourseService } from '@/services/courseService';

interface Student {
  uid: string;
  name: string;
  email: string;
  enrollmentDate?: any;
  progress?: number;
}

interface ViewStudentsProps {
  courseId: string;
  courseName: string;
  onBack: () => void;
}

export function ViewStudents({ courseId, courseName, onBack }: ViewStudentsProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingStudent, setRemovingStudent] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const enrolledStudents = await CourseService.getEnrolledStudents(courseId);
      setStudents(enrolledStudents);
    } catch (err: any) {
      console.error('Error fetching students:', err);
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const handleRemoveStudent = async (studentUid: string, studentName: string) => {
    if (!confirm(`Are you sure you want to remove ${studentName} from this course? This action cannot be undone.`)) {
      return;
    }

    try {
      setRemovingStudent(studentUid);
      await CourseService.removeStudent(courseId, studentUid);
      await fetchStudents(); // Refresh the list
    } catch (err: any) {
      console.error('Error removing student:', err);
      alert('Failed to remove student. Please try again.');
    } finally {
      setRemovingStudent(null);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600 bg-green-100';
    if (progress >= 60) return 'text-blue-600 bg-blue-100';
    if (progress >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getProgressLabel = (progress: number) => {
    if (progress >= 80) return 'Excellent';
    if (progress >= 60) return 'Good';
    if (progress >= 40) return 'Fair';
    return 'Needs Help';
  };

  const formatDate = (date: any) => {
    if (!date) return 'Unknown';
    try {
      return new Date(date.seconds * 1000).toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-quest-blue-50 via-quest-purple-50 to-quest-blue-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-4">
            <motion.button
              onClick={onBack}
              className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-quest-fire-500" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-heading font-bold text-quest-gray-800">
                Class Students
              </h1>
              <p className="text-quest-gray-600">{courseName}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-game-lg px-4 py-2 shadow-md">
            <div className="text-center">
              <FontAwesomeIcon icon={faUsers} className="text-quest-fire-500 text-lg mb-1" />
              <div className="text-2xl font-bold text-quest-gray-800">{students.length}</div>
              <div className="text-sm text-quest-gray-600">Total Students</div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          className="bg-white rounded-game-xl shadow-game p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          {loading ? (
            <div className="text-center py-12">
              <FontAwesomeIcon
                icon={faSpinner}
                className="text-4xl text-quest-fire-500 animate-spin mb-4"
              />
              <p className="text-quest-gray-600">Loading students...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <FontAwesomeIcon
                icon={faUsers}
                className="text-4xl text-red-300 mb-4"
              />
              <h3 className="text-xl font-semibold text-red-600 mb-2">
                Error Loading Students
              </h3>
              <p className="text-quest-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchStudents}
                className="bg-quest-fire-500 hover:bg-quest-fire-600 text-white font-medium py-2 px-4 rounded-game transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <FontAwesomeIcon
                icon={faUserGraduate}
                className="text-4xl text-quest-gray-300 mb-4"
              />
              <h3 className="text-2xl font-semibold text-quest-gray-700 mb-4">
                No Students Enrolled
              </h3>
              <p className="text-quest-gray-600 text-lg max-w-md mx-auto">
                Students haven&apos;t enrolled in this course yet. Share your course code with students to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Students List */}
              <div className="grid gap-4">
                {students.map((student, index) => (
                  <motion.div
                    key={student.uid}
                    className="bg-quest-gray-50 rounded-game-lg p-6 hover:shadow-md transition-shadow"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-quest-fire-500 rounded-full flex items-center justify-center text-white font-bold">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-quest-gray-800">
                            {student.name}
                          </h3>
                          <p className="text-quest-gray-600 text-sm">{student.email}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1 text-sm text-quest-gray-500">
                              <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3" />
                              Enrolled: {formatDate(student.enrollmentDate)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {/* Progress Badge */}
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getProgressColor(student.progress || 0)}`}>
                          <div className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faChartLine} className="w-3 h-3" />
                            {student.progress || 0}% · {getProgressLabel(student.progress || 0)}
                          </div>
                        </div>
                        
                        {/* Remove Button */}
                        <motion.button
                          onClick={() => handleRemoveStudent(student.uid, student.name)}
                          disabled={removingStudent === student.uid}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {removingStudent === student.uid ? (
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                          ) : (
                            <FontAwesomeIcon icon={faTrash} />
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}