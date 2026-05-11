import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ROLE_STYLES = {
  ADMIN:     { color: 'var(--accent)',   bg: 'rgba(56,189,248,0.12)'  },
  PRINCIPAL: { color: 'var(--accent)',   bg: 'rgba(56,189,248,0.12)'  },
  TEACHER:   { color: '#fbbf24',         bg: 'rgba(251,191,36,0.12)'  },
  STAFF:     { color: 'var(--accent-2)', bg: 'rgba(34,197,94,0.12)'   },
};

export default function UserWidget() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const roleStyle = ROLE_STYLES[role] ?? ROLE_STYLES.STAFF;

  return (
    <div className="mt-auto pt-4 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      {user && (
        <div
          className="px-3 py-2.5 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
              {user.username}
            </p>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ color: roleStyle.color, background: roleStyle.bg }}
            >
              {role}
            </span>
          </div>
        </div>
      )}

      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 hover:-translate-y-0.5"
        style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.18)', color: '#f87171' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.15)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; }}
      >
        <span className="text-base w-5 text-center">⎋</span>
        Logout
      </button>

      <p className="px-3 text-xs" style={{ color: 'var(--muted)' }}>v1.0.0 · angoram</p>
    </div>
  );
}
