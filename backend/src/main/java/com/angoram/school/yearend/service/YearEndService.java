package com.angoram.school.yearend.service;

import com.angoram.school.academic.model.AcademicYear;
import com.angoram.school.academic.repository.AcademicYearRepository;
import com.angoram.school.schoolclass.model.SchoolClass;
import com.angoram.school.schoolclass.repository.SchoolClassRepository;
import com.angoram.school.student.model.Student;
import com.angoram.school.student.repository.StudentRepository;
import com.angoram.school.yearend.model.YearEndResult;
import com.angoram.school.yearend.repository.YearEndResultRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class YearEndService {

    private final YearEndResultRepository repo;
    private final StudentRepository       studentRepo;
    private final AcademicYearRepository  yearRepo;
    private final SchoolClassRepository   classRepo;

    public YearEndService(YearEndResultRepository repo,
                          StudentRepository studentRepo,
                          AcademicYearRepository yearRepo,
                          SchoolClassRepository classRepo) {
        this.repo        = repo;
        this.studentRepo = studentRepo;
        this.yearRepo    = yearRepo;
        this.classRepo   = classRepo;
    }

    public List<YearEndResult> getByYear(Integer yearId) {
        return repo.findByAcademicYearId(yearId);
    }

    @Transactional
    public YearEndResult process(Long studentId, Integer yearId, YearEndResult.Outcome outcome,
                                 Integer nextGradeLevel, BigDecimal finalAverage,
                                 BigDecimal attendancePct, String notes) {

        Student student = studentRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));

        AcademicYear year = yearRepo.findById(yearId)
                .orElseThrow(() -> new RuntimeException("Academic year not found: " + yearId));

        YearEndResult result = repo.findByStudentAndYear(studentId, yearId)
                .orElseGet(YearEndResult::new);

        result.setStudent(student);
        result.setAcademicYear(year);
        result.setGradeLevel(student.getCurrentGradeLevel());
        result.setSchoolClass(student.getCurrentClass());
        result.setOutcome(outcome);
        result.setNextGradeLevel(nextGradeLevel);
        result.setFinalAverage(finalAverage);
        result.setAttendancePct(attendancePct);
        result.setNotes(notes);
        result.setProcessedAt(LocalDateTime.now());

        YearEndResult saved = repo.save(result);

        switch (outcome) {
            case GRADUATED         -> student.setStatus(Student.Status.GRADUATED);
            case EXPELLED          -> student.setStatus(Student.Status.EXPELLED);
            case WITHDRAWN         -> student.setStatus(Student.Status.WITHDRAWN);
            case PROMOTED,
                 SELECTED_GRADE11  -> student.setCurrentGradeLevel(nextGradeLevel);
            case REPEAT            -> student.setTimesRepeated(student.getTimesRepeated() + 1);
        }
        studentRepo.save(student);

        return saved;
    }
}