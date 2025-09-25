import { ReactNode } from 'react';
import { UserRole } from './auth';

export interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  redirectTo?: string;
}

export interface AuthProviderProps {
  children: ReactNode;
}

export interface PageHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export interface PageTemplateProps {
  children: ReactNode;
  showNavbar?: boolean;
  className?: string;
}
