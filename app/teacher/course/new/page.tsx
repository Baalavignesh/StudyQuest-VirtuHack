"use client";
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { FileUploadService, UploadProgress } from '@/services/upload';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUpload, 
  faFileAlt,
  faCheckCircle,
  faSpinner,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';

function NewCourseContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadedFile(file);
    setUploadProgress({ progress: 0, status: 'uploading' });
    setAnalysisResult(null);

    try {
      const result = await FileUploadService.uploadAndProcessSyllabus(
        file,
        (progress) => {
          setUploadProgress(progress);
          // Store fileId when it becomes available
          if (progress.fileId) {
            setFileId(progress.fileId);
          }
        },
        {
          uid: user?.uid || '',
          name: user?.displayName || user?.email || 'Unknown Teacher',
          createCourse: true // Create course immediately after analysis
        }
      );
      setAnalysisResult(result);
    } catch (error: any) {
      setUploadProgress({
        progress: 0,
        status: 'error',
        error: error.message
      });
    }
  }, [user?.displayName, user?.email, user?.uid]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const resetUpload = () => {
    setUploadedFile(null);
    setUploadProgress(null);
    setAnalysisResult(null);
    setFileId(null);
  };

  const goToDashboard = () => {
    router.push('/teacher/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-quest-blue-50 via-quest-purple-50 to-quest-blue-100 h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-80px)] flex flex-col justify-center items-center">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
         
          <h1 className="text-4xl font-heading font-bold text-quest-purple-700 mb-4">
            Create New Course
          </h1>
          <p className="text-quest-gray-600 font-game text-lg max-w-2xl mx-auto">
            Transform your curriculum into an engaging gamified learning experience that students will love!
          </p>
        </motion.div>

        {/* Course Creation Options */}
        <div className="max-w-4xl mx-auto h-full">
          <div className="grid md:grid-cols-1 gap-8">

            {/* File Upload Section */}
            <motion.div
              className="w-full max-w-2xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <div className="bg-white rounded-game-xl p-8 shadow-game border-4 border-quest-purple-200">
                <div className="text-center mb-6">
                  <div className="bg-quest-purple-500 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center text-white">
                    <FontAwesomeIcon icon={faUpload} size="lg" />
                  </div>
                  
                  <h3 className="text-2xl font-heading font-bold text-quest-purple-700 mb-2">
                    Upload Syllabus
                  </h3>
                  
                  <p className="text-quest-gray-600 font-game mb-6">
                    Upload your existing syllabus and let AI transform it into an engaging course structure.
                  </p>
                </div>

                {/* Upload Area */}
                {!uploadedFile ? (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-game-lg p-8 text-center cursor-pointer transition-all duration-200 ${
                      isDragActive 
                        ? 'border-quest-purple-500 bg-quest-purple-50' 
                        : 'border-quest-gray-300 hover:border-quest-purple-400 hover:bg-quest-purple-25'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <FontAwesomeIcon 
                      icon={faFileAlt} 
                      className={`text-4xl mb-4 ${
                        isDragActive ? 'text-quest-purple-500' : 'text-quest-gray-400'
                      }`} 
                    />
                    <p className="text-quest-gray-600 font-game mb-2">
                      {isDragActive ? (
                        'Drop your syllabus here...'
                      ) : (
                        'Drag & drop your syllabus here, or click to select'
                      )}
                    </p>
                    <p className="text-quest-gray-500 font-game text-sm">
                      Supports PDF, Word, and text files (max 10MB)
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* File Info */}
                    <div className="bg-quest-purple-50 rounded-game p-4 border border-quest-purple-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faFileAlt} className="text-quest-purple-500 text-xl mr-3" />
                          <div>
                            <p className="font-game font-bold text-quest-gray-800">{uploadedFile.name}</p>
                            <p className="font-game text-sm text-quest-gray-600">
                              {FileUploadService.formatFileSize(uploadedFile.size)}
                            </p>
                          </div>
                        </div>
                        
                        {uploadProgress?.status === 'success' && (
                          <FontAwesomeIcon icon={faCheckCircle} className="text-quest-success-500 text-xl" />
                        )}
                        
                        {uploadProgress?.status === 'error' && (
                          <FontAwesomeIcon icon={faTimesCircle} className="text-quest-danger-500 text-xl" />
                        )}
                      </div>
                    </div>

                    {/* Upload Progress */}
                    {uploadProgress && (
                      <div className="space-y-3">
                        {(uploadProgress.status === 'uploading' || uploadProgress.status === 'processing') && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-quest-gray-700 font-game text-sm">
                                {uploadProgress.status === 'uploading' ? 'Uploading...' : 'Processing with AI...'}
                              </span>
                              <span className="text-quest-gray-700 font-game text-sm">{uploadProgress.progress}%</span>
                            </div>
                            <div className="w-full bg-quest-gray-200 rounded-full h-2">
                              <div 
                                className="bg-quest-purple-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress.progress}%` }}
                              ></div>
                            </div>
                            <div className="flex items-center justify-center mt-3">
                              <FontAwesomeIcon icon={faSpinner} className="text-quest-purple-500 animate-spin mr-2" />
                              <span className="text-quest-gray-600 font-game text-sm">
                                {uploadProgress.status === 'uploading' 
                                  ? 'Reading your file...' 
                                  : 'AI is analyzing your syllabus...'}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {uploadProgress.status === 'success' && analysisResult && (
                          <div className="space-y-4">
                            <div className="text-center py-4">
                              <FontAwesomeIcon icon={faCheckCircle} className="text-quest-success-500 text-3xl mb-2" />
                              <p className="text-quest-success-600 font-game font-bold">
                                Course Created Successfully!
                              </p>
                              <p className="text-quest-gray-600 font-game text-sm mt-1">
                                Your course has been created and is ready for students!
                              </p>
                            </div>
                            
                            {/* Analysis Results Preview */}
                            <div className="bg-quest-success-50 rounded-game p-4 border border-quest-success-200">
                              <h4 className="font-heading font-bold text-quest-success-700 mb-3">Extracted Course Information:</h4>
                              <div className="space-y-3 text-sm">
                                {/* Course Details */}
                                {analysisResult.course_details && (
                                  <div className="bg-white rounded p-3 border border-quest-success-200">
                                    <h5 className="font-bold text-quest-gray-700 mb-2">Course Details</h5>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="flex justify-between">
                                        <span className="text-quest-gray-600 font-game">Title:</span>
                                        <span className="text-quest-gray-800 font-game font-bold">{analysisResult.course_details.course_title || 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-quest-gray-600 font-game">Subject:</span>
                                        <span className="text-quest-gray-800 font-game font-bold">{analysisResult.course_details.subject || 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-quest-gray-600 font-game">Grade Level:</span>
                                        <span className="text-quest-gray-800 font-game font-bold">{analysisResult.course_details.grade_level || 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-quest-gray-600 font-game">Duration:</span>
                                        <span className="text-quest-gray-800 font-game font-bold">{analysisResult.course_details.duration_weeks ? `${analysisResult.course_details.duration_weeks} weeks` : 'N/A'}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Weekly Topics */}
                                {analysisResult.weekly_topics && analysisResult.weekly_topics.length > 0 && (
                                  <div className="bg-white rounded p-3 border border-quest-success-200">
                                    <h5 className="font-bold text-quest-gray-700 mb-2">Weekly Topics</h5>
                                    <div className="max-h-32 overflow-y-auto space-y-1">
                                      {analysisResult.weekly_topics.slice(0, 5).map((topic: any, index: number) => (
                                        <div key={index} className="text-xs">
                                          <span className="text-quest-gray-600">Week {topic.week}:</span>
                                          <span className="text-quest-gray-800 ml-1">{topic.topic}</span>
                                        </div>
                                      ))}
                                      {analysisResult.weekly_topics.length > 5 && (
                                        <div className="text-xs text-quest-gray-500">
                                          +{analysisResult.weekly_topics.length - 5} more weeks
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Schedule Information */}
                                {analysisResult.schedule && (
                                  <div className="bg-white rounded p-3 border border-quest-success-200">
                                    <h5 className="font-bold text-quest-gray-700 mb-2">Schedule</h5>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="flex justify-between">
                                        <span className="text-quest-gray-600 font-game">Start:</span>
                                        <span className="text-quest-gray-800 font-game">{analysisResult.schedule.start_date || 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-quest-gray-600 font-game">End:</span>
                                        <span className="text-quest-gray-800 font-game">{analysisResult.schedule.end_date || 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-quest-gray-600 font-game">Time:</span>
                                        <span className="text-quest-gray-800 font-game">{analysisResult.schedule.class_time || 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-quest-gray-600 font-game">Days:</span>
                                        <span className="text-quest-gray-800 font-game">{analysisResult.schedule.class_days?.length || 0} days</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {uploadProgress.status === 'error' && (
                          <div className="text-center py-4">
                            <FontAwesomeIcon icon={faTimesCircle} className="text-quest-danger-500 text-3xl mb-2" />
                            <p className="text-quest-danger-600 font-game font-bold">Upload failed</p>
                            <p className="text-quest-gray-600 font-game text-sm mt-1">
                              {uploadProgress.error}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-center">
                      {uploadProgress?.status === 'success' && analysisResult && (
                        <motion.button
                          onClick={goToDashboard}
                          className="bg-quest-purple-500 hover:bg-quest-purple-600 text-white font-bold py-3 px-8 rounded-game transition-all duration-150"
                          whileHover={{ y: -1 }}
                          whileTap={{ y: 0 }}
                        >
                          Take me to Dashboard
                        </motion.button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function NewCoursePage() {
  return (
    <ProtectedRoute requiredRole="teacher">
      <NewCourseContent />
    </ProtectedRoute>
  );
}