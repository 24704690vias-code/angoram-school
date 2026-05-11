export function PrimaryButton({ children, onClick, type = 'button', disabled = false, className = '' }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center justify-center px-5 py-2.5 rounded-[14px] font-semibold text-white text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 ${className}`}
      style={{ background: 'linear-gradient(135deg, var(--accent), #0ea5e9)', boxShadow: '0 10px 30px rgba(14,165,233,0.25)' }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.boxShadow = '0 16px 34px rgba(14,165,233,0.35)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 10px 30px rgba(14,165,233,0.25)'; }}>
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick, type = 'button', disabled = false, className = '' }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center justify-center px-5 py-2.5 rounded-[14px] font-semibold text-sm transition-all duration-200 disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0 ${className}`}
      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text)' }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = 'rgba(255,255,255,0.11)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}>
      {children}
    </button>
  );
}

export function DangerButton({ children, onClick, type = 'button', disabled = false, className = '' }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center justify-center px-5 py-2.5 rounded-[14px] font-semibold text-white text-sm transition-all duration-200 disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0 ${className}`}
      style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 10px 30px rgba(239,68,68,0.25)' }}>
      {children}
    </button>
  );
}
