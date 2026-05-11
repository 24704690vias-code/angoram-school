import { useState, useEffect } from 'react';
import { getClasses, getClassStudents } from '../../../api/classApi';
import { getCurrentYear } from '../../../api/academicYearApi';
import { processYearEnd } from '../../../api/yearEndApi';
import Avatar from '../../../shared/components/ui/Avatar';
import { PrimaryButton } from '../../../shared/components/ui/Button';
import PageHeader from '../../../shared/components/ui/PageHeader';

// ── Constants ────────────────────────────────────────────────

const OUTCOMES = ['PROMOTED', 'REPEAT', 'GRADUATED', 'SELECTED_GRADE11', 'WITHDRAWN', 'EXPELLED'];

const OUT_STYLE = {
  PROMOTED:         { c: 'var(--accent)',  bg: 'var(--accent-bg)',  l: 'Promoted'   },
  REPEAT:           { c: 'var(--amber)',   bg: 'var(--amber-bg)',   l: 'Repeat'     },
  GRADUATED:        { c: 'var(--blue)',    bg: 'var(--blue-bg)',    l: 'Graduated'  },
  SELECTED_GRADE11: { c: 'var(--purple)',  bg: 'var(--purple-bg)',  l: '→ Grade 11' },
  WITHDRAWN:        { c: 'var(--muted)',   bg: 'var(--surface2)',   l: 'Withdrawn'  },
  EXPELLED:         { c: 'var(--red)',     bg: 'var(--red-bg)',     l: 'Expelled'   },
};

function nextGradeFor(outcome, currentGrade) {
  if (outcome === 'PROMOTED' || outcome === 'SELECTED_GRADE11') return currentGrade + 1;
  if (outcome === 'REPEAT')                                      return currentGrade;
  return null;
}

function defaultDecision(student) {
  const g = student.currentGradeLevel;
  return {
    outcome:   g === 12 ? 'GRADUATED' : 'PROMOTED',
    nextGrade: g < 12   ? g + 1       : null,
    notes:     '',
  };
}

// ── Sub-components ───────────────────────────────────────────

function OutcomeButtons({ studentId, currentGrade, decision, onOutcome }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {OUTCOMES.map(o => {
        if (o === 'GRADUATED'        && currentGrade !== 12) return null;
        if (o === 'SELECTED_GRADE11' && currentGrade !== 10) return null;
        const st     = OUT_STYLE[o];
        const active = decision.outcome === o;
        return (
          <button key={o} onClick={() => onOutcome(studentId, o)}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
            style={active
              ? { background: st.bg, color: st.c, border: `1px solid ${st.c}40` }
              : { background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)' }}>
            {st.l}
          </button>
        );
      })}
    </div>
  );
}

function StudentOutcomeCard({ student, decision, onOutcome, onNoteChange }) {
  return (
    <div className="rounded-xl p-4 flex items-center gap-4 flex-wrap"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <Avatar first={student.firstname} last={student.lastname} size="md" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
          {student.firstname} {student.lastname}
        </p>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          #{student.studentNumber} · Grade {student.currentGradeLevel} · Repeated {student.timesRepeated}×
        </p>
      </div>
      <OutcomeButtons
        studentId={student.id}
        currentGrade={student.currentGradeLevel}
        decision={decision}
        onOutcome={onOutcome}
      />
      <input
        type="text"
        value={decision.notes || ''}
        onChange={e => onNoteChange(student.id, e.target.value)}
        placeholder="Notes (optional)"
        className="w-44 text-xs"
      />
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────

export default function Progression() {
  const [year,      setYear]      = useState(null);
  const [classes,   setClasses]   = useState([]);
  const [classId,   setClassId]   = useState('');
  const [students,  setStudents]  = useState([]);
  const [decisions, setDecisions] = useState({});   // { studentId: { outcome, nextGrade, notes } }
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);

  useEffect(() => {
    getCurrentYear().then(y => {
      setYear(y);
      getClasses(y.id).then(setClasses);
    });
  }, []);

  useEffect(() => {
    if (!classId) return;
    getClassStudents(classId).then(all => {
      const active = all.filter(s => s.status === 'ACTIVE');
      setStudents(active);
      const d = {};
      active.forEach(s => { d[s.id] = defaultDecision(s); });
      setDecisions(d);
    });
  }, [classId]);

  const handleOutcome = (studentId, outcome) => {
    setDecisions(prev => {
      const student = students.find(s => s.id === studentId);
      return {
        ...prev,
        [studentId]: {
          ...prev[studentId],
          outcome,
          nextGrade: nextGradeFor(outcome, student?.currentGradeLevel),
        },
      };
    });
  };

  const handleNote = (studentId, notes) => {
    setDecisions(prev => ({ ...prev, [studentId]: { ...prev[studentId], notes } }));
  };

  const handleSave = async () => {
    if (!year) return;
    setSaving(true);
    for (const student of students) {
      const d = decisions[student.id];
      if (!d) continue;
      await processYearEnd({
        studentId:      student.id,
        academicYearId: year.id,
        outcome:        d.outcome,
        nextGradeLevel: d.nextGrade,
        notes:          d.notes,
      });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  return (
    <div className="space-y-6 animate-fade">
      <PageHeader
        title="Year Progression"
        subtitle={`End-of-year outcomes — ${year?.yearLabel}`}
      >
        {saved && <span className="text-sm font-medium" style={{ color: 'var(--accent)' }}>✓ Results saved</span>}
      </PageHeader>

      {/* Info note */}
      <div className="px-5 py-4 rounded-xl text-sm"
        style={{ background: 'var(--blue-bg)', border: '1px solid rgba(56,189,248,0.3)', color: 'var(--muted)' }}>
        <strong style={{ color: 'var(--text)' }}>Grade 10 → 11 selection:</strong> Not all Grade 10 students are
        automatically promoted to Grade 11. Use <em>→ Grade 11</em> only for students who qualify based on academic
        performance and available places. Others should be <em>Repeat</em> or <em>Withdrawn</em>.
      </div>

      {/* Class selector */}
      <div className="flex flex-col gap-1.5" style={{ maxWidth: 280 }}>
        <label className="text-xs uppercase font-medium" style={{ color: 'var(--muted)' }}>Class</label>
        <select value={classId} onChange={e => setClassId(e.target.value)}>
          <option value="">Choose class…</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.classCode} — Grade {c.gradeLevel}</option>
          ))}
        </select>
      </div>

      {/* Student cards */}
      {students.length > 0 && (
        <>
          <div className="space-y-2">
            {students.map(s => (
              <StudentOutcomeCard
                key={s.id}
                student={s}
                decision={decisions[s.id] ?? {}}
                onOutcome={handleOutcome}
                onNoteChange={handleNote}
              />
            ))}
          </div>
          <div className="flex justify-end">
            <PrimaryButton onClick={handleSave} disabled={saving}>
              {saving ? 'Processing…' : 'Save Year-End Results'}
            </PrimaryButton>
          </div>
        </>
      )}

      {classId && students.length === 0 && (
        <p className="text-sm text-center py-12" style={{ color: 'var(--muted)' }}>
          No active students in this class.
        </p>
      )}
      {!classId && (
        <p className="text-sm text-center py-12" style={{ color: 'var(--muted)' }}>
          Select a class to process year-end outcomes.
        </p>
      )}
    </div>
  );
}
