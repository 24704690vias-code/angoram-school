import { useEffect, useState } from 'react';
import GlassCard from '../../../shared/components/ui/GlassCard';
import Input     from '../../../shared/components/ui/Input';
import Select    from '../../../shared/components/ui/Select';
import { ReceiptUploadZone } from '../../../shared/components/ui/ReceiptUploadZone';
import { PrimaryButton, SecondaryButton } from '../../../shared/components/ui/Button';
import { useStudents }    from '../../students/hooks/useStudents';
import { getFeesSummary, getFeesByStudent } from '../services/feesService';

// Full annual fee in Kina — used to calculate % from amount
const FULL_FEE = 5000;

const METHOD_OPTIONS = [
  { value: 'CASH',          label: 'Cash'          },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'ONLINE',        label: 'Online'        },
];

const EMPTY_FEE = {
  studentId: '', amountPaid: '', paymentMethod: 'CASH',
  referenceNumber: '', receiptNumber: '', notes: '',
};

export default function FeeModal({ onSave, onClose, preselectStudentId = null }) {
  const { students } = useStudents();

  const [form,            setForm]           = useState({ ...EMPTY_FEE, studentId: preselectStudentId ?? '' });
  const [receiptFile,     setReceiptFile]    = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [summary,         setSummary]        = useState(null);
  const [history,         setHistory]        = useState([]);
  const [loadingSummary,  setLoadingSummary] = useState(false);
  const [saving,          setSaving]         = useState(false);
  const [errors,          setErrors]         = useState({});

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  // Load summary when modal opens with pre-selected student
  useEffect(() => {
    if (preselectStudentId && students.length > 0) {
      const student = students.find(s => String(s.id ?? s.student_id) === String(preselectStudentId));
      if (student) {
        setSelectedStudent(student);
        loadStudentSummary(preselectStudentId);
      }
    }
  }, [preselectStudentId, students]);

  const loadStudentSummary = async (id) => {
    setLoadingSummary(true);
    try {
      const [sum, hist] = await Promise.all([
        getFeesSummary(id),
        getFeesByStudent(id),
      ]);
      setSummary(sum);
      // Sort by payment date ascending so #1 is oldest
      setHistory([...hist].sort((a, b) =>
        (a.paymentDate ?? '').localeCompare(b.paymentDate ?? '')));
    } catch {
      setSummary(null);
      setHistory([]);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleStudentChange = async (e) => {
    const id = e.target.value;
    setForm(p => ({ ...p, studentId: id, amountPaid: '' }));
    setSummary(null); setHistory([]); setErrors({});
    const student = students.find(s => String(s.id ?? s.student_id) === String(id));
    setSelectedStudent(student || null);
    if (id) await loadStudentSummary(id);
  };

  // Derived values — calculated from totalPaid/totalLevied (Kina amounts from API)
  const totalLevied = Number(summary?.totalLevied ?? FULL_FEE);
  const totalPaid   = Number(summary?.totalPaid   ?? 0);
  const paidPct     = totalLevied > 0 ? (totalPaid / totalLevied) * 100 : 0;
  const thisPaid    = Number(form.amountPaid) || 0;
  const thisPct     = totalLevied > 0 ? (thisPaid / totalLevied) * 100 : 0;
  const afterPct    = Math.min(paidPct + thisPct, 100);
  const afterKina   = Math.min(totalPaid + thisPaid, totalLevied);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.studentId) errs.studentId = 'Required';
    if (!form.amountPaid || Number(form.amountPaid) <= 0) errs.amountPaid = 'Enter an amount';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    if (totalPaid + thisPaid > totalLevied) {
      setErrors({ amountPaid: `Exceeds outstanding balance. Max: K ${(totalLevied - totalPaid).toLocaleString()}` });
      return;
    }

    setSaving(true);
    try {
      await onSave({
        studentId:       Number(form.studentId),
        amountPaid:      Number(form.amountPaid),
        paymentMethod:   form.paymentMethod,
        referenceNumber: form.referenceNumber || null,
        receiptNumber:   form.receiptNumber   || null,
        notes:           form.notes           || null,
      }, receiptFile);
    } catch (err) {
      setErrors({ _global: err.message || 'Payment failed' });
    } finally { setSaving(false); }
  };

  const studentOptions = [
    { value: '', label: 'Choose student…' },
    ...students.map(s => ({
      value: s.id ?? s.student_id,
      label: `${s.firstname ?? s.student_firstname} ${s.lastname ?? s.student_lastname} (#${s.studentNumber ?? s.id})`,
    })),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>

      <GlassCard padding="p-8" className="w-full max-w-xl" title="Record Fee Instalment"
        subtitle="Each submission adds one payment instalment to the student's account">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Student selector- a dropdown */}
          <Select label="Student *" id="student" value={form.studentId}
            onChange={handleStudentChange} error={errors.studentId}
            options={studentOptions} />

          {/* Student info strip */}
          {selectedStudent && (
            <div className="text-sm px-4 py-2.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ color: 'var(--text)', fontWeight: 500 }}>
                {selectedStudent.firstname ?? selectedStudent.student_firstname}{' '}
                {selectedStudent.lastname ?? selectedStudent.student_lastname}
              </span>
              <span style={{ color: 'var(--muted)' }}>
                {' · '}{(selectedStudent.province ?? selectedStudent.student_province) || 'No province'}{' · '}
              </span>
              <span style={{ color: selectedStudent.status === 'ACTIVE' ? 'var(--accent-2)' : '#f87171' }}>
                {selectedStudent.status}
              </span>
            </div>
          )}

          {/* Balance tracker */}
          {form.studentId && (
            <div className="px-4 py-3 rounded-[14px] space-y-2"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {loadingSummary ? (
                <p className="text-sm animate-pulse" style={{ color: 'var(--muted)' }}>Loading payment history…</p>
              ) : (
                <>
                  {/* Progress bar: paid (green) + this instalment (blue) */}
                  <div className="flex h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    {paidPct > 0 && (
                      <div style={{ width: `${paidPct}%`, background: 'var(--accent-2)', transition: 'width 0.4s' }} />
                    )}
                    {thisPct > 0 && (
                      <div style={{ width: `${Math.min(thisPct, 100 - paidPct)}%`, background: 'var(--accent)', opacity: 0.8 }} />
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p style={{ color: 'var(--muted)' }}>Paid so far</p>
                      <p style={{ color: 'var(--accent-2)', fontWeight: 600 }}>
                        {paidPct.toFixed(1)}%
                      </p>
                      <p style={{ color: 'var(--muted)' }}>K {totalPaid.toLocaleString()}</p>
                    </div>
                    {thisPct > 0 && (
                      <div>
                        <p style={{ color: 'var(--muted)' }}>This instalment</p>
                        <p style={{ color: 'var(--accent)', fontWeight: 600 }}>+{thisPct.toFixed(1)}%</p>
                        <p style={{ color: 'var(--muted)' }}>K {thisPaid.toLocaleString()}</p>
                      </div>
                    )}
                    <div>
                      <p style={{ color: 'var(--muted)' }}>After this payment</p>
                      <p style={{ color: afterPct >= 60 ? 'var(--accent-2)' : '#fbbf24', fontWeight: 600 }}>
                        {afterPct.toFixed(1)}%
                      </p>
                      <p style={{ color: 'var(--muted)' }}>K {afterKina.toLocaleString()}</p>
                    </div>
                  </div>

                  <p className="text-xs font-medium pt-0.5"
                    style={{ color: paidPct >= 60 ? 'var(--accent-2)' : afterPct >= 60 ? 'var(--accent-2)' : '#fbbf24' }}>
                    {paidPct >= 60
                      ? '✓ Already eligible to register'
                      : afterPct >= 60
                        ? '✓ Will be eligible to register after this payment'
                        : `⚠ Still needs ${(60 - afterPct).toFixed(1)}% more after this payment`}
                  </p>

                  {/* Previous instalments — show amountPaid from API */}
                  {history.length > 0 && (
                    <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>
                        Previous instalments ({history.length})
                      </p>
                      <div className="space-y-1 max-h-28 overflow-y-auto">
                        {history.map((p, i) => {
                          const kina = Number(p.amountPaid ?? 0);
                          const pct  = totalLevied > 0 ? (kina / totalLevied) * 100 : 0;
                          return (
                            <div key={p.id ?? i} className="flex items-center gap-2 text-xs">
                              <span style={{ color: 'var(--muted)', minWidth: 16 }}>#{i + 1}</span>
                              <span style={{ color: 'var(--text)' }}>{p.paymentDate ?? '—'}</span>
                              <span style={{ color: 'var(--accent-2)', fontWeight: 600 }}>
                                {pct.toFixed(1)}%
                              </span>
                              <span style={{ color: 'var(--muted)' }}>
                                K {kina.toLocaleString()}
                              </span>
                              <span style={{ color: 'var(--muted)' }}>
                                {p.paymentMethod?.replace('_', ' ')}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Amount input */}
          <div className="grid grid-cols-2 gap-4">
            <Input label={`Amount (K) · full fee K ${FULL_FEE.toLocaleString()}`}
              id="amt" type="number" value={form.amountPaid}
              onChange={set('amountPaid')} placeholder="e.g. 1500"
              error={errors.amountPaid} />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--muted)' }}>Fees % (auto-calculated)</label>
              <div className="px-4 py-2.5 rounded-[14px] text-sm"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', color: 'var(--muted)' }}>
                {thisPct > 0 ? `${thisPct.toFixed(2)}%` : 'auto'}
              </div>
            </div>
          </div>

          <Select label="Payment Method" id="method" value={form.paymentMethod}
            onChange={set('paymentMethod')} options={METHOD_OPTIONS} />

          {form.paymentMethod !== 'CASH' && (
            <div className="grid grid-cols-2 gap-4">
              <Input label="Reference Number" id="ref" value={form.referenceNumber}
                onChange={set('referenceNumber')} placeholder="Bank ref" />
              <Input label="Receipt Number" id="rec" value={form.receiptNumber}
                onChange={set('receiptNumber')} placeholder="Receipt #" />
            </div>
          )}

          <Input label="Notes" id="notes" value={form.notes}
            onChange={set('notes')} placeholder="Optional notes for this instalment" />

          <ReceiptUploadZone value={receiptFile} onChange={setReceiptFile} />

          {errors._global && (
            <p className="text-sm px-4 py-2.5 rounded-xl"
              style={{ color: '#f87171', background: 'rgba(248,113,113,0.10)' }}>
              {errors._global}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Submit Instalment'}
            </PrimaryButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}