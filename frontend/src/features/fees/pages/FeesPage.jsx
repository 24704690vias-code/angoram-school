import { useState, useEffect } from 'react';
import Avatar        from '../../../shared/components/ui/Avatar';
import { PrimaryButton, DangerButton } from '../../../shared/components/ui/Button';
import { SuccessToast } from '../../../shared/components/feedback/Toast';
import { StatusBadge }  from '../../../shared/components/ui/Table';
import FeeModal from '../components/FeeModal';
import { useFees }     from '../hooks/useFees';
import { useStudents } from '../../students/hooks/useStudents';
import { useAuth }     from '../../../shared/hooks/useAuth';
import { getReceiptUrl, getFeesSummary } from '../services/feesService';
import PageHeader from '../../../shared/components/ui/PageHeader';

function FeeSummaryCard({ label, value, color }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <p className="text-xs uppercase mb-1" style={{ color: 'var(--muted)' }}>{label}</p>
      <p className="text-xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

// Mini progress bar shown next to student name
function FeeProgressPill({ pct }) {
  const color = pct >= 100 ? 'var(--accent-2)'
              : pct >= 60  ? 'var(--accent)'
              : '#f59e0b';
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full ml-1"
      style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>
      {pct.toFixed(0)}%
    </span>
  );
}

export default function Fees() {
  const { can }      = useAuth();
  const { fees, addFee, removeFee, loadFeesForStudent } = useFees();
  const { students } = useStudents();

  const [selected,  setSelected]  = useState(null);
  const [showPay,   setShowPay]   = useState(false);
  const [toast,     setToast]     = useState('');
  // Map of studentId → { pct, totalPaid, totalLevied }
  const [summaries, setSummaries] = useState({});

  const notify = msg => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  // Load fee summary for every student to show % badges
  useEffect(() => {
    if (!students.length) return;
    students.forEach(s => {
      getFeesSummary(s.id)
        .then(sum => {
          const levied = Number(sum.totalLevied ?? 0);
          const paid   = Number(sum.totalPaid   ?? 0);
          const pct    = levied > 0 ? (paid / levied) * 100 : 0;
          setSummaries(prev => ({ ...prev, [s.id]: { pct, paid, levied } }));
        })
        .catch(() => {});
    });
  }, [students]);

  // When a student is selected, load their payments
  const handleSelectStudent = (s) => {
    setSelected(s);
    if (loadFeesForStudent) loadFeesForStudent(s.id);
  };

  // Payments for selected student from context
  const payments = selected
    ? fees.filter(f => (f.student?.id ?? f.studentId) === selected.id)
    : [];

  const selectedSummary = selected ? (summaries[selected.id] ?? {}) : {};
  const totalPaid       = selectedSummary.paid    ?? payments.reduce((s, p) => s + Number(p.amountPaid ?? 0), 0);
  const totalLevied     = selectedSummary.levied  ?? 0;
  const outstanding     = Math.max(0, totalLevied - totalPaid);
  const paidPct         = selectedSummary.pct     ?? 0;

  const handleSave = async (data, file) => {
    await addFee(data, file);
    setShowPay(false);
    notify('Payment recorded successfully');
    // Refresh summary for this student
    if (selected) {
      getFeesSummary(selected.id).then(sum => {
        const levied = Number(sum.totalLevied ?? 0);
        const paid   = Number(sum.totalPaid   ?? 0);
        const pct    = levied > 0 ? (paid / levied) * 100 : 0;
        setSummaries(prev => ({ ...prev, [selected.id]: { pct, paid, levied } }));
      }).catch(() => {});
      if (loadFeesForStudent) loadFeesForStudent(selected.id);
    }
  };

  const handleDelete = async (id) => {
    await removeFee(id);
    notify('Payment deleted');
    if (selected) {
      getFeesSummary(selected.id).then(sum => {
        const levied = Number(sum.totalLevied ?? 0);
        const paid   = Number(sum.totalPaid   ?? 0);
        const pct    = levied > 0 ? (paid / levied) * 100 : 0;
        setSummaries(prev => ({ ...prev, [selected.id]: { pct, paid, levied } }));
      }).catch(() => {});
    }
  };

  return (
    <div className="space-y-6 animate-fade">
      <PageHeader title="Fees &amp; Payments" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Student list with % badges */}
        <div className="rounded-xl overflow-hidden"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="px-4 py-3 border-b"
            style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold uppercase" style={{ color: 'var(--muted)' }}>Students</p>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '500px' }}>
            {students.map(s => {
              const sum = summaries[s.id];
              return (
                <button key={s.id} onClick={() => handleSelectStudent(s)}
                  className="w-full flex items-center gap-3 px-4 py-3 border-b last:border-0 text-left transition-all"
                  style={{
                    borderColor: 'var(--border)',
                    background: selected?.id === s.id ? 'var(--accent-bg)' : 'transparent',
                  }}
                  onMouseEnter={e => { if (selected?.id !== s.id) e.currentTarget.style.background = 'var(--surface2)'; }}
                  onMouseLeave={e => { if (selected?.id !== s.id) e.currentTarget.style.background = 'transparent'; }}>
                  <Avatar first={s.firstname} last={s.lastname} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 flex-wrap">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                        {s.firstname} {s.lastname}
                      </p>
                      {sum && <FeeProgressPill pct={sum.pct} />}
                    </div>
                    <p className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                      #{s.studentNumber}
                      {sum && <span> · K {sum.paid.toLocaleString()} paid</span>}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fee detail panel */}
        {selected && (
          <div className="md:col-span-2 space-y-4">
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3">
              <FeeSummaryCard label="Total Levied"  value={`K ${totalLevied.toLocaleString()}`} color="var(--text)" />
              <FeeSummaryCard label="Total Paid"    value={`K ${totalPaid.toLocaleString()} (${paidPct.toFixed(0)}%)`} color="var(--accent)" />
              <FeeSummaryCard label="Outstanding"   value={`K ${outstanding.toLocaleString()}`}
                color={outstanding > 0 ? 'var(--red)' : 'var(--accent-2)'} />
            </div>

            {/* Registration eligibility bar */}
            <div className="px-4 py-3 rounded-xl"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
                  Registration eligibility (60% required)
                </p>
                <span className="text-xs font-bold" style={{ color: paidPct >= 60 ? 'var(--accent-2)' : '#f59e0b' }}>
                  {paidPct >= 60 ? '✓ Eligible' : `${(60 - paidPct).toFixed(0)}% more needed`}
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div style={{
                  height: '100%', borderRadius: '9999px',
                  width: `${Math.min(paidPct, 100)}%`,
                  background: paidPct >= 60 ? 'var(--accent-2)' : '#f59e0b',
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>

            {/* Payment history table */}
            <div className="rounded-xl overflow-hidden"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b"
                style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}>
                <p className="text-xs font-semibold uppercase" style={{ color: 'var(--muted)' }}>
                  Payment History
                </p>
                {can('manageFees') && (
                  <PrimaryButton onClick={() => setShowPay(true)}>+ Record Payment</PrimaryButton>
                )}
              </div>

              {payments.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: 'var(--muted)' }}>
                  No payments recorded yet.
                </p>
              ) : payments.map((p, i) => {
                const kina = Number(p.amountPaid ?? 0);
                const pct  = totalLevied > 0 ? (kina / totalLevied) * 100 : 0;
                return (
                  <div key={p.id ?? i}
                    className="flex items-center gap-4 px-4 py-3 border-b last:border-0"
                    style={{ borderColor: 'var(--border)' }}>
                    <span className="text-xs font-mono" style={{ color: 'var(--muted)', minWidth: 20 }}>
                      #{i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                          K {kina.toLocaleString()}
                        </p>
                        <span className="text-xs font-semibold px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(56,189,248,0.15)', color: 'var(--accent)' }}>
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>
                        {p.levyType?.levyName || 'General'} · {p.paymentDate}
                      </p>
                    </div>
                    <StatusBadge status={p.paymentMethod} />
                    {p.receiptFileName && (
                      <a href={getReceiptUrl(p.id)} target="_blank" rel="noreferrer"
                        className="text-xs hover:underline" style={{ color: 'var(--blue)' }}>
                        Receipt
                      </a>
                    )}
                    {can('manageFees') && (
                      <DangerButton onClick={() => handleDelete(p.id)}>✕</DangerButton>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showPay && (
        <FeeModal
          onSave={handleSave}
          onClose={() => setShowPay(false)}
          preselectStudentId={selected?.id}
        />
      )}

      <SuccessToast message={toast} />
    </div>
  );
}