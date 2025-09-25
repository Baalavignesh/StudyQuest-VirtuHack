"use client";
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faTrophy } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import mascott from '@/assets/mascott.png';
import { useRouter } from 'next/navigation';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center cursor-pointer" onClick={() => router.push(`/${user?.role}/dashboard`)}>
            <motion.div
              className="w-10 h-10 mr-3 flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
            >
              <Image
                src={mascott}
                alt="StudyQuest Mascot"
                width={40}
                height={40}
                className="rounded-lg"
              />  
            </motion.div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                StudyQuest
              </h1>
              {/* {user && (
                <p className="text-sm text-gray-600">
                  {user.displayName}
                </p>
              )} */}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user?.role === 'student' && (
              <motion.button
                onClick={() => router.push('/student/leaderboard')}
                className="flex items-center bg-orange-50 hover:bg-orange-100 text-orange-600 font-medium py-2 px-4 rounded transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FontAwesomeIcon icon={faTrophy} className="mr-2" />
                Leaderboard
              </motion.button>
            )}
            
            <motion.button
              onClick={handleSignOut}
              className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
              Sign Out
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};