package com.angoram.school.reports.controller;

import com.angoram.school.academic.repository.AcademicYearRepository;
import com.angoram.school.assessment.repository.AssessmentRepository;
import com.angoram.school.attendance.repository.AttendanceRepository;
import com.angoram.school.fee.repository.FeePaymentRepository;
import com.angoram.school.student.repository.StudentRepository;
import com.angoram.school.yearend.repository.YearEndResultRepository;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * ReportController
 * Provides aggregated summary data for the Reports dashboard.
 * All endpoints use GROUP BY queries from their respective repositories.
 */
@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final StudentRepository     studentRepo;
    private final FeePaymentRepository  feeRepo;
    private final AttendanceRepository  attRepo;
    private final AssessmentRepository  assessRepo;
    private final AcademicYearRepository yearRepo;
    private final YearEndResultRepository yearEndRepo;

    public ReportController(
            StudentRepository studentRepo,
            FeePaymentRepository feeRepo,
            AttendanceRepository attRepo,
            AssessmentRepository assessRepo,
            AcademicYearRepository yearRepo,
            YearEndResultRepository yearEndRepo) {
        this.studentRepo  = studentRepo;
        this.feeRepo      = feeRepo;
        this.attRepo      = attRepo;
        this.assessRepo   = assessRepo;
        this.yearRepo     = yearRepo;
        this.yearEndRepo  = yearEndRepo;
    }

    /**
     * GET /api/reports/summary
     * Top-level dashboard summary — total students, breakdown by status/grade/enrolment.
     */
    @GetMapping("/summary")
    public Map<String, Object> summary() {
        Map<String, Object> report = new LinkedHashMap<>();

        // Total students
        report.put("totalStudents", studentRepo.count());

        // Count by status (GROUP BY)
        Map<String, Long> byStatus = studentRepo.countByStatus().stream()
            .collect(Collectors.toMap(
                row -> row[0].toString(),
                row -> ((Number) row[1]).longValue()
            ));
        report.put("byStatus", byStatus);

        // Count active students by grade (GROUP BY)
        Map<Integer, Long> byGrade = studentRepo.countActiveByGrade().stream()
            .collect(Collectors.toMap(
                row -> ((Number) row[0]).intValue(),
                row -> ((Number) row[1]).longValue()
            ));
        report.put("byGrade", byGrade);

        // Count by enrolment type (GROUP BY)
        Map<String, Long> byEnrolment = studentRepo.countByEnrolmentType().stream()
            .collect(Collectors.toMap(
                row -> row[0].toString(),
                row -> ((Number) row[1]).longValue()
            ));
        report.put("byEnrolment", byEnrolment);

        // Province distribution (GROUP BY)
        List<Map<String, Object>> provinces = studentRepo.countByProvince().stream()
            .map(row -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("province", row[0].toString());
                m.put("count", ((Number) row[1]).longValue());
                return m;
            }).collect(Collectors.toList());
        report.put("byProvince", provinces);

        return report;
    }

    /**
     * GET /api/reports/fees/{yearId}
     * Fee collection summary for an academic year — totals by method and levy type.
     */
    @GetMapping("/fees/{yearId}")
    public Map<String, Object> feeSummary(@PathVariable Integer yearId) {
        Map<String, Object> report = new LinkedHashMap<>();

        report.put("totalCollected", feeRepo.getTotalCollectedForYear(yearId));
        report.put("studentsWithPayments", feeRepo.countStudentsWithPayments(yearId));

        // By payment method (GROUP BY)
        List<Map<String, Object>> byMethod = feeRepo.summaryByMethod(yearId).stream()
            .map(row -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("method", row[0].toString());
                m.put("count",  ((Number) row[1]).longValue());
                m.put("total",  row[2]);
                return m;
            }).collect(Collectors.toList());
        report.put("byMethod", byMethod);

        // By levy type (GROUP BY)
        List<Map<String, Object>> byLevy = feeRepo.summaryByLevyType(yearId).stream()
            .map(row -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("levyName", row[0].toString());
                m.put("count",    ((Number) row[1]).longValue());
                m.put("total",    row[2]);
                return m;
            }).collect(Collectors.toList());
        report.put("byLevyType", byLevy);

        // Monthly totals (GROUP BY)
        List<Map<String, Object>> monthly = feeRepo.monthlyCollection(yearId).stream()
            .map(row -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("month",  ((Number) row[0]).intValue());
                m.put("year",   ((Number) row[1]).intValue());
                m.put("count",  ((Number) row[2]).longValue());
                m.put("total",  row[3]);
                return m;
            }).collect(Collectors.toList());
        report.put("monthlyCollection", monthly);

        return report;
    }

    /**
     * GET /api/reports/yearend/{yearId}
     * Year-end outcome summary for an academic year.
     */
    @GetMapping("/yearend/{yearId}")
    public Map<String, Object> yearEndSummary(@PathVariable Integer yearId) {
        Map<String, Object> report = new LinkedHashMap<>();
        var results = yearEndRepo.findByAcademicYearId(yearId);

        report.put("totalProcessed", results.size());

        Map<String, Long> byOutcome = results.stream()
            .collect(Collectors.groupingBy(r -> r.getOutcome().name(), Collectors.counting()));
        report.put("byOutcome", byOutcome);

        Map<Integer, Long> byGrade = results.stream()
            .collect(Collectors.groupingBy(r -> r.getGradeLevel(), Collectors.counting()));
        report.put("byGrade", byGrade);

        OptionalDouble avgScore = results.stream()
            .filter(r -> r.getFinalAverage() != null)
            .mapToDouble(r -> r.getFinalAverage().doubleValue())
            .average();
        report.put("averageFinalScore", avgScore.isPresent() ? Math.round(avgScore.getAsDouble() * 100) / 100.0 : null);

        return report;
    }
}
