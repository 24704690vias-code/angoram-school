import { useState } from 'react';
import Modal  from '../../../shared/components/ui/Modal';
import Select from '../../../shared/components/ui/Select';
import { PrimaryButton, SecondaryButton } from '../../../shared/components/ui/Button';
import { assignStudentToClass } from '../services/studentService';
import { useStudents } from '../hooks/useStudents';

export default function AssignClassModal({ student, classes, onClose, onUpdated }) {
  const [classId, setClassId] = useState(student.currentClass?.id || '');
  const [saving,  setSaving]  = useState(false);

  // Count active students per class from context to determine capacity
  const { students } = useStudents();
  const enrolledCount = {};
  students.forEach(s => {
    if (s.currentClass?.id && s.status === 'ACTIVE') {
      enrolledCount[s.currentClass.id] = (enrolledCount[s.currentClass.id] || 0) + 1;
    }
  });

  const gradeClasses = classes.filter(c => c.gradeLevel === student.currentGradeLevel);

  const selectedClass  = gradeClasses.find(c => c.id === Number(classId));
  const selectedFull   = selectedClass
    ? (enrolledCount[selectedClass.id] || 0) >= selectedClass.maxCapacity
    : false;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!classId || selectedFull) return;
    setSaving(true);
    try {
      const updated = await assignStudentToClass(student.id, Number(classId));
      onUpdated('Student assigned to class', updated);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose} className="max-w-sm">
      <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text)' }}>Assign Class</h2>
      <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>
        {student.firstname} {student.lastname}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
            Class
          </label>
          <select
            value={classId}
            onChange={e => setClassId(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 12,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.14)',
              color: 'var(--text)', fontSize: 14, outline: 'none',
            }}
          >
            <option value="">— Choose class —</option>
            {gradeClasses.map(c => {
              const enrolled  = enrolledCount[c.id] || 0;
              const remaining = c.maxCapacity - enrolled;
              const full      = remaining <= 0;
              return (
                <option key={c.id} value={c.id} disabled={full}>
                  {c.classCode} — Grade {c.gradeLevel}
                  {full
                    ? ' (Full)'
                    : ` (${remaining} spot${remaining === 1 ? '' : 's'} left)`
                  }
                </option>
              );
            })}
          </select>
        </div>

        {/* Capacity bar for selected class */}
        {selectedClass && (() => {
          const enrolled  = enrolledCount[selectedClass.id] || 0;
          const pct       = Math.min((enrolled / selectedClass.maxCapacity) * 100, 100);
          const barColor  = pct >= 100 ? 'var(--red, #f87171)'
                          : pct >= 80  ? 'var(--amber, #fbbf24)'
                          : 'var(--accent-2, #22c55e)';
          return (
            <div>
              <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--muted)' }}>
                <span>{enrolled} enrolled</span>
                <span>{selectedClass.maxCapacity} capacity</span>
              </div>
              <div style={{
                height: 6, borderRadius: 3, overflow: 'hidden',
                background: 'rgba(255,255,255,0.08)',
              }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  width: `${pct}%`,
                  background: barColor,
                  transition: 'width 0.3s ease',
                }} />
              </div>
              {selectedFull && (
                <p className="text-xs mt-1" style={{ color: 'var(--red, #f87171)' }}>
                  This class is full. Choose a different class.
                </p>
              )}
            </div>
          );
        })()}

        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          Only classes for Grade {student.currentGradeLevel} are shown.
        </p>

        <div className="flex justify-end gap-3 pt-2">
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton type="submit" disabled={saving || !classId || selectedFull}>
            {saving ? 'Assigning…' : 'Assign'}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}