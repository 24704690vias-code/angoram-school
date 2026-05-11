import { useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCloudArrowUp, faFileImage, faFilePdf,
  faXmark, faEye, faDownload,
} from '@fortawesome/free-solid-svg-icons';

const ACCEPTED = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
const MAX_SIZE  = 5 * 1024 * 1024; // 5 MB

function formatBytes(bytes) {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1024 ** 2)  return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function FileIcon({ type }) {
  const icon = type === 'application/pdf' ? faFilePdf : faFileImage;
  const color = type === 'application/pdf' ? '#f87171' : 'var(--accent)';
  return <FontAwesomeIcon icon={icon} style={{ width: 28, height: 28, color }} />;
}

// ── UploadZone — for selecting a new file ─────────────────────
export function ReceiptUploadZone({ value, onChange, error }) {
  const inputRef  = useRef(null);
  const [drag, setDrag] = useState(false);
  const [localError, setLocalError] = useState('');

  const validate = (file) => {
    if (!ACCEPTED.includes(file.type)) {
      setLocalError('Only PDF, JPG, JPEG, PNG files are accepted.');
      return false;
    }
    if (file.size > MAX_SIZE) {
      setLocalError(`File too large. Max size is 5 MB (selected: ${formatBytes(file.size)}).`);
      return false;
    }
    setLocalError('');
    return true;
  };

  const handleFile = (file) => {
    if (file && validate(file)) onChange(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const displayError = localError || error;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: 'var(--muted)' }}>
        Receipt / Proof of Payment
        <span className="ml-1 normal-case font-normal" style={{ color: 'var(--muted)' }}>
          (PDF, JPG, PNG · max 5 MB)
        </span>
      </label>

      {value ? (
        // ── Selected file preview ────────────────────────────
        <div className="flex items-center gap-3 px-4 py-3 rounded-[14px]"
          style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.25)' }}>
          <FileIcon type={value.type} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
              {value.name}
            </p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              {formatBytes(value.size)}
            </p>
          </div>
          <button type="button" onClick={() => { onChange(null); setLocalError(''); }}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
            style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171' }}
            title="Remove file">
            <FontAwesomeIcon icon={faXmark} style={{ width: 12 }} />
          </button>
        </div>
      ) : (
        // ── Drop zone ────────────────────────────────────────
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
          className="flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-[14px] cursor-pointer transition-all duration-200"
          style={{
            background: drag ? 'rgba(56,189,248,0.10)' : 'rgba(255,255,255,0.04)',
            border:     drag
              ? '2px dashed rgba(56,189,248,0.6)'
              : '2px dashed rgba(255,255,255,0.15)',
          }}>
          <FontAwesomeIcon icon={faCloudArrowUp}
            style={{ width: 28, height: 28, color: drag ? 'var(--accent)' : 'rgba(255,255,255,0.3)' }} />
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: drag ? 'var(--accent)' : 'var(--muted)' }}>
              {drag ? 'Drop file here' : 'Click or drag & drop receipt'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
              PDF, JPG, JPEG, PNG up to 5 MB
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={e => handleFile(e.target.files?.[0])}
          />
        </div>
      )}

      {displayError && (
        <p className="text-xs" style={{ color: '#f87171' }}>{displayError}</p>
      )}
    </div>
  );
}

// ── ReceiptBadge — shown in table row when receipt exists ──────
export function ReceiptBadge({ fee, onView, onDownload, onRemove }) {
  if (!fee.receiptFileName) return <span style={{ color: 'var(--muted)', fontSize: 12 }}>—</span>;

  return (
    <div className="flex items-center gap-1.5">
      <FileIcon type={fee.receiptFileType} />
      <span className="text-xs max-w-25 truncate" style={{ color: 'var(--muted)' }}
        title={fee.receiptFileName}>
        {fee.receiptFileName}
      </span>
      <button onClick={() => onView(fee)}
        className="w-6 h-6 rounded-md flex items-center justify-center transition-all"
        style={{ background: 'rgba(56,189,248,0.10)', color: 'var(--accent)' }}
        title="View receipt">
        <FontAwesomeIcon icon={faEye} style={{ width: 10 }} />
      </button>
      <button onClick={() => onDownload(fee)}
        className="w-6 h-6 rounded-md flex items-center justify-center transition-all"
        style={{ background: 'rgba(34,197,94,0.10)', color: 'var(--accent-2)' }}
        title="Download receipt">
        <FontAwesomeIcon icon={faDownload} style={{ width: 10 }} />
      </button>
      {onRemove && (
        <button onClick={() => onRemove(fee)}
          className="w-6 h-6 rounded-md flex items-center justify-center transition-all"
          style={{ background: 'rgba(248,113,113,0.10)', color: '#f87171' }}
          title="Remove receipt">
          <FontAwesomeIcon icon={faXmark} style={{ width: 10 }} />
        </button>
      )}
    </div>
  );
}

// ── ReceiptViewerModal — inline preview in a modal ─────────────
export function ReceiptViewerModal({ fee, viewUrl, onClose }) {
  const isPdf = fee.receiptFileType === 'application/pdf';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-2xl rounded-[20px] overflow-hidden flex flex-col"
        style={{ background: 'var(--card)', border: '1px solid var(--card-border)', maxHeight: '90vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2.5">
            <FileIcon type={fee.receiptFileType} />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                {fee.receiptFileName}
              </p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                {formatBytes(fee.receiptFileSize ?? 0)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href={`${viewUrl.replace('/view', '/download')}`}
              download={fee.receiptFileName}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-medium"
              style={{ background: 'rgba(34,197,94,0.12)', color: 'var(--accent-2)' }}>
              <FontAwesomeIcon icon={faDownload} style={{ width: 11 }} />
              Download
            </a>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--muted)' }}>
              <FontAwesomeIcon icon={faXmark} style={{ width: 13 }} />
            </button>
          </div>
        </div>

        {/* Viewer */}
        <div className="flex-1 overflow-auto" style={{ minHeight: 400 }}>
          {isPdf ? (
            <iframe
              src={viewUrl}
              title="Receipt"
              className="w-full"
              style={{ height: 600, border: 'none' }}
            />
          ) : (
            <div className="flex items-center justify-center p-6">
              <img
                src={viewUrl}
                alt="Receipt"
                className="max-w-full max-h-[70vh] rounded-xl object-contain"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
