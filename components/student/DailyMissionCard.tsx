"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSignInAlt, 
  faQuestionCircle, 
  faBrain,
  faCheck,
  faTimes,
  faFire
} from '@fortawesome/free-solid-svg-icons';
import { DailyMissionTaskState, DailyMissionQuestionState, DailyMissionFocusState } from '@/interfaces';

interface DailyMissionCardProps {
  type: 'login' | 'question' | 'focus';
  task: DailyMissionTaskState | DailyMissionQuestionState | DailyMissionFocusState;
  onComplete: (data?: any) => Promise<void>;
  loading?: boolean;
}

export function DailyMissionCard({ type, task, onComplete, loading = false }: DailyMissionCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [answer, setAnswer] = useState<string | number | null>(null);
  const [reflection, setReflection] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getIcon = () => {
    switch (type) {
      case 'login':
        return faSignInAlt;
      case 'question':
        return faQuestionCircle;
      case 'focus':
        return faBrain;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'login':
        return 'Daily Login';
      case 'question':
        return 'Daily Challenge';
      case 'focus':
        return 'Focus Reflection';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'login':
        return 'Start your learning journey today';
      case 'question':
        return 'Answer a question from your courses';
      case 'focus':
        return 'Reflect on your learning goals';
    }
  };

  const getXpReward = () => {
    switch (type) {
      case 'login':
        return '10 XP';
      case 'question':
        return '10-20 XP';
      case 'focus':
        return '15 XP';
    }
  };

  const handleCardClick = async () => {
    if (task.completed || loading) return;

    if (type === 'login') {
      // Auto-complete login mission
      await onComplete();
    } else {
      // Open modal for question or focus missions
      setShowModal(true);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;

    setSubmitting(true);
    try {
      if (type === 'question') {
        await onComplete({ answer });
      } else if (type === 'focus') {
        await onComplete({ reflection });
      }
      setShowModal(false);
    } catch (error) {
      console.error('Failed to complete mission:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderModal = () => {
    if (!showModal) return null;

    const questionTask = task as DailyMissionQuestionState;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {getTitle()}
            </h3>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          {type === 'question' && questionTask.question && (
            <div className="mb-6">
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-600 mb-2">
                  From: {questionTask.question.courseTitle} - Week {questionTask.question.weekNumber}
                </p>
                <p className="text-gray-900 font-medium">
                  {questionTask.question.prompt}
                </p>
              </div>

              {questionTask.question.type === 'mcq' && questionTask.question.options ? (
                <div className="space-y-2">
                  {questionTask.question.options.map((option, index) => (
                    <label key={index} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="answer"
                        value={index}
                        checked={answer === index}
                        onChange={(e) => setAnswer(parseInt(e.target.value))}
                        className="mr-3"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  value={answer || ''}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full p-3 border rounded-lg resize-none h-24"
                />
              )}
            </div>
          )}

          {type === 'focus' && (
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Take a moment to reflect on your learning journey today. What are you focusing on?
              </p>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="What did you learn today? What are your goals for tomorrow?"
                className="w-full p-3 border rounded-lg resize-none h-32"
              />
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || (type === 'question' && (answer === null || answer === '')) || (type === 'focus' && !reflection.trim())}
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Complete Mission'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <>
      <motion.div
        className={`relative p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
          task.completed 
            ? 'bg-green-50 border-green-200 cursor-default' 
            : loading
            ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
            : 'bg-white border-gray-200 hover:border-orange-300 hover:shadow-md'
        }`}
        onClick={handleCardClick}
        whileHover={!task.completed && !loading ? { scale: 1.02 } : {}}
        whileTap={!task.completed && !loading ? { scale: 0.98 } : {}}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              task.completed ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
            }`}>
              <FontAwesomeIcon icon={getIcon()} className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{getTitle()}</h3>
              <p className="text-sm text-gray-600">{getDescription()}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`flex items-center gap-1 text-sm font-medium ${
              task.completed ? 'text-green-600' : 'text-orange-600'
            }`}>
              <FontAwesomeIcon icon={faFire} className="w-3 h-3" />
              {task.completed ? `${task.xpAwarded} XP` : getXpReward()}
            </div>
            {task.completed && (
              <p className="text-xs text-green-600 mt-1">Completed</p>
            )}
          </div>
        </div>

        {/* Progress indicator */}
        {!task.completed && (
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div className="bg-orange-500 h-1 rounded-full w-0"></div>
          </div>
        )}

        {task.completed && (
          <div className="w-full bg-green-200 rounded-full h-1">
            <div className="bg-green-500 h-1 rounded-full w-full"></div>
          </div>
        )}
      </motion.div>

      {renderModal()}
    </>
  );
}
