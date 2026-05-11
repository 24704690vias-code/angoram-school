import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Wraps a page and shows 403 if user lacks access
export default function RoleGuard({ children, permission, redirectTo = '/' }) {
  const { can, token } = useAuth();
  const location       = useLocation();

  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;

  // If no permission required, just render
  if (!permission) return children;

  if (!can(permission)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-5xl">🔒</div>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
          Access Denied
        </h2>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          You don&apos;t have permission to view this page.
        </p>
        <Navigate to={redirectTo} replace />
      </div>
    );
  }

  return children;
}
