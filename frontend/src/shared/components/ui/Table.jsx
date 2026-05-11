export default function Table({
  columns = [], data = [], loading = false,
  emptyMessage = 'No records found.', onRowClick, className = ''
}) {
  const rows = Array.isArray(data) ? data : [];

  return (
    <div className={`w-full overflow-x-auto rounded-[18px] ${className}`}
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)' }}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            {columns.map(col => (
              <th key={col.key}
                className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--muted)' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-10 text-center" style={{ color: 'var(--muted)' }}>
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                  </svg>
                  Loading…
                </div>
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-10 text-center text-sm"
                style={{ color: 'var(--muted)' }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={row.id ?? row.student_id ?? row.department_id ?? row.course_id ?? row.teacher_id ?? i}
                onClick={() => onRowClick?.(row)}
                style={{
                  borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  cursor: onRowClick ? 'pointer' : 'default',
                }}
                onMouseEnter={e => { if (onRowClick) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                {columns.map(col => (
                  <td key={col.key} className="px-5 py-4"
                    style={{ color: col.muted ? 'var(--muted)' : 'var(--text)' }}>
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function StatusBadge({ status }) {
  const styles = {
    ACTIVE:     { color: 'var(--accent-2)', bg: 'rgba(34,197,94,0.12)'   },
    GRADUATED:  { color: 'var(--accent)',   bg: 'rgba(56,189,248,0.12)'  },
    INACTIVE:   { color: 'var(--muted)',    bg: 'rgba(255,255,255,0.08)' },
    SUSPENDED:  { color: '#f87171',         bg: 'rgba(248,113,113,0.12)' },
    PENDING:    { color: '#fbbf24',         bg: 'rgba(251,191,36,0.12)'  },
    PAID:       { color: 'var(--accent-2)', bg: 'rgba(34,197,94,0.12)'   },
    UNPAID:     { color: '#f87171',         bg: 'rgba(248,113,113,0.12)' },
  };
  const s = styles[status] ?? { color: 'var(--muted)', bg: 'rgba(255,255,255,0.08)' };
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ color: s.color, background: s.bg }}>
      {status}
    </span>
  );
}
