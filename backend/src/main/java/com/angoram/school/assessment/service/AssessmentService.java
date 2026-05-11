package com.angoram.school.assessment.service;

import com.angoram.school.academic.model.AcademicYear;
import com.angoram.school.academic.model.Term;
import com.angoram.school.academic.repository.AcademicYearRepository;
import com.angoram.school.academic.repository.TermRepository;
import com.angoram.school.assessment.model.Assessment;
import com.angoram.school.assessment.repository.AssessmentRepository;
import com.angoram.school.schoolclass.model.SchoolClass;
import com.angoram.school.schoolclass.repository.SchoolClassRepository;
import com.angoram.school.student.model.Student;
import com.angoram.school.student.repository.StudentRepository;
import com.angoram.school.subject.model.Subject;
import com.angoram.school.subject.repository.SubjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AssessmentService {

    private final AssessmentRepository   repo;
    private final StudentRepository      studentRepo;
    private final SubjectRepository      subjectRepo;
    private final TermRepository         termRepo;
    private final AcademicYearRepository yearRepo;
    private final SchoolClassRepository  classRepo;

    public AssessmentService(AssessmentRepository repo,
                             StudentRepository studentRepo,
                             SubjectRepository subjectRepo,
                             TermRepository termRepo,
                             AcademicYearRepository yearRepo,
                             SchoolClassRepository classRepo) {
        this.repo        = repo;
        this.studentRepo = studentRepo;
        this.subjectRepo = subjectRepo;
        this.termRepo    = termRepo;
        this.yearRepo    = yearRepo;
        this.classRepo   = classRepo;
    }

    public List<Assessment> getByClassAndTerm(Long classId, Integer termId) {
        return repo.findByClassAndTerm(classId, termId);
    }

    public List<Assessment> getByStudent(Long studentId, Integer yearId) {
        return repo.findByStudentAndYear(studentId, yearId);
    }

    @Transactional
    public Assessment save(Long studentId, Long subjectId, Integer termId, Integer yearId,
                           Long classId, Assessment.AssessmentType type,
                           BigDecimal score, BigDecimal maxScore, String notes) {

        Assessment assessment = repo.findExisting(studentId, subjectId, termId, type)
                .orElseGet(Assessment::new);

        Student student = studentRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));
        Subject subject = subjectRepo.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found: " + subjectId));
        Term term = termRepo.findById(termId)
                .orElseThrow(() -> new RuntimeException("Term not found: " + termId));
        AcademicYear year = yearRepo.findById(yearId)
                .orElseThrow(() -> new RuntimeException("Academic year not found: " + yearId));

        assessment.setStudent(student);
        assessment.setSubject(subject);
        assessment.setTerm(term);
        assessment.setAcademicYear(year);
        assessment.setAssessmentType(type);
        assessment.setScore(score);
        assessment.setMaxScore(maxScore != null ? maxScore : BigDecimal.valueOf(100));
        assessment.setNotes(notes);
        assessment.setGradeLetter(calcGrade(score, maxScore));

        if (classId != null) {
            classRepo.findById(classId).ifPresent(assessment::setSchoolClass);
        }

        return repo.save(assessment);
    }

    public List<Map<String, Object>> getRankings(Long classId, Integer termId) {
        List<Assessment> all = repo.findByClassAndTerm(classId, termId);

        Map<Long, List<BigDecimal>> byStudent = all.stream()
                .filter(a -> a.getScore() != null)
                .collect(Collectors.groupingBy(
                        a -> a.getStudent().getId(),
                        Collectors.mapping(Assessment::getScore, Collectors.toList())
                ));

        List<Map<String, Object>> result = byStudent.entrySet().stream().map(entry -> {
                    BigDecimal avg = entry.getValue().stream()
                            .reduce(BigDecimal.ZERO, BigDecimal::add)
                            .divide(BigDecimal.valueOf(entry.getValue().size()), 2, RoundingMode.HALF_UP);

                    Assessment first = all.stream()
                            .filter(a -> a.getStudent().getId().equals(entry.getKey()))
                            .findFirst().orElseThrow();

                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("studentId",   entry.getKey());
                    row.put("studentName", first.getStudent().getFirstname() + " " + first.getStudent().getLastname());
                    row.put("average",     avg);
                    row.put("grade",       calcGrade(avg, BigDecimal.valueOf(100)));
                    return row;
                })
                .sorted((a, b) -> ((BigDecimal) b.get("average")).compareTo((BigDecimal) a.get("average")))
                .collect(Collectors.toList());

        for (int i = 0; i < result.size(); i++) result.get(i).put("rank", i + 1);
        return result;
    }

    private String calcGrade(BigDecimal score, BigDecimal max) {
        if (score == null || max == null) return null;
        double pct = score.doubleValue() / max.doubleValue() * 100;
        if (pct >= 90) return "A+";
        if (pct >= 80) return "A";
        if (pct >= 70) return "B";
        if (pct >= 60) return "C";
        if (pct >= 50) return "D";
        return "F";
    }
}