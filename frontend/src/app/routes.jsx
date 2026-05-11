import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../shared/hooks/useAuth';
import MainLayout    from '../shared/components/layout/MainLayout';
import ProtectedRoute from '../shared/components/layout/ProtectedRoute';
import LoginPage      from '../features/auth/pages/LoginPage';
import DashboardPage  from '../features/dashboard/pages/DashboardPage';
import StudentsPage   from '../features/students/pages/StudentsPage';
import ClassesPage    from '../features/classes/pages/ClassesPage';
import RegistrationPage from '../features/registration/pages/RegistrationPage';
import FeesPage       from '../features/fees/pages/FeesPage';
import AttendancePage from '../features/attendance/pages/AttendancePage';
import AssessmentPage from '../features/assessments/pages/AssessmentPage';
import ProgressionPage from '../features/progression/pages/ProgressionPage';
import ReportsPage    from '../features/reports/pages/ReportsPage';

export default function AppRoutes() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*"      element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <MainLayout>
      <Routes>
        <Route path="/"             element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/students"     element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
        <Route path="/classes"      element={<ProtectedRoute><ClassesPage /></ProtectedRoute>} />
        <Route path="/registration" element={<ProtectedRoute><RegistrationPage /></ProtectedRoute>} />
        <Route path="/attendance"   element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
        <Route path="/assessment"   element={<ProtectedRoute><AssessmentPage /></ProtectedRoute>} />
        <Route path="/fees"         element={<ProtectedRoute><FeesPage /></ProtectedRoute>} />
        <Route path="/progression"  element={<ProtectedRoute><ProgressionPage /></ProtectedRoute>} />
        <Route path="/reports"      element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        <Route path="*"             element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
}
