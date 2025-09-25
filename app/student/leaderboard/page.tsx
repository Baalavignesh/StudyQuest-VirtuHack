"use client";
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Leaderboard } from '@/components/student/Leaderboard';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';

function LeaderboardPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">


        {/* Leaderboard Content */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="grid gap-8">
            {/* Full Leaderboard */}
            <div className="lg:col-span-2">
              <Leaderboard limit={50} />
            </div>
            
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LeaderboardPageWrapper() {
  return (
    <ProtectedRoute requiredRole="student">
      <LeaderboardPage />
    </ProtectedRoute>
  );
}
