import { useState, useEffect } from 'react';
import { getStudents } from '../../../api/studentApi';
import { getCurrentYear } from '../../../api/academicYearApi';
import { getRegistrations, registerStudent } from '../../../api/registrationApi';
import { getFeesSummary } from '../../../api/feesApi';
import Select   from '../../../shared/components/ui/Select';
import Card     from '../../../shared/components/ui/Card';
import Modal    from '../../../shared/components/ui/Modal';
import { PrimaryButton, SecondaryButton } from '../../../shared/components/ui/Button';
import { SuccessToast } from '../../../shared/components/feedback/Toast';
import { StatusBadge }  from '../../../shared/components/ui/Table';
import { useAuth } from '../../../shared/hooks/useAuth';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Panel     from '../../../shared/components/ui/Panel';



function RegistrationRow({ reg }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b last:border-0 transition-all"
      style={{ borderColor: 'var(--border)' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
      <div className="flex-1">
        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
          {reg.student?.firstname} {reg.student?.lastname}
        </p>
        <p className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
          #{reg.student?.studentNumber} · Grade {reg.gradeLevel}
        </p>
      </div>
      <StatusBadge status={reg.regStatus} />
      <p className="text-xs" style={{ color: 'var(--muted)' }}>{reg.regDate}</p>
    </div>
  );
}

function RegisterStudentModal({ year, eligible, ineligible, feesPct, onClose, onRegistered }) {
  const [selStudent, setSelStudent] = useState('');
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selStudent || !year) return;
    setSaving(true); setError('');
    try {
      await registerStudent({ studentId: Number(selStudent), yearId: year.id });
      onRegistered();
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setSaving(false); }
  };

  return (
    <Modal onClose={onClose} className="max-w-md">
      <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text)' }}>Register Student</h2>
      <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>
        Academic Year {year?.yearLabel}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Student" value={selStudent} onChange={e => setSelStudent(e.target.value)}
          options={[
            { value: '', label: 'Choose student…' },
            ...eligible.map(s => ({
              value: s.id,
              label: `${s.firstname} ${s.lastname} — Grade ${s.currentGradeLevel ?? '?'} (${(feesPct[s.id] ?? 0).toFixed(0)}% paid)`,
            })),
          ]} />
        {eligible.length === 0 && (
          <p className="text-xs" style={{ color: 'var(--amber)' }}>
            No students meet the 60% fee payment requirement for registration.
          </p>
        )}
        {ineligible.length > 0 && (
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            ⚠ {ineligible.length} student{ineligible.length > 1 ? 's' : ''} excluded — paid less than 60% of fees.
          </p>
        )}
        {error && <p className="text-xs" style={{ color: 'var(--red)' }}>⚠ {error}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton type="submit" disabled={saving || !selStudent}>
            {saving ? 'Registering…' : 'Register'}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

export default function RegistrationPage() {
  const { can } = useAuth();
  const [year,    setYear]    = useState(null);
  const [students,setStudents]= useState([]);
  const [regs,    setRegs]    = useState([]);
  const [showReg, setShowReg] = useState(false);
  const [toast,   setToast]   = useState('');

  const load = async () => {
    const y = await getCurrentYear();
    setYear(y);
    const [s, r] = await Promise.all([getStudents(), getRegistrations(y.id)]);
    setStudents(s); setRegs(r);
  };
  useEffect(() => { load(); }, []);

  const registeredIds = new Set(regs.map(r => r.student?.id));

  // Only ACTIVE students not yet registered AND who have paid >= 60% of fees
  const [feesPct, setFeesPct] = useState({});

  useEffect(() => {
    if (!year || !students.length) return;
    const active = students.filter(s => s.status === 'ACTIVE' && !registeredIds.has(s.id));
    // Fetch fee summary for each eligible student
    Promise.all(
      active.map(s =>
        getFeesSummary(s.id)
          .then(sum => {
            const total   = Number(sum.totalLevied ?? 0);
            const paid    = Number(sum.totalPaid   ?? 0);
            const pct     = total > 0 ? (paid / total) * 100 : 0;
            return { id: s.id, pct };
          })
          .catch(() => ({ id: s.id, pct: 0 }))
      )
    ).then(results => {
      const map = {};
      results.forEach(r => { map[r.id] = r.pct; });
      setFeesPct(map);
    });
  }, [year, students, regs]);

  const eligible = students.filter(s =>
    s.status === 'ACTIVE' &&
    !registeredIds.has(s.id) &&
    (feesPct[s.id] ?? 0) >= 60
  );

  const ineligible = students.filter(s =>
    s.status === 'ACTIVE' &&
    !registeredIds.has(s.id) &&
    (feesPct[s.id] ?? 0) < 60
  );
  const confirmed     = regs.filter(r => r.regStatus === 'CONFIRMED').length;
  const withdrawn     = regs.filter(r => r.regStatus === 'WITHDRAWN').length;

  const handleRegistered = () => {
    setShowReg(false); load();
    setToast('Student registered successfully');
    setTimeout(() => setToast(''), 4000);
  };

  return (
    <div className="space-y-6 animate-fade">
      <PageHeader
        title="Registration"
        subtitle={`Academic Year ${year?.yearLabel} · ${regs.length} total registrations`}
      >
        {can('manageStudents') && (
          <PrimaryButton onClick={() => setShowReg(true)}>+ Register Student</PrimaryButton>
        )}
      </PageHeader>

      <div className="grid grid-cols-3 gap-4">
        <Card title="Confirmed"               value={confirmed}       />
        <Card title="Eligible (unregistered)" value={eligible.length} />
        <Card title="Below 60% (ineligible)" value={ineligible.length} />
        <Card title="Withdrawn"               value={withdrawn}       />
      </div>

      <Panel title={`Registrations — ${year?.yearLabel}`} flush>
        {regs.length === 0
          ? <p className="text-sm text-center py-12" style={{ color: 'var(--muted)' }}>No registrations yet.</p>
          : regs.map(r => <RegistrationRow key={r.id} reg={r} />)
        }
      </Panel>

      {showReg && (
        <RegisterStudentModal year={year} eligible={eligible} ineligible={ineligible} feesPct={feesPct}
          onClose={() => setShowReg(false)} onRegistered={handleRegistered} />
      )}
      <SuccessToast message={toast} />
    </div>
  );
}