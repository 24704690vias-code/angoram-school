export const NAV_ITEMS = [
  { to: '/',             icon: '⊞',  label: 'Dashboard',    roles: [] },
  { to: '/students',     icon: '🎓', label: 'Students',     roles: [] },
  { to: '/classes',      icon: '🏫', label: 'Classes',      roles: ['ADMIN', 'PRINCIPAL'] },
  { to: '/registration', icon: '📋', label: 'Registration', roles: [] },
  { to: '/attendance',   icon: '✅', label: 'Attendance',   roles: [] },
  { to: '/assessment',   icon: '📝', label: 'Assessment',   roles: [] },
  { to: '/fees',         icon: '💳', label: 'Fees',         roles: ['ADMIN', 'PRINCIPAL'] },
  { to: '/progression',  icon: '📈', label: 'Progression',  roles: ['ADMIN', 'PRINCIPAL'] },
  { to: '/reports',      icon: '📊', label: 'Reports',      roles: ['ADMIN', 'PRINCIPAL'] },
];
