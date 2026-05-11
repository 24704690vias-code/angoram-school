import { useState, useEffect, useMemo } from 'react';
import { getClasses } from '../../../api/classApi';
import Avatar        from '../../../shared/components/ui/Avatar';
import Table, { StatusBadge } from '../../../shared/components/ui/Table';
import ConfirmModal  from '../../../shared/components/ui/ConfirmModal';
import Modal         from '../../../shared/components/ui/Modal';
import ActionButtons from '../../../shared/components/ui/ActionButtons';
import { PrimaryButton, SecondaryButton } from '../../../shared/components/ui/Button';
import { SuccessToast } from '../../../shared/components/feedback/Toast';
import StudentForm      from '../components/StudentForm';
import StatusModal      from '../components/StatusModal';
import AssignClassModal from '../components/AssignClassModal';
import { useStudents } from '../hooks/useStudents';
import { useAuth }     from '../../../shared/hooks/useAuth';
import PageHeader from '../../../shared/components/ui/PageHeader';

export default function Students() {
  const { can } = useAuth();
  const { students, loading, addStudent, editStudent, removeStudent, refreshStudent } = useStudents();
  const [classes,      setClasses]      = useState([]);
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterGrade,  setFilterGrade]  = useState('');
  const [showAdd,      setShowAdd]      = useState(false);
  const [editing,      setEditing]      = useState(null);
  const [deleting,     setDeleting]     = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [classTarget,  setClassTarget]  = useState(null);
  const [toast,        setToast]        = useState('');

  useEffect(() => { getClasses().then(setClasses); }, []);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const filtered = useMemo(() => {
    let d = [...students];
    if (search.trim()) {
      const q = search.toLowerCase();
      d = d.filter(s =>
        `${s.firstname} ${s.lastname}`.toLowerCase().includes(q) ||
        s.studentNumber?.includes(q) ||
        s.province?.toLowerCase().includes(q)
      );
    }
    if (filterStatus) d = d.filter(s => s.status === filterStatus);
    if (filterGrade)  d = d.filter(s => String(s.currentGradeLevel) === filterGrade);
    return d;
  }, [students, search, filterStatus, filterGrade]);

  const handleAdd = async (data) => {
    await addStudent(data);
    setShowAdd(false);
    notify('Student added successfully');
  };

  const handleEdit = async (data) => {
    await editStudent(editing.id, data);
    setEditing(null);
    notify('Student updated');
  };

  const handleDelete = async () => {
    await removeStudent(deleting.id);
    setDeleting(null);
    notify('Student deleted');
  };

  const cols = [
    {
      key: 'id', label: 'Student',
      render: (_, r) => (
        <div className="flex items-center gap-2.5">
          <Avatar first={r.firstname} last={r.lastname} />
          <div>
            <p className="font-medium" style={{ color: 'var(--text)' }}>{r.firstname} {r.lastname}</p>
            <p className="text-xs font-mono" style={{ color: 'var(--muted)' }}>#{r.studentNumber}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'currentGradeLevel', label: 'Grade / Class',
      render: (v, r) => (
        <div>
          <p className="font-medium" style={{ color: 'var(--text)' }}>{v ? `Grade ${v}` : '—'}</p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>{r.currentClass?.classCode ?? 'Unassigned'}</p>
        </div>
      ),
    },
    { key: 'enrolmentType', label: 'Enrolment', render: v => <StatusBadge status={v} /> },
    { key: 'province',      label: 'Province',  render: v => <span style={{ color: 'var(--muted)' }}>{v || '—'}</span> },
    { key: 'status',        label: 'Status',    render: v => <StatusBadge status={v} /> },
    {
      key: '_actions', label: '',
      render: (_, r) => can('manageStudents') && (
        <div className="flex items-center gap-1 justify-end">
          <SecondaryButton onClick={() => setClassTarget(r)}>Assign</SecondaryButton>
          <SecondaryButton onClick={() => setStatusTarget(r)}>Status</SecondaryButton>
          <ActionButtons
            onEdit={() => setEditing(r)}
            onDelete={() => setDeleting(r)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade">
      <PageHeader
        title="Students"
        subtitle={`${filtered.length} of ${students.length} students`}
      >
        {can('manageStudents') && (
          <PrimaryButton onClick={() => setShowAdd(true)}>+ Add Student</PrimaryButton>
        )}
      </PageHeader>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name, student number, province…"
          className="flex-1 min-w-48"
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-40">
          <option value="">All Statuses</option>
          {['ACTIVE','SUSPENDED','WITHDRAWN','EXPELLED','GRADUATED'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} className="w-36">
          <option value="">All Grades</option>
          {[9,10,11,12].map(g => <option key={g} value={g}>Grade {g}</option>)}
        </select>
      </div>

      <Table columns={cols} data={filtered} loading={loading}
        emptyMessage="No students found. Add one to get started." />

      {/* Add modal */}
      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} className="max-w-3xl">
          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>Add New Student</h2>
          <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>Fill in the student's details below</p>
          <StudentForm onSave={handleAdd} onClose={() => setShowAdd(false)} />
        </Modal>
      )}

      {/* Edit modal */}
      {editing && (
        <Modal onClose={() => setEditing(null)} className="max-w-3xl">
          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>Edit Student</h2>
          <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>Update the student's details</p>
          <StudentForm
            initial={{ ...editing, dateOfBirth: editing.dateOfBirth ?? '' }}
            onSave={handleEdit}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}

      {/* Delete confirm */}
      {deleting && (
        <ConfirmModal
          title="Delete Student"
          message={`Delete ${deleting.firstname} ${deleting.lastname}? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}

      {/* Status modal */}
      {statusTarget && (
        <StatusModal
          student={statusTarget}
          onClose={() => setStatusTarget(null)}
          onUpdated={(msg, updatedStudent) => {
            setStatusTarget(null);
            notify(msg);
            if (updatedStudent) refreshStudent(updatedStudent);
          }}
        />
      )}

      {/* Assign class modal */}
      {classTarget && (
        <AssignClassModal
          student={classTarget}
          classes={classes}
          onClose={() => setClassTarget(null)}
          onUpdated={(msg, updatedStudent) => {
            setClassTarget(null);
            notify(msg);
            // Replace student in context immediately — no API call needed
            if (updatedStudent) refreshStudent(updatedStudent);
          }}
        />
      )}

      <SuccessToast message={toast} />
    </div>
  );
}