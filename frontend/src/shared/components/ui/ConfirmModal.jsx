import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import GlassCard from './GlassCard';
import { DangerButton, SecondaryButton } from './Button';

export default function ConfirmModal({ title, message, onConfirm, onCancel, confirming = false }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <GlassCard padding="p-8" className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center gap-4">

          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)' }}>
            <FontAwesomeIcon icon={faTriangleExclamation} style={{ width: 24, height: 24, color: '#f87171' }} />
          </div>

          <div>
            <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text)' }}>{title}</h3>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{message}</p>
          </div>

          <div className="flex gap-3 w-full pt-2">
            <SecondaryButton onClick={onCancel} className="flex-1">Cancel</SecondaryButton>
            <DangerButton onClick={onConfirm} disabled={confirming} className="flex-1">
              {confirming ? 'Deleting…' : 'Delete'}
            </DangerButton>
          </div>

        </div>
      </GlassCard>
    </div>
  );
}
