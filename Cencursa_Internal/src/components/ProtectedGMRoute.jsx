import { useAuth } from '@/lib/AuthContext';
import { Navigate } from 'react-router-dom';

export default function ProtectedGMRoute({ children }) {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}