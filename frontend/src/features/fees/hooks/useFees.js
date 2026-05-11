import { useContext } from 'react';
import { FeesContext } from '../context/FeesProvider';

export function useFees() {
  const ctx = useContext(FeesContext);
  if (!ctx) throw new Error('useFees must be used inside <FeesProvider>');
  return ctx;
}
