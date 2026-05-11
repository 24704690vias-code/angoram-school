import { useState, useEffect } from 'react';
import { getClasses, getClassStudents } from '../../../api/classApi';
import { getCurrentYear, getTerms } from '../../../api/academicYearApi';
import { getSubjects } from '../../../api/subjectApi';
import { getAssessments, saveAssessment, getClassRankings } from '../services/assessmentService';
import { PrimaryButton } from '../../../shared/components/ui/Button';
import { gradeFromScore, gradeColor } from '../utils/gradeUtils';
import { ASSESSMENT_TYPES } from '../../students/constants/studentConstants';
import PageHeader from '../../../shared/components/ui/PageHeader';

function TabBar({ active, onChange }) {
  return (
    <div className="flex gap-2">
      {[['marks', 'Mark Entry'], ['rankings', 'Class Rankings']].map(([key, label]) => (
        <button key={key} onClick={() => onChange(key)}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={active === key
            ? { background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid rgba(56,189,248,0.3)' }
            : { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
          {label}
        </button>
      ))}
    </div>
  );
}

function MarkEntryTable({ students, marks, onMarkChange }) {
  return (
    <div className="rounded-xl overflow-hidden"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-4 px-4 py-3 border-b"
        style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}>
        <span className="w-6 text-xs" style={{ color: 'var(--muted)' }}>#</span>
        <span className="flex-1 text-xs font-semibold uppercase" style={{ color: 'var(--muted)' }}>Student</span>
        <span className="w-32 text-xs font-semibold uppercase text-right" style={{ color: 'var(--muted)' }}>Score /100</span>
        <span className="w-12 text-xs font-semibold uppercase text-center" style={{ color: 'var(--muted)' }}>Grade</span>
      </div>
      {students.map((s, i) => {
        const raw   = marks[s.id];
        const score = raw !== undefined && raw !== '' ? Number(raw) : null;
        const grade = gradeFromScore(score);
        return (
          <div key={s.id} className="flex items-center gap-4 px-4 py-3 border-b last:border-0"
            style={{ borderColor: 'var(--border)' }}>
            <span className="w-6 text-xs" style={{ color: 'var(--muted)' }}>{i + 1}</span>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                {s.firstname} {s.lastname}
              </p>
            </div>
            <input type="number" min="0" max="100" value={raw ?? ''} placeholder="—"
              onChange={e => onMarkChange(s.id, e.target.value)} className="w-32 text-right" />
            <span className="w-12 text-center text-sm font-bold" style={{ color: gradeColor(grade) }}>
              {grade}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const MEDAL = (i) => ['🥇', '🥈', '🥉'][i] ?? null;

function RankingsTable({ rankings }) {
  if (!rankings.length) {
    return <p className="text-sm text-center py-12" style={{ color: 'var(--muted)' }}>No ranking data yet.</p>;
  }
  return (
    <div className="rounded-xl overflow-hidden"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      {rankings.map((r, i) => (
        <div key={r.studentId} className="flex items-center gap-4 px-4 py-3 border-b last:border-0"
          style={{ borderColor: 'var(--border)', background: i < 3 ? 'var(--surface2)' : 'transparent' }}>
          <div className="w-10 text-center">
            {MEDAL(i)
              ? <span className="text-xl">{MEDAL(i)}</span>
              : <span className="text-sm font-bold" style={{ color: 'var(--muted)' }}>{i + 1}</span>}
          </div>
          <p className="flex-1 text-sm font-medium" style={{ color: 'var(--text)' }}>{r.studentName}</p>
          <span className="text-sm font-bold" style={{ color: gradeColor(r.grade) }}>
            {Number(r.average).toFixed(1)}%
          </span>
          <span className="w-10 text-center text-sm font-bold" style={{ color: gradeColor(r.grade) }}>
            {r.grade}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AssessmentPage() {
  const [tab,        setTab]        = useState('marks');
  const [year,       setYear]       = useState(null);
  const [terms,      setTerms]      = useState([]);
  const [classes,    setClasses]    = useState([]);
  const [subjects,   setSubjects]   = useState([]);
  const [filters,    setFilters]    = useState({ classId: '', termId: '', subjectId: '', assessType: 'CONTINUOUS' });
  const [students,   setStudents]   = useState([]);
  const [marks,      setMarks]      = useState({});
  const [rankings,   setRankings]   = useState([]);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);

  const { classId, termId, subjectId, assessType } = filters;
  const setFilter = (key, val) => setFilters(p => ({ ...p, [key]: val }));

  useEffect(() => {
    getCurrentYear().then(y => {
      setYear(y);
      Promise.all([getTerms(y.id), getClasses(y.id), getSubjects()])
        .then(([t, c, s]) => { setTerms(t); setClasses(c); setSubjects(s); });
    });
  }, []);

  useEffect(() => {
    if (classId) getClassStudents(classId).then(setStudents); else setStudents([]);
  }, [classId]);

  useEffect(() => {
    if (!classId || !termId) return;
    getAssessments(classId, termId).then(rows => {
      const m = {};
      rows.filter(r => String(r.subject?.id) === String(subjectId) && r.assessmentType === assessType)
          .forEach(r => { if (r.student) m[r.student.id] = r.score ?? ''; });
      setMarks(m);
    });
  }, [classId, termId, subjectId, assessType]);

  useEffect(() => {
    if (tab === 'rankings' && classId && termId) getClassRankings(classId, termId).then(setRankings);
  }, [tab, classId, termId]);

  const handleSave = async () => {
    if (!subjectId || !termId || !classId) return;
    setSaving(true);
    for (const [sid, score] of Object.entries(marks)) {
      if (score === '' || score == null) continue;
      await saveAssessment({
        studentId: Number(sid), subjectId: Number(subjectId), termId: Number(termId),
        academicYearId: year?.id, classId: Number(classId),
        assessmentType: assessType, score: Number(score), maxScore: 100,
      });
    }
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade">
      <PageHeader title="Assessment">
        {saved && <span className="text-sm font-medium" style={{ color: 'var(--accent)' }}>✓ Marks saved</span>}
      </PageHeader>

      <TabBar active={tab} onChange={setTab} />

      <div className="flex gap-4 flex-wrap">
        <select value={classId} onChange={e => setFilter('classId', e.target.value)} className="w-44">
          <option value="">Class…</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.classCode} Gr{c.gradeLevel}</option>)}
        </select>
        <select value={termId} onChange={e => setFilter('termId', e.target.value)} className="w-32">
          <option value="">Term…</option>
          {terms.map(t => <option key={t.id} value={t.id}>Term {t.termNumber}</option>)}
        </select>
        {tab === 'marks' && (
          <>
            <select value={subjectId} onChange={e => setFilter('subjectId', e.target.value)} className="w-44">
              <option value="">Subject…</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.subjectName}</option>)}
            </select>
            <select value={assessType} onChange={e => setFilter('assessType', e.target.value)} className="w-36">
              {ASSESSMENT_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select>
          </>
        )}
      </div>

      {tab === 'marks' && classId && subjectId && termId && (
        <>
          <MarkEntryTable students={students} marks={marks}
            onMarkChange={(id, val) => setMarks(p => ({ ...p, [id]: val }))} />
          {students.length > 0 && (
            <div className="flex justify-end">
              <PrimaryButton onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save Marks'}
              </PrimaryButton>
            </div>
          )}
        </>
      )}

      {tab === 'rankings' && classId && termId && <RankingsTable rankings={rankings} />}

      {(!classId || !termId) && (
        <p className="text-sm text-center py-12" style={{ color: 'var(--muted)' }}>
          Select a class and term to continue.
        </p>
      )}
    </div>
  );
}
