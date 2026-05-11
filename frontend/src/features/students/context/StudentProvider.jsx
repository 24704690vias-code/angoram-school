import { createContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../services/studentService';

// eslint-disable-next-line react-refresh/only-export-components
export const StudentContext = createContext(null);

export function StudentProvider({ children }) {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await getStudents();
      setStudents(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchStudents();
    } else {
      setStudents([]);
      setLoading(false);
    }
  }, [user, fetchStudents]);

  const addStudent = useCallback(async (data) => {
    const created = await createStudent(data);
    setStudents(prev => [created, ...prev]);
    return created;
  }, []);

  const editStudent = useCallback(async (id, data) => {
    const updated = await updateStudent(id, data);
    // support both id shapes (API returns { id }, uploaded files use { student_id })
    setStudents(prev => prev.map(s => (s.id ?? s.student_id) === id ? updated : s));
    return updated;
  }, []);

  const removeStudent = useCallback(async (id) => {
    await deleteStudent(id);
    setStudents(prev => prev.filter(s => (s.id ?? s.student_id) !== id));
  }, []);

  
  const refreshStudent = useCallback((updated) => {
    setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
  }, []);

  return (
    <StudentContext.Provider value={{
      students, loading, error,
      refetch: fetchStudents,
      addStudent, editStudent, removeStudent, refreshStudent,
    }}>
      {children}
    </StudentContext.Provider>
  );
}