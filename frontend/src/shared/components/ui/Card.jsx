export default function Card({ title, value, icon, trend, className = '' }) {
  return (
    <div
      className={`rounded-[18px] p-5 transition-all duration-200 hover:-translate-y-0.5 ${className}`}
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>{title}</h3>
        {icon && (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
            style={{ background: 'linear-gradient(135deg,rgba(56,189,248,0.16),rgba(34,197,94,0.14))', border: '1px solid rgba(255,255,255,0.10)' }}>
            {icon}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>{value}</p>
      {trend && (
        <p className="mt-2 text-xs font-medium" style={{ color: trend.positive ? 'var(--accent-2)' : '#f87171' }}>
          {trend.positive ? '▲' : '▼'} {trend.label}
        </p>
      )}
    </div>
  );
}
