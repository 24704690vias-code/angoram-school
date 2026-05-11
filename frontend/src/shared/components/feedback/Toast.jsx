export function SuccessToast({ message }) {
  if (!message) return null;
  return (
    <div className="px-5 py-3 rounded-[14px] text-sm font-medium"
      style={{ background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(34,197,94,0.28)', color: 'var(--accent-2)' }}>
      ✓ {message}
    </div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="px-5 py-3 rounded-[14px] text-sm flex items-center justify-between"
      style={{ background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171' }}>
      <span>⚠ {message}</span>
      {onRetry && (
        <button onClick={onRetry} className="underline text-xs ml-4">Retry</button>
      )}
    </div>
  );
}
