"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to redirect authenticated users away from public pages
 * @param redirectTo - Optional custom redirect path
 */
export const useAuthRedirect = (redirectTo?: string) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Determine redirect path based on user role or custom path
      const redirectPath = redirectTo || 
        (user.role === 'student' ? '/student/dashboard' : '/teacher/dashboard');
      
      router.push(redirectPath);
    }
  }, [user, loading, router, redirectTo]);

  // Return loading state so components can show loading UI
  return { isRedirecting: !loading && !!user };
};
