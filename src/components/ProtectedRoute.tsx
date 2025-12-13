// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireOperator?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin, requireOperator }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isOperator } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/map" replace />;
  }

  if (requireOperator && !isOperator) {
    return <Navigate to="/map" replace />;
  }

  return <>{children}</>;
}
