
export default function GlassCard({ children, className = '', padding = 'p-6', title, subtitle }) {
  return (
    <div className={`card ${padding} ${className}`}>
      {(title || subtitle) && (
        <div className="mb-6">
          {title    && <h2 className="text-xl font-bold tracking-tight mb-1" style={{ color: 'var(--text)' }}>{title}</h2>}
          {subtitle && <p className="text-sm" style={{ color: 'var(--muted)' }}>{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
