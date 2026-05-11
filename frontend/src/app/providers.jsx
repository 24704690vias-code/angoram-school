import { AuthProvider }    from '../features/auth/context/AuthProvider';
import { StudentProvider } from '../features/students/context/StudentProvider';
import { FeesProvider }    from '../features/fees/context/FeesProvider';

/** Wraps the app with all React context providers in correct nesting order. */
export default function Providers({ children }) {
  return (
    <AuthProvider>
      <StudentProvider>
        <FeesProvider>
          {children}
        </FeesProvider>
      </StudentProvider>
    </AuthProvider>
  );
}
