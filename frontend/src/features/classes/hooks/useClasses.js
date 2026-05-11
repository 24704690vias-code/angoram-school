import { useState, useEffect } from 'react';
import { getClasses } from '../services/classService';

export function useClasses(yearId) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    getClasses(yearId).then(setClasses).finally(() => setLoading(false));
  }, [yearId]);
  return { classes, loading };
}
