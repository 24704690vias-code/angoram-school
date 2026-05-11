/**
 * Shared grade/score helpers used by Assessment and Reports.
 */

export const gradeFromScore = (score) => {
  if (score == null) return '—';
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
};

export const gradeColor = (grade) => {
  if (!grade || grade === '—') return 'var(--muted)';
  if (grade.startsWith('A'))   return 'var(--accent)';
  if (grade === 'B')           return 'var(--blue)';
  if (grade === 'C')           return 'var(--amber)';
  return 'var(--red)';
};
