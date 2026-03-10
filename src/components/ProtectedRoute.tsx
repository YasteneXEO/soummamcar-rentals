import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { Role } from '../types';

interface Props {
  children: React.ReactNode;
  /** Allowed roles. If omitted, any authenticated user can access. */
  allowedRoles?: Role[];
  /** Where to redirect unauthenticated users (default: /connexion) */
  redirectTo?: string;
}

export default function ProtectedRoute({ children, allowedRoles, redirectTo = '/connexion' }: Props) {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // SUPER_ADMIN can access anything
    if (user.role !== 'SUPER_ADMIN') {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
