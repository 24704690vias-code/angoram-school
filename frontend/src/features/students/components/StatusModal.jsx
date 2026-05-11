import Modal  from '../../../shared/components/ui/Modal';
import Select from '../../../shared/components/ui/Select';
import { PrimaryButton, SecondaryButton } from '../../../shared/components/ui/Button';
import { updateStudentStatus } from '../services/studentService';
import { useState } from 'react';

const STATUS_OPTIONS = ['ACTIVE','SUSPENDED','WITHDRAWN','EXPELLED','GRADUATED']
  .map(s => ({ value: s, label: s }));

export default function StatusModal({ student, onClose, onUpdated }) {
  const [status, setStatus] = useState(student.status);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateStudentStatus(student.id, status, reason);
     
      
      onUpdated('Status updated', updated);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose} className="max-w-sm">
      <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text)' }}>
        Update Status
      </h2>
      <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>
        {student.firstname} {student.lastname}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="New Status" value={status} onChange={e => setStatus(e.target.value)}
          options={STATUS_OPTIONS} />
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
            style={{ color: 'var(--muted)' }}>Reason</label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={3}
            placeholder="Reason for status change…"
            className="resize-none"
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton type="submit" disabled={saving}>
            {saving ? 'Updating…' : 'Update Status'}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}