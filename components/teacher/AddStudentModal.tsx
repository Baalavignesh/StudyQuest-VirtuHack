"use client";
import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faSpinner, 
  faCheckCircle,
  faExclamationTriangle,
  faPlus
} from '@fortawesome/free-solid-svg-icons';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseName: string;
  onStudentAdded: () => void;
}

interface StudentToAdd {
  email: string;
  name: string;
  uid: string;
}

export function AddStudentModal({
  isOpen,
  onClose,
  courseId,
  courseName,
  onStudentAdded
}: AddStudentModalProps) {
  const [email, setEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    student?: StudentToAdd;
    error?: string;
  } | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setValidationResult(null);
    setSuccessMessage('');
  };

  const checkStudentExists = async () => {
    if (!email || !validateEmail(email)) {
      setValidationResult({
        isValid: false,
        error: 'Please enter a valid email address'
      });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const response = await fetch('/api/validate-student-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });

      const result = await response.json();

      if (result.success && result.student) {
        setValidationResult({
          isValid: true,
          student: result.student
        });
      } else {
        setValidationResult({
          isValid: false,
          error: result.error || 'Student not found in database'
        });
      }
    } catch (error: any) {
      setValidationResult({
        isValid: false,
        error: 'Error validating student email'
      });
    } finally {
      setIsValidating(false);
    }
  };

  const addStudent = async () => {
    if (!validationResult?.isValid || !validationResult.student) return;

    setIsAdding(true);

    try {
      const response = await fetch('/api/enroll-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          studentEmail: validationResult.student.email,
          studentUid: validationResult.student.uid
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage(`${validationResult.student.name} has been successfully added to ${courseName}!`);
        setEmail('');
        setValidationResult(null);
        onStudentAdded();
        
        // Close modal after short delay
        setTimeout(() => {
          onClose();
          setSuccessMessage('');
        }, 2000);
      } else {
        setValidationResult({
          isValid: false,
          error: result.error || 'Failed to add student to course'
        });
      }
    } catch (error: any) {
      setValidationResult({
        isValid: false,
        error: 'Error adding student to course'
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Student to Course"
      maxWidth="md"
    >
      <div className="p-6">
        {successMessage ? (
          <div className="text-center py-8">
            <FontAwesomeIcon icon={faCheckCircle} className="text-6xl text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Student Added Successfully!
            </h3>
            <p className="text-gray-600">{successMessage}</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="bg-orange-50 border border-orange-200 rounded-game p-4">
                <h4 className="font-semibold text-orange-800 mb-1">
                  Adding student to: {courseName}
                </h4>
                <p className="text-orange-700 text-sm">
                  Enter the student&apos;s email address. The student must already have a StudyQuest account.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Email Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="student@example.com"
                    className="flex-1 p-3 border border-gray-300 rounded-game focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    disabled={isValidating || isAdding}
                  />
                  <motion.button
                    onClick={checkStudentExists}
                    disabled={!email || isValidating || isAdding || validationResult?.isValid}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-game font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isValidating ? (
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                    ) : (
                      'Check'
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Validation Result */}
              {isValidating && (
                <div className="flex items-center justify-center py-4">
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin text-orange-500 mr-2" />
                  <span className="text-gray-600">Checking student account...</span>
                </div>
              )}

              {validationResult && (
                <div className={`p-4 rounded-game border ${
                  validationResult.isValid 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  {validationResult.isValid && validationResult.student ? (
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mr-3" />
                      <div>
                        <div className="font-medium text-green-800">
                          Student Found: {validationResult.student.name}
                        </div>
                        <div className="text-green-600 text-sm">
                          {validationResult.student.email}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 mr-3" />
                      <div>
                        <div className="font-medium text-red-800">
                          Unable to Add Student
                        </div>
                        <div className="text-red-600 text-sm">
                          {validationResult.error}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
              <motion.button
                onClick={onClose}
                disabled={isAdding}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-game font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={addStudent}
                disabled={!validationResult?.isValid || isAdding}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-game font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isAdding ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                    Adding Student...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Add Student to Course
                  </>
                )}
              </motion.button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}