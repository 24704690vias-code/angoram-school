import { useState } from 'react';
import Input  from '../../../shared/components/ui/Input';
import Select from '../../../shared/components/ui/Select';
import { PrimaryButton, SecondaryButton } from '../../../shared/components/ui/Button';
import { PROVINCES } from '../constants/studentConstants';


const EMPTY_STUDENT = {
  firstname:'', lastname:'', dateOfBirth:'', gender:'', contactPhone:'',
  province:'', district:'', village:'', guardianName:'', guardianContact:'',
  guardianRelationship:'', enrolmentType:'NEW_INTAKE', grade8Score:'',
  previousSchool:'', currentGradeLevel:'9', isBoarding:false, tffRegistered:true,
};

export default function StudentForm({ initial = null, onSave, onClose }) {
  const [form,   setForm]   = useState(initial ?? EMPTY_STUDENT);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target?.value ?? e }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.firstname?.trim()) errs.firstname = 'Required';
    if (!form.lastname?.trim())  errs.lastname  = 'Required';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await onSave({
        ...form,
        currentGradeLevel: Number(form.currentGradeLevel) || 9,
        grade8Score: form.grade8Score ? Number(form.grade8Score) : null,
      });
    } catch (err) {
      setErrors({ _: err.response?.data?.error || err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Input label="First Name *" value={form.firstname}    onChange={set('firstname')}    error={errors.firstname} />
        <Input label="Last Name *"  value={form.lastname}     onChange={set('lastname')}     error={errors.lastname} />
        <Input label="Date of Birth" type="date" value={form.dateOfBirth || ''} onChange={set('dateOfBirth')} />
        <Select label="Gender" value={form.gender} onChange={set('gender')}
          options={[{value:'',label:'—'},{value:'MALE',label:'Male'},{value:'FEMALE',label:'Female'},{value:'OTHER',label:'Other'}]} />
        <Input label="Contact Phone" value={form.contactPhone || ''} onChange={set('contactPhone')} />
        <Select label="Province" value={form.province || ''} onChange={set('province')}
          options={[{value:'',label:'—'},...PROVINCES.map(p => ({value:p,label:p}))]} />
        <Input label="District" value={form.district || ''} onChange={set('district')} />
        <Input label="Village"  value={form.village  || ''} onChange={set('village')} />
        <Input label="Guardian Name"         value={form.guardianName         || ''} onChange={set('guardianName')} />
        <Input label="Guardian Contact"      value={form.guardianContact      || ''} onChange={set('guardianContact')} />
        <Input label="Guardian Relationship" value={form.guardianRelationship || ''} onChange={set('guardianRelationship')} />
        <Select label="Enrolment Type" value={form.enrolmentType} onChange={set('enrolmentType')}
          options={[{value:'NEW_INTAKE',label:'New Intake'},{value:'TRANSFER',label:'Transfer'},{value:'CONTINUING',label:'Continuing'}]} />
        <Input label="Grade Level" type="number" min="9" max="12" value={form.currentGradeLevel} onChange={set('currentGradeLevel')} />
        <Input label="Grade 8 Score" type="number" value={form.grade8Score || ''} onChange={set('grade8Score')} />
        {form.enrolmentType === 'TRANSFER' && (
          <Input label="Previous School" value={form.previousSchool || ''} onChange={set('previousSchool')} />
        )}
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--muted)' }}>
          <input type="checkbox" checked={form.isBoarding}
            onChange={e => set('isBoarding')(e.target.checked)}
            className="w-4 h-4" style={{ accentColor: 'var(--accent)' }} />
          Boarding student
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--muted)' }}>
          <input type="checkbox" checked={form.tffRegistered}
            onChange={e => set('tffRegistered')(e.target.checked)}
            className="w-4 h-4" style={{ accentColor: 'var(--accent)' }} />
          TFF registered
        </label>
      </div>

      {errors._ && (
        <div className="px-4 py-2.5 rounded-lg text-xs"
          style={{ background: 'var(--red-bg)', border: '1px solid var(--red)', color: 'var(--red)' }}>
          {errors._}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
        <PrimaryButton type="submit" disabled={saving}>
          {saving ? 'Saving…' : initial ? 'Update Student' : 'Add Student'}
        </PrimaryButton>
      </div>
    </form>
  );
}
