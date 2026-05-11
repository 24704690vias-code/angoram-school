import { useState, useEffect } from 'react';
import { getClasses, getClassStudents } from '../../../api/classApi';
import { getCurrentYear } from '../../../api/academicYearApi';
import { getAttendanceRoll, saveAttendanceBulk } from '../../../api/attendanceApi';
import Avatar from '../../../shared/components/ui/Avatar';
import { PrimaryButton, SecondaryButton } from '../../../shared/components/ui/Button';
import { ATTENDANCE_STATUSES } from '../../students/constants/studentConstants';
import PageHeader from '../../../shared/components/ui/PageHeader';

const ATT_STYLE = {
  PRESENT: { c: 'var(--accent)', bg: 'var(--accent-bg)' },
  ABSENT:  { c: 'var(--red)',    bg: 'var(--red-bg)'    },
  LATE:    { c: 'var(--amber)',  bg: 'var(--amber-bg)'  },
  EXCUSED: { c: 'var(--blue)',   bg: 'var(--blue-bg)'   },
};

function StatusToggle({ current, onChange }) {
  return (
    <div className="flex gap-1">
      {ATTENDANCE_STATUSES.map(opt => (
        <button key={opt} onClick={() => onChange(opt)}
          className="px-2 py-1 rounded-lg text-xs font-semibold transition-all"
          style={current === opt
            ? { background: ATT_STYLE[opt].bg, color: ATT_STYLE[opt].c, border: `1px solid ${ATT_STYLE[opt].c}40` }
            : { background: 'transparent', color: 'var(--muted)', border: '1px solid transparent' }}>
          {opt[0]}
        </button>
      ))}
    </div>
  );
}

function SummaryBadges({ counts }) {
  return (
    <div className="flex gap-3 flex-wrap">
      {ATTENDANCE_STATUSES.map(s => (
        <div key={s} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{ background: ATT_STYLE[s].bg, color: ATT_STYLE[s].c }}>
          {s}: {counts[s] ?? 0}
        </div>
      ))}
    </div>
  );
}

function StudentRollRow({ student, index, status, onStatusChange }) {
  const st = ATT_STYLE[status] ?? ATT_STYLE.PRESENT;
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b last:border-0 transition-all"
      style={{ borderColor: 'var(--border)' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
      <span className="text-xs w-6" style={{ color: 'var(--muted)' }}>{index + 1}</span>
      <Avatar first={student.firstname} last={student.lastname} />
      <div className="flex-1">
        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
          {student.firstname} {student.lastname}
        </p>
        <p className="text-xs font-mono" style={{ color: 'var(--muted)' }}>#{student.studentNumber}</p>
      </div>
      <StatusToggle current={status} onChange={onStatusChange} />
      <span className="text-xs font-semibold w-16 text-right" style={{ color: st.c }}>{status}</span>
    </div>
  );
}

export default function AttendancePage() {
  const [classes,  setClasses]  = useState([]);
  const [year,     setYear]     = useState(null);
  const [classId,  setClassId]  = useState('');
  const [date,     setDate]     = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState([]);
  const [roll,     setRoll]     = useState({});
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);

  useEffect(() => {
    getCurrentYear().then(y => { setYear(y); getClasses(y.id).then(setClasses); });
  }, []);

  useEffect(() => {
    if (!classId) return;
    Promise.all([getClassStudents(classId), getAttendanceRoll(classId, date)])
      .then(([studentList, existing]) => {
        setStudents(studentList);
        const initial = {};
        studentList.forEach(s => { initial[s.id] = 'PRESENT'; });
        existing.forEach(a => { if (a.student) initial[a.student.id] = a.status; });
        setRoll(initial);
      });
  }, [classId, date]);

  const setAllStatus = (status) => {
    const updated = {};
    students.forEach(s => { updated[s.id] = status; });
    setRoll(updated);
  };

  const handleSave = async () => {
    if (!year) return;
    setSaving(true);
    const records = students.map(s => ({
      student: { id: s.id }, schoolClass: { id: Number(classId) },
      academicYear: { id: year.id }, attendanceDate: date,
      status: roll[s.id] || 'PRESENT',
    }));
    await saveAttendanceBulk(records, year.id);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const counts = ATTENDANCE_STATUSES.reduce((acc, s) => ({
    ...acc, [s]: Object.values(roll).filter(v => v === s).length,
  }), {});

  const hasStudents = classId && students.length > 0;

  return (
    <div className="space-y-6 animate-fade">
      <PageHeader title="Attendance">
        {saved && <span className="text-sm font-medium" style={{ color: 'var(--accent)' }}>✓ Roll saved</span>}
      </PageHeader>

      <div className="flex gap-4 flex-wrap items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase font-medium" style={{ color: 'var(--muted)' }}>Class</label>
          <select value={classId} onChange={e => setClassId(e.target.value)} className="w-48">
            <option value="">Choose class…</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.classCode} — Grade {c.gradeLevel}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase font-medium" style={{ color: 'var(--muted)' }}>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-40" />
        </div>
        {hasStudents && (
          <div className="flex gap-2 ml-auto flex-wrap">
            {['PRESENT', 'ABSENT'].map(s => (
              <SecondaryButton key={s} onClick={() => setAllStatus(s)}>All {s}</SecondaryButton>
            ))}
            <PrimaryButton onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save Roll'}
            </PrimaryButton>
          </div>
        )}
      </div>

      {hasStudents && (
        <>
          <SummaryBadges counts={counts} />
          <div className="rounded-xl overflow-hidden"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            {students.map((s, i) => (
              <StudentRollRow key={s.id} student={s} index={i}
                status={roll[s.id] || 'PRESENT'}
                onStatusChange={(status) => setRoll(p => ({ ...p, [s.id]: status }))}
              />
            ))}
          </div>
        </>
      )}

      {!classId && (
        <p className="text-sm text-center py-12" style={{ color: 'var(--muted)' }}>
          Select a class to mark the attendance roll.
        </p>
      )}
    </div>
  );
}
