import { useState } from 'react';
import { useAuth }   from '../../hooks/useAuth';
import { NAV_ITEMS } from '../../../features/auth/utils/roles';
import NavItem    from './NavItem';
import UserWidget from './UserWidget';

//  Navigation Bar: all roles visible, consistent design, responsive, accessible

export default function Sidebar() {
  const { role } = useAuth();
  const [open, setOpen] = useState(false);

  const navItems = NAV_ITEMS.filter(({ roles }) =>
    roles.length === 0 || roles.includes(role)
  );

  return (
    <>
      {/* Mobile menu toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed top-4 left-4 z-50 md:hidden w-9 h-9 flex items-center justify-center rounded-xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
        aria-label="Toggle navigation"
      >
        {open ? '✕' : '☰'}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-40
          w-60 h-screen shrink-0 flex flex-col py-8 px-4 gap-1
          transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{
          background:     'rgba(255,255,255,0.04)',
          borderRight:    '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Brand — logo left, text right */}
        <div className="px-3 mb-6 flex items-center gap-3">
          <img
            src="/logo.jpeg"
            alt="Angoram Secondary School"
            style={{
              width: 52,
              height: 52,
              objectFit: 'contain',
              borderRadius: '50%',
              flexShrink: 0,
              boxShadow: '0 0 0 2px rgba(255,255,255,0.10), 0 4px 12px rgba(0,0,0,0.4)',
            }}
          />
          <div>
            <p className="text-lg font-bold tracking-tight">
              <span style={{ color: 'var(--accent)' }}>angoram</span>
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
              Student Registration System
            </p>
          </div>
        </div>

        {/* Role badge —shows active role clearly */}
        <div className="px-3 mb-4">
          <RoleBadge role={role} />
        </div>

        {/* Navigation links */}
        <nav className="flex flex-col gap-1 flex-1" onClick={() => setOpen(false)}>
          {navItems.map(item => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        <UserWidget />
      </aside>
    </>
  );
}

const ROLE_META = {
  ADMIN:     { label: 'Administrator', color: 'var(--accent)',   bg: 'rgba(56,189,248,0.12)',  icon: '🔑' },
  PRINCIPAL: { label: 'Principal',      color: 'var(--blue)',    bg: 'rgba(56,139,253,0.12)',  icon: '🎓' },
  TEACHER:   { label: 'Teacher',         color: 'var(--amber)',  bg: 'rgba(251,191,36,0.12)',  icon: '📚' },
};

function RoleBadge({ role }) {
  const meta = ROLE_META[role] ?? { label: role, color: 'var(--muted)', bg: 'var(--surface2)', icon: '👤' };
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
      style={{ background: meta.bg, border: `1px solid ${meta.color}30` }}>
      <span>{meta.icon}</span>
      <div>
        <p className="text-xs font-semibold" style={{ color: meta.color }}>{meta.label}</p>
        <p className="text-[10px]" style={{ color: 'var(--muted)' }}>Signed in</p>
      </div>
    </div>
  );
}