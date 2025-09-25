"use client";
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faChalkboardUser, faRocket, faStar, faTrophy } from '@fortawesome/free-solid-svg-icons';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import Image from 'next/image';
import mascott from '@/assets/mascott.png';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const { isRedirecting } = useAuthRedirect();

  const handleRoleSelect = (role: 'student' | 'teacher') => {
    router.push(`/login/${role}`);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-quest-blue-50 via-quest-purple-50 to-quest-blue-100 overflow-hidden relative">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 text-quest-purple-300 opacity-25"
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <FontAwesomeIcon icon={faStar} size="2x" />
        </motion.div>
        <motion.div
          className="absolute top-40 right-20 text-quest-purple-300 opacity-25"
          animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <FontAwesomeIcon icon={faTrophy} size="3x" />
        </motion.div>
        <motion.div
          className="absolute bottom-20 left-1/4 text-quest-blue-300 opacity-25"
          animate={{ y: [0, -25, 0], rotate: [0, 15, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <FontAwesomeIcon icon={faRocket} size="2x" />
        </motion.div>
        <motion.div
          className="absolute top-1/3 left-1/3 text-quest-blue-300 opacity-20"
          animate={{ y: [0, -15, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        >
          <FontAwesomeIcon icon={faStar} size="lg" />
        </motion.div>
        <motion.div
          className="absolute bottom-1/3 right-1/3 text-quest-purple-300 opacity-20"
          animate={{ y: [0, 20, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        >
          <FontAwesomeIcon icon={faRocket} size="lg" />
        </motion.div>
        <motion.div
          className="absolute top-1/2 right-10 text-quest-purple-300 opacity-15"
          animate={{ y: [0, -10, 0], rotate: [0, 12, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        >
          <FontAwesomeIcon icon={faTrophy} size="lg" />
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 flex flex-col items-center justify-center min-h-screen">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <motion.div
            className="flex items-center justify-center mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.div
              className="mr-4"
              animate={{ 
                y: [0, -5, 0],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <Image
                src={mascott}
                alt="StudyQuest Mascot"
                width={120}
                height={120}
                className="drop-shadow-lg"
              />
            </motion.div>
            <motion.h1
              className="text-6xl md:text-8xl font-heading font-bold text-quest-blue-700"
              animate={{ 
                textShadow: [
                  "0 0 20px rgba(59, 130, 246, 0.3)",
                  "0 0 30px rgba(59, 130, 246, 0.5)",
                  "0 0 20px rgba(59, 130, 246, 0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              StudyQuest
            </motion.h1>
          </motion.div>
          <motion.p
            className="text-xl md:text-2xl text-quest-gray-600 font-game max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            Transform learning into an epic adventure!
          </motion.p>
        </motion.div>

        {/* Role Selection Cards */}
        <div className="max-w-4xl mx-auto">
          <motion.h2
            className="text-3xl md:text-4xl font-heading font-bold text-center text-quest-gray-700 mb-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            Choose Your Adventure
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {/* Student Card */}
            <motion.div
              className="group cursor-pointer"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.3, ease: "easeOut" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelect('student')}
            >
              <div className="bg-white rounded-game-xl p-8 shadow-game group-hover:shadow-neon-blue transition-all duration-150 border-4 border-quest-blue-200 group-hover:border-quest-blue-400">
                <div className="text-center">
                  <motion.div
                    className="bg-gradient-to-br from-quest-blue-500 to-quest-purple-600 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center text-white shadow-lg"
                    
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <FontAwesomeIcon icon={faUser} size="2x" />
                  </motion.div>
                  
                  <h3 className="text-3xl font-heading font-bold text-quest-blue-700 mb-4">
                    Student Portal
                  </h3>
                  
                  <p className="text-quest-gray-600 font-game text-lg mb-6">
                    Begin your learning quest! Complete levels, earn XP, and become a master scholar!
                  </p>
                  
                  <div className="space-y-3 text-left">
                    <div className="flex items-center text-quest-gray-700">
                      <span className="w-2 h-2 bg-quest-blue-400 rounded-full mr-3"></span>
                      <span className="font-game">Complete weekly levels</span>
                    </div>
                    <div className="flex items-center text-quest-gray-700">
                      <span className="w-2 h-2 bg-quest-purple-400 rounded-full mr-3"></span>
                      <span className="font-game">Daily mission challenges</span>
                    </div>
                    <div className="flex items-center text-quest-gray-700">
                      <span className="w-2 h-2 bg-quest-blue-400 rounded-full mr-3"></span>
                      <span className="font-game">Compete on leaderboards</span>
                    </div>
                  </div>
                  
                  <motion.button
                    className="mt-8 w-full bg-quest-blue-600 hover:bg-quest-blue-700 text-white font-bold py-4 px-6 rounded-game text-lg shadow-game group-hover:shadow-game-hover transition-all duration-150"
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                  >
                    Start Your Quest
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Teacher Card */}
            <motion.div
              className="group cursor-pointer"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.3, ease: "easeOut" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelect('teacher')}
            >
              <div className="bg-white rounded-game-xl p-8 shadow-game group-hover:shadow-neon-fire transition-all duration-150 border-4 border-quest-fire-200 group-hover:border-quest-fire-400">
                <div className="text-center">
                  <motion.div
                    className="bg-quest-fire-500 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center text-white shadow-lg"
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  >
                    <FontAwesomeIcon icon={faChalkboardUser} size="2x" />
                  </motion.div>
                  
                  <h3 className="text-3xl font-heading font-bold text-quest-fire-700 mb-4">
                    Teacher Portal
                  </h3>
                  
                  <p className="text-quest-gray-600 font-game text-lg mb-6">
                    Create engaging learning adventures! Design quests and track student progress!
                  </p>
                  
                  <div className="space-y-3 text-left">
                    <div className="flex items-center text-quest-gray-700">
                      <span className="w-2 h-2 bg-quest-fire-400 rounded-full mr-3"></span>
                      <span className="font-game">Create course levels</span>
                    </div>
                    <div className="flex items-center text-quest-gray-700">
                      <span className="w-2 h-2 bg-quest-fire-600 rounded-full mr-3"></span>
                      <span className="font-game">Design daily missions</span>
                    </div>
                    <div className="flex items-center text-quest-gray-700">
                      <span className="w-2 h-2 bg-quest-fire-400 rounded-full mr-3"></span>
                      <span className="font-game">Track student progress</span>
                    </div>
                  </div>
                  
                  <motion.button
                    className="mt-8 w-full bg-quest-fire-500 hover:bg-quest-fire-600 text-white font-bold py-4 px-6 rounded-game text-lg shadow-game group-hover:shadow-game-hover transition-all duration-150"
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                  >
                    Create Adventures
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <p className="text-quest-gray-500 font-game">
            Ready to transform education into the ultimate quest?
          </p>
        </motion.div>
      </div>
    </div>
  );
}
