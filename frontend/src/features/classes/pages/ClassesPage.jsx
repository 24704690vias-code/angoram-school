import { useState, useEffect } from 'react';
import { getClasses, createClass, deleteClass, getClassStudents } from '../services/classService';
import { getCurrentYear } from '../../../api/academicYearApi';
import Input    from '../../../shared/components/ui/Input';
import Select   from '../../../shared/components/ui/Select';
import Modal    from '../../../shared/components/ui/Modal';
import { PrimaryButton, SecondaryButton, DangerButton } from '../../../shared/components/ui/Button';
import { SuccessToast } from '../../../shared/components/feedback/Toast';
import { StatusBadge }  from '../../../shared/components/ui/Table';
import { useAuth } from '../../../shared/hooks/useAuth';
import PageHeader from '../../../shared/components/ui/PageHeader';
import { GRADES } from '../../students/constants/studentConstants';

const EMPTY_FORM = { classCode: '', gradeLevel: '9', maxCapacity: '40', stream: '' };

// ── Sub-components ───────────────────────────────────────────

function CapacityBar({ current, max }) {
  const pct   = max > 0 ? (current / max) * 100 : 0;
  const color = pct >= 100 ? 'var(--red)' : pct >= 80 ? 'var(--amber)' : 'var(--accent)';
  return (
    <div className="w-32 text-right">
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
      </div>
      <p className="text-xs mt-1" style={{ color }}>{Math.round(pct)}% full</p>
    </div>
  );
}

function ClassCard({ cls, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all mb-1"
      style={active
        ? { background: 'var(--accent-bg)', border: '1px solid rgba(56,189,248,0.4)' }
        : { background: 'var(--surface)', border: '1px solid var(--border)' }
      }
      onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = 'var(--muted)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = 'var(--border)'; }}>
      <div className="flex-1">
        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{cls.classCode}</p>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          Cap. {cls.maxCapacity}{cls.stream ? ` · ${cls.stream}` : ''}
        </p>
      </div>
    </button>
  );
}

function ClassDetailPanel({ selected, students, canManage, onDelete }) {
  const pct = selected.maxCapacity > 0
    ? (students.length / selected.maxCapacity) * 100
    : 0;

  return (
    <div className="md:col-span-2 rounded-xl p-6 space-y-4"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
            {selected.classCode} — Grade {selected.gradeLevel}
          </h2>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {students.length} / {selected.maxCapacity} students
          </p>
        </div>
        <CapacityBar current={students.length} max={selected.maxCapacity} />
      </div>

      {/* Student list */}
      <div className="space-y-1.5 max-h-72 overflow-y-auto">
        {students.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--muted)' }}>
            No students assigned to this class yet.
          </p>
        ) : students.map((s, i) => (
          <div key={s.id} className="flex items-center gap-3 px-3 py-2 rounded-lg"
            style={{ background: 'var(--surface2)' }}>
            <span className="text-xs w-5" style={{ color: 'var(--muted)' }}>{i + 1}</span>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                {s.firstname} {s.lastname}
              </p>
              <p className="text-xs font-mono" style={{ color: 'var(--muted)' }}>#{s.studentNumber}</p>
            </div>
            <StatusBadge status={s.status} />
          </div>
        ))}
      </div>

      {/* Danger zone */}
      {canManage && (
        <div className="pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          <DangerButton onClick={() => onDelete(selected.id)}>Delete Class</DangerButton>
        </div>
      )}
    </div>
  );
}

function NewClassModal({ year, onClose, onCreated }) {
  const [form,   setForm]   = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.classCode.trim()) return;
    setSaving(true);
    try {
      await createClass({
        classCode:    form.classCode,
        gradeLevel:   Number(form.gradeLevel),
        maxCapacity:  Number(form.maxCapacity),
        stream:       form.stream || null,
        academicYear: { id: year?.id },
      });
      onCreated();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose} className="max-w-md">
      <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text)' }}>New Class</h2>
      <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>
        For academic year {year?.yearLabel}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Class Code *" value={form.classCode} onChange={set('classCode')} placeholder="e.g. 9A" />
          <Select label="Grade Level"  value={form.gradeLevel} onChange={set('gradeLevel')}
            options={GRADES.map(g => ({ value: String(g), label: `Grade ${g}` }))} />
          <Input label="Max Capacity" type="number" value={form.maxCapacity} onChange={set('maxCapacity')} />
          <Input label="Stream (optional)" value={form.stream} onChange={set('stream')}
            placeholder="Science / Commerce" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton type="submit" disabled={saving}>
            {saving ? 'Creating…' : 'Create Class'}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

// ── Page ────────────────────────────────────────────────────

export default function Classes() {
  const { can } = useAuth();
  const [classes,  setClasses]  = useState([]);
  const [year,     setYear]     = useState(null);
  const [selected, setSelected] = useState(null);
  const [students, setStudents] = useState([]);
  const [showNew,  setShowNew]  = useState(false);
  const [toast,    setToast]    = useState('');

  const loadClasses = () => {
    getCurrentYear().then(y => {
      setYear(y);
      getClasses(y.id).then(setClasses);
    });
  };

  useEffect(loadClasses, []);

  useEffect(() => {
    if (selected) getClassStudents(selected.id).then(setStudents);
    else setStudents([]);
  }, [selected]);

  const handleDelete = async (id) => {
    await deleteClass(id);
    setSelected(null);
    loadClasses();
    setToast('Class deleted');
  };

  const handleCreated = () => {
    setShowNew(false);
    loadClasses();
    setToast('Class created successfully');
  };

  return (
    <div className="space-y-6 animate-fade">
      <PageHeader
        title="Classes"
        subtitle={`${year?.yearLabel} · ${classes.length} classes`}
      >
        {can('manageClasses') && (
          <PrimaryButton onClick={() => setShowNew(true)}>+ New Class</PrimaryButton>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Class list grouped by grade */}
        <div className="space-y-3">
          {GRADES.map(g => {
            const gradeClasses = classes.filter(c => c.gradeLevel === g);
            if (!gradeClasses.length) return null;
            return (
              <div key={g}>
                <p className="text-xs font-semibold uppercase mb-2 px-1" style={{ color: 'var(--muted)' }}>
                  Grade {g}
                </p>
                {gradeClasses.map(c => (
                  <ClassCard
                    key={c.id}
                    cls={c}
                    active={selected?.id === c.id}
                    onClick={() => setSelected(c)}
                  />
                ))}
              </div>
            );
          })}
          {classes.length === 0 && (
            <p className="text-sm text-center py-8" style={{ color: 'var(--muted)' }}>
              No classes yet. Add one above.
            </p>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <ClassDetailPanel
            selected={selected}
            students={students}
            canManage={can('manageClasses')}
            onDelete={handleDelete}
          />
        )}
      </div>

      {showNew && <NewClassModal year={year} onClose={() => setShowNew(false)} onCreated={handleCreated} />}

      <SuccessToast message={toast} />
    </div>
  );
}
