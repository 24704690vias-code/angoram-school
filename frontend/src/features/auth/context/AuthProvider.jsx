import { createContext, useContext, useState, useCallback } from 'react';
import { login as loginApi } from '../../../api/authApi';

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Routes each role is allowed to visit
const ROLE_ROUTES = {
  ADMIN:     ['/', '/students', '/classes', '/registration', '/attendance', '/assessment', '/fees', '/progression', '/reports'],
  PRINCIPAL: ['/', '/students', '/classes', '/registration', '/attendance', '/assessment', '/fees', '/progression', '/reports'],
  TEACHER:   ['/', '/students', '/attendance', '/assessment'],
};

const PERMS = {
  ADMIN:     ['manageStudents','manageClasses','manageFees','manageAttendance','manageAssessments','manageYearEnd','manageSubjects','viewReports','manageUsers'],
  PRINCIPAL: ['viewStudents','manageStudents','viewFees','viewAttendance','viewAssessments','viewReports','manageClasses'],
  TEACHER:   ['viewStudents','manageAttendance','manageAssessments','viewReports'],
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });

  const login = useCallback(async (username, password) => {
    const data = await loginApi({ username, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const can = useCallback((action) => {
    if (!user) return false;
    return PERMS[user.role]?.includes(action) ?? false;
  }, [user]);

  const canVisit = useCallback((path) => {
    if (!user) return false;
    const allowed = ROLE_ROUTES[user.role] ?? [];
    return allowed.some(r => path === r || path.startsWith(r + '/'));
  }, [user]);

  const token = user ? localStorage.getItem('token') : null;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, can, canVisit, role: user?.role }}>
      {children}
    </AuthContext.Provider>
  );
}
