import { useState, useEffect } from 'react';
import { getStudents }      from '../../../api/studentApi';
import { getCurrentYear }   from '../../../api/academicYearApi';
import { getClasses }       from '../../../api/classApi';
import { getRegistrations } from '../../../api/registrationApi';
import api from '../../../api/client';
import Card       from '../../../shared/components/ui/Card';
import PageHeader from '../../../shared/components/ui/PageHeader';
import { useAuth } from '../../../shared/hooks/useAuth';
import { STATUS_HEX } from '../../students/constants/studentConstants';

// Dashboard: display totals, clear presentation, accuracy, visual appeal, dynamic data


function PieRing({ data, size = 160 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) return (
    <div style={{ width: size, height: size, color: 'var(--muted)' }}
      className="flex items-center justify-center text-xs">No data</div>
  );
  const r = (size - 20) / 2, cx = size / 2, cy = size / 2;
  let start = -Math.PI / 2;
  const paths = data.filter(d => d.value > 0).map(d => {
    const angle = (d.value / total) * 2 * Math.PI;
    const end = start + angle;
    const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end),   y2 = cy + r * Math.sin(end);
    const path = `M${cx},${cy}L${x1},${y1}A${r},${r},0,${angle > Math.PI ? 1 : 0},1,${x2},${y2}Z`;
    start = end;
    return { ...d, path, pct: Math.round((d.value / total) * 100) };
  });
  return (
    <svg width={size} height={size} role="img" aria-label="Student status distribution">
      {paths.map((p, i) => (
        <path key={i} d={p.path} fill={p.color} opacity="0.9">
          <title>{p.label}: {p.value} ({p.pct}%)</title>
        </path>
      ))}
      <circle cx={cx} cy={cy} r={r * 0.5} fill="var(--bg)" />
      <text x={cx} y={cy - 6}  textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--text)">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9"  fill="var(--muted)">STUDENTS</text>
    </svg>
  );
}

function StatRow({ label, value, color, bar, max }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
      <span className="text-xs flex-1 capitalize" style={{ color: 'var(--muted)' }}>{label}</span>
      {bar && max > 0 && (
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full" style={{ width: `${(value / max) * 100}%`, background: color }} />
        </div>
      )}
      <span className="text-xs font-semibold w-6 text-right" style={{ color: 'var(--text)' }}>{value}</span>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [students,  setStudents]  = useState([]);
  const [classes,   setClasses]   = useState([]);
  const [year,      setYear]      = useState(null);
  const [regs,      setRegs]      = useState([]);
  const [feeReport, setFeeReport] = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([getStudents(), getCurrentYear(), getClasses()])
      .then(([s, y, c]) => {
        setStudents(s); setYear(y); setClasses(c);
        if (y) {
          getRegistrations(y.id).then(setRegs);
          // fetch aggregated report data from /api/reports
          api.get(`/reports/fees/${y.id}`).then(r => setFeeReport(r.data)).catch(() => {});
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const counts = Object.fromEntries(
    Object.keys(STATUS_HEX).map(k => [k, students.filter(s => s.status === k).length])
  );
  const total = students.length;

  const pieData = Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ label: k, value: v, color: STATUS_HEX[k] }));

  const gradeBreakdown = [9, 10, 11, 12].map(g => ({
    grade: g,
    count: students.filter(s => s.currentGradeLevel === g && s.status === 'ACTIVE').length,
    classCount: classes.filter(c => c.gradeLevel === g).length,
  }));

  const confirmedRegs = regs.filter(r => r.regStatus === 'CONFIRMED').length;
  const activeCount   = counts.ACTIVE ?? 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const Skeleton = () => (
    <div className="animate-pulse h-40 rounded-lg" style={{ background: 'var(--surface2)' }} />
  );

  return (
    <div className="space-y-8 animate-fade">
      <PageHeader
        title={`${greeting}, ${
            user?.role === 'ADMIN'     ? 'Administrator' :
            user?.role === 'PRINCIPAL' ? 'Principal'     :
            user?.role === 'TEACHER'   ? 'Teacher'       :
            user?.fullName?.split(' ')[0] ?? user?.username ?? 'User'
          }`}
        subtitle={`${year ? `Academic Year ${year.yearLabel}` : 'Angoram Secondary School'} · ${new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}`}
      />

      {/*Dashboard: summary stat cards — total students, active, classes, registrations */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Total Students" value={loading ? '—' : total}           icon="🎓"
          trend={total > 0 ? { positive: true, label: `${activeCount} active` } : null} />
        <Card title="Active Students" value={loading ? '—' : activeCount}   icon="✅"
          trend={total > 0 ? { positive: true, label: `${Math.round(activeCount/total*100)}% of total` } : null} />
        <Card title="Classes"          value={loading ? '—' : classes.length} icon="🏫"
          trend={{ positive: true, label: `Grades 9–12` }} />
        <Card title="Registered"       value={loading ? '—' : confirmedRegs} icon="📋"
          trend={year ? { positive: true, label: year.yearLabel } : null} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Status distribution — CP3: accurate data, dynamic */}
        <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h3 className="text-sm font-semibold mb-5" style={{ color: 'var(--text)' }}>Student Status Distribution</h3>
          {loading ? <Skeleton /> : (
            <div className="flex items-center gap-6">
              <PieRing data={pieData} size={160} />
              <div className="flex-1 space-y-2.5">
                {Object.entries(counts).map(([k, v]) => (
                  <StatRow key={k} label={k.toLowerCase()} value={v} color={STATUS_HEX[k]} bar max={total} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Grade breakdown */}
        <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h3 className="text-sm font-semibold mb-5" style={{ color: 'var(--text)' }}>Enrolment by Grade Level</h3>
          {loading ? <Skeleton /> : (
            <div className="space-y-4">
              {gradeBreakdown.map(({ grade, count, classCount }) => (
                <div key={grade}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Grade {grade}</span>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>
                      {count} students · {classCount} class{classCount !== 1 ? 'es' : ''}
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface2)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: total ? `${(count / total) * 100}%` : '0%', background: 'var(--blue)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Second row — fee summary + recent students */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Fee collection summary — report data */}
        <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h3 className="text-sm font-semibold mb-5" style={{ color: 'var(--text)' }}>
            Fee Collection — {year?.yearLabel}
          </h3>
          {loading || !feeReport ? <Skeleton /> : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg p-3" style={{ background: 'var(--surface2)' }}>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>Total Collected</p>
                  <p className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
                    K {Number(feeReport.totalCollected || 0).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg p-3" style={{ background: 'var(--surface2)' }}>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>Students Paid</p>
                  <p className="text-xl font-bold" style={{ color: 'var(--accent-2)' }}>
                    {feeReport.studentsWithPayments ?? 0}
                  </p>
                </div>
              </div>
              {feeReport.byMethod?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase" style={{ color: 'var(--muted)' }}>By Method</p>
                  {feeReport.byMethod.map(m => (
                    <div key={m.method} className="flex items-center justify-between text-xs">
                      <span style={{ color: 'var(--muted)' }}>{m.method.replace('_', ' ')}</span>
                      <span className="font-semibold" style={{ color: 'var(--text)' }}>
                        K {Number(m.total || 0).toLocaleString()} ({m.count})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent students */}
        <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Recently Added Students</h3>
          {loading ? <Skeleton /> : (
            <div className="space-y-1">
              {students.slice(-6).reverse().map(s => (
                <div key={s.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                    style={{ background: (STATUS_HEX[s.status] || '#888') + '20', color: STATUS_HEX[s.status] || '#888' }}>
                    {s.firstname?.[0]}{s.lastname?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                      {s.firstname} {s.lastname}
                    </p>
                    <p className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                      #{s.studentNumber} · Grade {s.currentGradeLevel ?? '?'}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: (STATUS_HEX[s.status] || '#888') + '20', color: STATUS_HEX[s.status] || '#888' }}>
                    {s.status}
                  </span>
                </div>
              ))}
              {students.length === 0 && (
                <p className="text-sm text-center py-6" style={{ color: 'var(--muted)' }}>No students yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}