package com.angoram.school.attendance.service;

import com.angoram.school.academic.model.AcademicYear;
import com.angoram.school.attendance.model.Attendance;
import com.angoram.school.academic.repository.AcademicYearRepository;
import com.angoram.school.attendance.repository.AttendanceRepository;
import com.angoram.school.schoolclass.repository.SchoolClassRepository;
import com.angoram.school.student.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
public class AttendanceService {

    private final AttendanceRepository   repo;
    private final StudentRepository      studentRepo;
    private final SchoolClassRepository  classRepo;
    private final AcademicYearRepository yearRepo;

    public AttendanceService(AttendanceRepository repo,
                             StudentRepository studentRepo,
                             SchoolClassRepository classRepo,
                             AcademicYearRepository yearRepo) {
        this.repo        = repo;
        this.studentRepo = studentRepo;
        this.classRepo   = classRepo;
        this.yearRepo    = yearRepo;
    }

    public List<Attendance> getByClassAndDate(Long classId, LocalDate date) {
        return repo.findByClassAndDate(classId, date);
    }

    public List<Attendance> getByStudent(Long studentId, Integer yearId) {
        return repo.findByStudentAndYear(studentId, yearId);
    }

    /**
     * True upsert — never deletes then inserts.
     * Finds existing record by student + date, updates status in place.
     * Creates a new record only if none exists.
     * This avoids the unique constraint violation on uq_attendance(student_id, attendance_date).
     */
    @Transactional
    public List<Attendance> saveBulk(List<Attendance> records, Integer yearId) {
        AcademicYear year = yearRepo.findById(yearId)
                .orElseThrow(() -> new RuntimeException("Academic year not found: " + yearId));

        for (Attendance incoming : records) {
            Long      studentId = incoming.getStudent().getId();
            LocalDate date      = incoming.getAttendanceDate();

            // Find existing record for this student on this date
            repo.findByClassAndDate(incoming.getSchoolClass().getId(), date)
                    .stream()
                    .filter(e -> e.getStudent().getId().equals(studentId))
                    .findFirst()
                    .ifPresentOrElse(
                            existing -> {
                                // UPDATE — just change the status and notes in place
                                existing.setStatus(incoming.getStatus());
                                existing.setNotes(incoming.getNotes());
                                repo.save(existing);
                            },
                            () -> {
                                // INSERT — no record exists yet for this student + date
                                if (incoming.getAcademicYear() == null) {
                                    incoming.setAcademicYear(year);
                                }
                                repo.save(incoming);
                            }
                    );
        }
        return records;
    }

    public record AttSummary(long present, long absent, long late, long excused, long total, double pct) {}

    public AttSummary getSummary(Long studentId, Integer yearId) {
        long present = repo.countPresent(studentId, yearId);
        long total   = repo.countTotal(studentId, yearId);
        List<Attendance> all = repo.findByStudentAndYear(studentId, yearId);
        long absent  = all.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.ABSENT).count();
        long late    = all.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.LATE).count();
        long excused = all.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.EXCUSED).count();
        double pct   = total > 0 ? Math.round((present * 100.0 / total) * 10) / 10.0 : 100.0;
        return new AttSummary(present, absent, late, excused, total, pct);
    }
}