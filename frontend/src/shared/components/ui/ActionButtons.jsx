import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons';

export default function ActionButtons({ onEdit, onDelete, deleting = false }) {
  return (
    <div className="flex items-center gap-2">

      {/* Edit */}
      <button
        onClick={e => { e.stopPropagation(); onEdit?.(); }}
        title="Edit"
        className="w-8 h-8 rounded-[10px] flex items-center justify-center transition-all duration-150 hover:-translate-y-0.5"
        style={{
          background: 'rgba(56,189,248,0.10)',
          border: '1px solid rgba(56,189,248,0.20)',
          color: 'var(--accent)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(56,189,248,0.20)';
          e.currentTarget.style.border     = '1px solid rgba(56,189,248,0.40)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(56,189,248,0.10)';
          e.currentTarget.style.border     = '1px solid rgba(56,189,248,0.20)';
        }}
      >
        <FontAwesomeIcon icon={faPenToSquare} style={{ width: 13, height: 13 }} />
      </button>

      {/* Delete */}
      <button
        onClick={e => { e.stopPropagation(); onDelete?.(); }}
        title="Delete"
        disabled={deleting}
        className="w-8 h-8 rounded-[10px] flex items-center justify-center transition-all duration-150 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: 'rgba(248,113,113,0.10)',
          border: '1px solid rgba(248,113,113,0.20)',
          color: '#f87171',
        }}
        onMouseEnter={e => {
          if (!deleting) {
            e.currentTarget.style.background = 'rgba(248,113,113,0.20)';
            e.currentTarget.style.border     = '1px solid rgba(248,113,113,0.40)';
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(248,113,113,0.10)';
          e.currentTarget.style.border     = '1px solid rgba(248,113,113,0.20)';
        }}
      >
        {deleting
          ? <svg className="animate-spin" style={{ width: 13, height: 13 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
            </svg>
          : <FontAwesomeIcon icon={faTrashCan} style={{ width: 13, height: 13 }} />
        }
      </button>

    </div>
  );
}
