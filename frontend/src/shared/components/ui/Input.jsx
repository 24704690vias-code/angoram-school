export default function Input({ label, id, error, value = '', className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--muted)' }}>
          {label}
        </label>
      )}
      <input
        id={id}
        value={value}
        className={`w-full px-4 py-2.5 rounded-[14px] text-sm outline-none transition-all duration-200 ${className}`}
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: error ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.12)',
          color: 'var(--text)',
        }}
        onFocus={e => {
          e.target.style.border = '1px solid var(--accent)';
          e.target.style.boxShadow = '0 0 0 3px rgba(56,189,248,0.15)';
        }}
        onBlur={e => {
          e.target.style.border = error ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.12)';
          e.target.style.boxShadow = 'none';
        }}
        {...props}
      />
      {error && <p className="text-xs" style={{ color: '#f87171' }}>{error}</p>}
    </div>
  );
}
