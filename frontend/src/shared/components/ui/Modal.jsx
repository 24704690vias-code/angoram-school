
import GlassCard from './GlassCard';

export default function Modal({ onClose, children, className = '' }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <GlassCard className={`w-full ${className}`}>
        {children}
      </GlassCard>
    </div>
  );
}
