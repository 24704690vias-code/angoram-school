import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { token, canVisit } = useAuth();
  const location            = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!canVisit(location.pathname)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
