import { createContext, useState, useCallback } from 'react';
import { getFeesByStudent, createFee, deleteFee } from '../services/feesService';
import { useAuth } from '../../../shared/hooks/useAuth';

// eslint-disable-next-line react-refresh/only-export-components
export const FeesContext = createContext(null);

/**
 * FeesProvider — no longer pre-loads ALL fees on mount.
 * Fees are loaded on demand per student via loadFeesForStudent().
 * This avoids the 500 error from serialising the full fee payment graph.
 */
export function FeesProvider({ children }) {
  const { user } = useAuth();
  const [fees,    setFees]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // Load fees for a specific student
  const loadFeesForStudent = useCallback(async (studentId) => {
    if (!studentId) return;
    setLoading(true); setError(null);
    try {
      const data = await getFeesByStudent(studentId);
      setFees(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Failed to load fees');
    } finally {
      setLoading(false);
    }
  }, []);

  const addFee = useCallback(async (data, receiptFile = null) => {
    const created = await createFee(data, receiptFile);
    setFees(prev => [created, ...prev]);
    return created;
  }, []);

  const removeFee = useCallback(async (id) => {
    await deleteFee(id);
    setFees(prev => prev.filter(f => f.id !== id));
  }, []);

  return (
    <FeesContext.Provider value={{
      fees, loading, error,
      loadFeesForStudent,
      addFee, removeFee,
    }}>
      {children}
    </FeesContext.Provider>
  );
}