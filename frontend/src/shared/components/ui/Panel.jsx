
export default function Panel({ title, action, children, flush = false, className = '' }) {
  return (
    <div
      className={`rounded-xl overflow-hidden ${className}`}
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {(title || action) && (
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}
        >
          {title && (
            <p className="text-xs font-semibold uppercase" style={{ color: 'var(--muted)' }}>
              {title}
            </p>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={flush ? '' : 'p-6'}>{children}</div>
    </div>
  );
}
