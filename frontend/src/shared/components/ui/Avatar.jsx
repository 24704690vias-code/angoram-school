export default function Avatar({ first, last, size = 'md' }) {
  const initials = `${first?.[0] ?? '?'}${last?.[0] ?? '?'}`.toUpperCase();
  const sizes = { sm: 'w-6 h-6 text-[10px]', md: 'w-8 h-8 text-xs', lg: 'w-11 h-11 text-sm' };
  return (
    <span className={`inline-flex items-center justify-center rounded-full font-bold shrink-0 ${sizes[size]}`}
      style={{
        background: 'linear-gradient(135deg,rgba(56,189,248,0.22),rgba(34,197,94,0.18))',
        color: 'var(--accent)',
        border: '1px solid rgba(56,189,248,0.25)',
      }}>
      {initials}
    </span>
  );
}
