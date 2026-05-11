import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft, faChevronRight,
  faAnglesLeft,  faAnglesRight,
} from '@fortawesome/free-solid-svg-icons';

const btn = (active, disabled) => ({
  display:        'inline-flex',
  alignItems:     'center',
  justifyContent: 'center',
  minWidth:       '34px',
  height:         '34px',
  padding:        '0 8px',
  borderRadius:   '10px',
  fontSize:       '13px',
  fontWeight:     active ? 600 : 400,
  cursor:         disabled ? 'not-allowed' : 'pointer',
  transition:     'all 0.15s',
  opacity:        disabled ? 0.35 : 1,
  background:     active
    ? 'rgba(56,189,248,0.18)'
    : 'rgba(255,255,255,0.05)',
  border: active
    ? '1px solid rgba(56,189,248,0.4)'
    : '1px solid rgba(255,255,255,0.10)',
  color: active ? 'var(--accent)' : 'var(--muted)',
});

// Generate page number array with ellipsis
function pageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '…', total];
  if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '…', current - 1, current, current + 1, '…', total];
}

export default function Pagination({ page, totalPages, onPageChange, pageSize, onPageSizeChange, totalItems }) {
  if (totalPages <= 1 && totalItems <= pageSize) return null;

  const pages  = pageRange(page, totalPages);
  const from   = (page - 1) * pageSize + 1;
  const to     = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">

      {/* Left — result info + page size */}
      <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--muted)' }}>
        <span>
          Showing <strong style={{ color: 'var(--text)' }}>{from}–{to}</strong> of{' '}
          <strong style={{ color: 'var(--text)' }}>{totalItems}</strong> students
        </span>
        <span style={{ opacity: 0.3 }}>|</span>
        <div className="flex items-center gap-2">
          <span>Rows</span>
          <select
            value={pageSize}
            onChange={e => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
            className="px-2 py-1 rounded-lg text-sm outline-none"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border:     '1px solid rgba(255,255,255,0.12)',
              color:      'var(--text)',
            }}>
            {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* Right — page buttons */}
      <div className="flex items-center gap-1">
        {/* First */}
        <button style={btn(false, page === 1)} disabled={page === 1}
          onClick={() => onPageChange(1)} title="First page">
          <FontAwesomeIcon icon={faAnglesLeft} style={{ width: 11 }} />
        </button>

        {/* Prev */}
        <button style={btn(false, page === 1)} disabled={page === 1}
          onClick={() => onPageChange(page - 1)} title="Previous page">
          <FontAwesomeIcon icon={faChevronLeft} style={{ width: 10 }} />
        </button>

        {/* Page numbers */}
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} style={{ color: 'var(--muted)', padding: '0 4px', fontSize: 13 }}>…</span>
          ) : (
            <button key={p} style={btn(p === page, false)} onClick={() => onPageChange(p)}>
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button style={btn(false, page === totalPages)} disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)} title="Next page">
          <FontAwesomeIcon icon={faChevronRight} style={{ width: 10 }} />
        </button>

        {/* Last */}
        <button style={btn(false, page === totalPages)} disabled={page === totalPages}
          onClick={() => onPageChange(totalPages)} title="Last page">
          <FontAwesomeIcon icon={faAnglesRight} style={{ width: 11 }} />
        </button>
      </div>

    </div>
  );
}
