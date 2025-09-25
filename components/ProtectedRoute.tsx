"use client";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ProtectedRouteProps } from '@/interfaces';

export const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  redirectTo = '/' 
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(redirectTo);
      } else if (requiredRole && user.role !== requiredRole) {
        // Redirect to appropriate dashboard based on user role
        const dashboardRoute = user.role === 'student' ? '/student/dashboard' : '/teacher/dashboard';
        router.push(dashboardRoute);
      }
    }
  }, [user, loading, router, requiredRole, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-quest-blue-50 to-quest-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-quest-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-game text-quest-blue-700">Loading your quest...</h2>
        </div>
      </div>
    );
  }

  if (!user || (requiredRole && user.role !== requiredRole)) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
};