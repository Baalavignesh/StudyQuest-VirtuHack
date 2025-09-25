"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEnvelope, 
  faLock, 
  faRocket, 
  faStar, 
  faGamepad,
  faArrowLeft,
  faEye,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import mascott from '@/assets/mascott.png';

export default function StudentLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { isRedirecting } = useAuthRedirect();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const user = await AuthService.signIn(email, password);
      
      // Check if user is actually a student
      if (user.role !== 'student') {
        setError('This account is not registered as a student.');
        setIsLoading(false);
        return;
      }
      
      AuthService.saveUser(user);
      refreshUser(); // Update the context
      setIsSuccess(true);
      
      // Redirect after welcome animation completes
      setTimeout(() => {
        router.push('/student/dashboard');
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading screen while redirecting authenticated users
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-quest-blue-50 via-quest-purple-50 to-quest-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-quest-blue-600 mx-auto mb-4"></div>
          <p className="text-quest-blue-700 font-game text-lg">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-quest-blue-50 via-quest-purple-50 to-quest-blue-100 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="bg-quest-green-500 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center text-white text-6xl"
            transition={{ duration: 1 }}
          >
            🎉
          </motion.div>
          <h2 className="text-4xl font-heading font-bold text-quest-blue-700 mb-4">
            Welcome Back!
          </h2>
          <p className="text-xl text-quest-gray-600 font-game">
            Loading your quest...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-quest-blue-50 via-quest-purple-50 to-quest-blue-100 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 text-quest-blue-300 opacity-25"
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <FontAwesomeIcon icon={faStar} size="2x" />
        </motion.div>
        <motion.div
          className="absolute top-1/4 right-10 text-quest-purple-300 opacity-25"
          animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <FontAwesomeIcon icon={faGamepad} size="3x" />
        </motion.div>
        <motion.div
          className="absolute bottom-1/4 left-1/4 text-quest-blue-300 opacity-25"
          animate={{ y: [0, -25, 0], rotate: [0, 15, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <FontAwesomeIcon icon={faRocket} size="2x" />
        </motion.div>
        <motion.div
          className="absolute top-1/3 left-1/2 text-quest-purple-300 opacity-20"
          animate={{ y: [0, -15, 0], rotate: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        >
          <FontAwesomeIcon icon={faStar} size="lg" />
        </motion.div>
        <motion.div
          className="absolute bottom-1/3 right-1/4 text-quest-blue-300 opacity-20"
          animate={{ y: [0, 20, 0], rotate: [0, 12, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        >
          <FontAwesomeIcon icon={faRocket} size="lg" />
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Back Button */}
        <motion.button
          onClick={() => router.push('/')}
          className="mb-8 flex items-center text-quest-blue-600 font-game font-bold hover:text-quest-blue-700 transition-colors duration-150"
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back to Home
        </motion.button>

        <div className="max-w-md mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="w-26 h-26 mx-auto mb-6 flex items-center justify-center"
              animate={{ 
                rotate: [0, 2, -2, 0]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src={mascott}
                alt="StudyQuest Mascot"
                width={80}
                height={80}
                className="drop-shadow-lg"
              />
            </motion.div>
            <h1 className="text-4xl font-heading font-bold text-quest-blue-700 mb-2">
              Student Login
            </h1>
            <p className="text-quest-gray-600 font-game text-lg">
              Welcome back, adventurer!
            </p>
          </motion.div>

          {/* Login Form */}
          <motion.div
            className="bg-white rounded-game-xl p-8 shadow-game border-4 border-quest-blue-200"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="relative">
                <label className="block text-quest-gray-700 font-game font-bold mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faEnvelope} 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-quest-blue-400" 
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-4 border-2 border-quest-gray-200 rounded-game focus:border-quest-blue-400 focus:outline-none transition-colors font-game text-lg"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="relative">
                <label className="block text-quest-gray-700 font-game font-bold mb-2">
                  Password
                </label>
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faLock} 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-quest-blue-400" 
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-12 py-4 border-2 border-quest-gray-200 rounded-game focus:border-quest-blue-400 focus:outline-none transition-colors font-game text-lg"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-quest-gray-400 hover:text-quest-blue-400 transition-colors"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-quest-red-50 border-2 border-quest-red-200 rounded-game p-4 text-quest-red-700 font-game text-center"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full bg-quest-blue-600 hover:bg-quest-blue-700 text-white font-bold py-4 px-6 rounded-game text-xl shadow-game hover:shadow-game-hover transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <motion.div
                      className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mr-3"
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    />
                    <span>Signing In...</span>
                  </div>
                ) : (
                  <span>Sign In</span>
                )}
              </motion.button>
            </form>

            {/* Help Text */}
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-quest-gray-500 font-game text-sm">
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => router.push('/signup/student')}
                  className="text-quest-blue-600 hover:text-quest-blue-700 font-bold transition-colors"
                >
                  Create one here
                </button>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}