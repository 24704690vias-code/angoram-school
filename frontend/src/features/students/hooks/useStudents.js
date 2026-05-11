import { useContext } from 'react';
import { StudentContext } from '../context/StudentProvider';

export function useStudents() {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error('useStudents must be used inside <StudentProvider>');
  return ctx;
}
