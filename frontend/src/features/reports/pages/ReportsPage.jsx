import { useState, useEffect } from 'react';
import { getStudents } from '../../../api/studentApi';
import { getCurrentYear } from '../../../api/academicYearApi';
import { getClasses } from '../../../api/classApi';
import { getYearEndResults } from '../../../api/yearEndApi';
import { loadJsPDF, loadXLSX } from '../../../shared/utils/exportLoaders';
import PageHeader from '../../../shared/components/ui/PageHeader';
import { STATUS_COLORS } from '../../students/constants/studentConstants';



function pdfHeader(doc, subtitle, yearLabel) {
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(13, 17, 23); doc.rect(0, 0, W, 18, 'F');
  doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.setTextColor(46, 160, 67);
  doc.text('Angoram Secondary School', 14, 12);
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(180, 190, 200);
  doc.text(`${subtitle} — ${yearLabel}`, 14, 17);
  doc.text(new Date().toLocaleDateString(), W - 14, 12, { align: 'right' });
}

async function exportStudentsPDF(students, year) {
  const J = await loadJsPDF();
  const doc = new J({ orientation: 'landscape' });
  pdfHeader(doc, 'Student Report', year?.yearLabel);
  doc.autoTable({
    startY: 22,
    head: [['#','Student No.','First Name','Last Name','Grade','Class','Province','Status','Enrolment']],
    body: students.map(s => [s.id, s.studentNumber, s.firstname, s.lastname,
      s.currentGradeLevel ?? '—', s.currentClass?.classCode ?? '—',
      s.province ?? '—', s.status, s.enrolmentType]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [13,17,23], textColor: [46,160,67], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245,247,250] },
  });
  doc.save(`angoram-students-${year?.yearLabel}.pdf`);
}

async function exportStudentsXLSX(students, year) {
  const X = await loadXLSX();
  const rows = [
    ['ID','Student No','First Name','Last Name','DOB','Gender','Phone','Province','District',
     'Village','Guardian','Guardian Phone','Enrolment','Grade','Class','Status','Boarding','TFF'],
    ...students.map(s => [s.id, s.studentNumber, s.firstname, s.lastname,
      s.dateOfBirth ?? '', s.gender ?? '', s.contactPhone ?? '', s.province ?? '',
      s.district ?? '', s.village ?? '', s.guardianName ?? '', s.guardianContact ?? '',
      s.enrolmentType, s.currentGradeLevel ?? '', s.currentClass?.classCode ?? '',
      s.status, s.isBoarding ? 'Yes' : 'No', s.tffRegistered ? 'Yes' : 'No']),
  ];
  const ws = X.utils.aoa_to_sheet(rows);
  ws['!cols'] = [8,14,14,14,12,10,14,14,12,12,18,14,14,8,8,12,10,8].map(w => ({ wch: w }));
  const wb = X.utils.book_new();
  X.utils.book_append_sheet(wb, ws, 'Students');
  X.writeFile(wb, `angoram-students-${year?.yearLabel}.xlsx`);
}

async function exportClassListsPDF(classes, students, year) {
  const J = await loadJsPDF();
  const doc = new J();
  let pageAdded = false;
  for (const cls of classes) {
    const sc = students.filter(s => s.currentClass?.id === cls.id);
    if (!sc.length) continue;
    if (pageAdded) doc.addPage(); else pageAdded = true;
    pdfHeader(doc, `Class List — ${cls.classCode} — Grade ${cls.gradeLevel}`, year?.yearLabel);
    doc.autoTable({
      startY: 22,
      head: [['#','Student No.','Full Name','Gender','Province','Status']],
      body: sc.map((s, i) => [i+1, s.studentNumber, `${s.firstname} ${s.lastname}`,
        s.gender ?? '—', s.province ?? '—', s.status]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [13,17,23], textColor: [46,160,67], fontStyle: 'bold' },
    });
  }
  if (pageAdded) doc.save(`angoram-class-lists-${year?.yearLabel}.pdf`);
}

async function exportFullXLSX(students, classes, results, year) {
  const X = await loadXLSX();
  const wb = X.utils.book_new();
  X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet([
    ['ID','Student No','Name','Grade','Class','Status','Province','TFF'],
    ...students.map(s => [s.id, s.studentNumber, `${s.firstname} ${s.lastname}`,
      s.currentGradeLevel ?? '', s.currentClass?.classCode ?? '',
      s.status, s.province ?? '', s.tffRegistered ? 'Yes' : 'No']),
  ]), 'Students');
  X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet([
    ['Code','Grade','Max Capacity','Active Students'],
    ...classes.map(c => [c.classCode, c.gradeLevel, c.maxCapacity,
      students.filter(s => s.currentClass?.id === c.id && s.status === 'ACTIVE').length]),
  ]), 'Classes');
  X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet([
    ['Student','Grade','Outcome','Final Average','Attendance %','Notes'],
    ...results.map(r => [r.student ? `${r.student.firstname} ${r.student.lastname}` : '—',
      r.gradeLevel, r.outcome, r.finalAverage ?? '', r.attendancePct ?? '', r.notes ?? '']),
  ]), 'Year End');
  const counts = Object.fromEntries(Object.keys(STATUS_COLORS).map(k => [k, 0]));
  students.forEach(s => { if (counts[s.status] !== undefined) counts[s.status]++; });
  X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet([
    ['Angoram Secondary School — Full Report'],
    ['Year', year?.yearLabel], ['Total Students', students.length],
    ...Object.entries(counts).map(([k, v]) => [k, v]),
    ['Classes', classes.length],
  ]), 'Summary');
  X.writeFile(wb, `angoram-full-report-${year?.yearLabel}.xlsx`);
}

function ExportButton({ label, icon, color, loading, onClick }) {
  return (
    <button onClick={onClick} disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50 hover:-translate-y-0.5"
      style={{ background: `rgba(${color},0.12)`, border: `1px solid rgba(${color},0.3)`, color: `rgb(${color})` }}>
      {loading ? '⏳' : icon} {loading ? 'Exporting…' : label}
    </button>
  );
}

function StatusBreakdown({ students, year }) {
  const statusCounts = Object.entries(STATUS_COLORS).map(([status, color]) => ({
    status, color, count: students.filter(s => s.status === status).length,
  }));
  const total = students.length;
  return (
    <div className="rounded-xl p-6 space-y-4"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
        Student Status Breakdown — {year?.yearLabel}
      </h3>
      <div className="flex h-3 rounded-full overflow-hidden">
        {statusCounts.filter(s => s.count > 0).map(s => (
          <div key={s.status}
            style={{ width: `${total ? (s.count / total) * 100 : 0}%`, background: `rgb(${s.color})` }}
            title={`${s.status}: ${s.count}`} />
        ))}
      </div>
      <div className="grid grid-cols-5 gap-3">
        {statusCounts.map(s => (
          <div key={s.status}>
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ background: `rgb(${s.color})` }} />
              <span className="text-xs" style={{ color: 'var(--muted)' }}>{s.status}</span>
            </div>
            <p className="text-xl font-bold" style={{ color: `rgb(${s.color})` }}>{s.count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportRow({ title, desc, count, exportButtons }) {
  return (
    <div className="rounded-xl p-6 flex items-center justify-between gap-6"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex-1">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{title}</h3>
        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{desc}</p>
      </div>
      <p className="text-2xl font-bold shrink-0" style={{ color: 'var(--text)' }}>{count}</p>
      <div className="flex gap-2 shrink-0">{exportButtons}</div>
    </div>
  );
}

export default function ReportsPage() {
  const [students,  setStudents]  = useState([]);
  const [classes,   setClasses]   = useState([]);
  const [year,      setYear]      = useState(null);
  const [results,   setResults]   = useState([]);
  const [exporting, setExporting] = useState({});

  useEffect(() => {
    getCurrentYear().then(y => {
      setYear(y);
      Promise.all([getStudents(), getClasses(y.id), getYearEndResults(y.id)])
        .then(([s, c, r]) => { setStudents(s); setClasses(c); setResults(r); });
    });
  }, []);

  const run = async (key, fn) => {
    setExporting(p => ({ ...p, [key]: true }));
    try { await fn(); } catch (e) { alert('Export failed: ' + e.message); }
    finally { setExporting(p => ({ ...p, [key]: false })); }
  };

  const ex = (key, label, icon, color, fn) => (
    <ExportButton key={key} label={label} icon={icon} color={color}
      loading={!!exporting[key]} onClick={() => run(key, fn)} />
  );

  return (
    <div className="space-y-8 animate-fade">
      <PageHeader
        title="Reports"
        subtitle="Export data for the Department of Education and school board"
      >
        {ex('fullPdf',  'Full Report PDF',   '📄', '248,81,73', () => exportStudentsPDF(students, year))}
        {ex('fullXlsx', 'Full Report Excel', '📊', '46,160,67', () => exportFullXLSX(students, classes, results, year))}
      </PageHeader>

      <StatusBreakdown students={students} year={year} />

      <ReportRow title="Student Records"
        desc="All student details — enrolment type, grade level, province, boarding status and TFF registration."
        count={`${students.length} students`}
        exportButtons={[
          ex('stuPdf',  'PDF',   '📄', '248,81,73', () => exportStudentsPDF(students, year)),
          ex('stuXlsx', 'Excel', '📊', '46,160,67', () => exportStudentsXLSX(students, year)),
        ]} />

      <ReportRow title="Class Lists"
        desc="Individual class lists for each grade level, showing all assigned students."
        count={`${classes.length} classes`}
        exportButtons={[
          ex('clsPdf',  'PDF',   '📄', '248,81,73', () => exportClassListsPDF(classes, students, year)),
          ex('clsXlsx', 'Excel', '📊', '46,160,67', () => exportFullXLSX(students, classes, results, year)),
        ]} />
    </div>
  );
}
