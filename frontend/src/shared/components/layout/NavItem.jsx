import { NavLink } from 'react-router-dom';

// Navigation: functional routing, responsiveness, accessibility
export default function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
      style={({ isActive }) => ({
        background: isActive ? 'rgba(56,189,248,0.14)' : 'transparent',
        color:      isActive ? 'var(--accent)'         : 'var(--muted)',
        border:     isActive ? '1px solid rgba(56,189,248,0.25)' : '1px solid transparent',
      })}
      aria-current={undefined}  /* set by NavLink automatically */
    >
      <span className="text-base w-5 text-center" aria-hidden="true">{icon}</span>
      {label}
    </NavLink>
  );
}
