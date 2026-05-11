package com.angoram.school.yearend.model;

import com.angoram.school.academic.model.AcademicYear;
import com.angoram.school.auth.model.AppUser;
import com.angoram.school.schoolclass.model.SchoolClass;
import com.angoram.school.student.model.Student;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "year_end_result")
public class YearEndResult {

    public enum Outcome { PROMOTED, REPEAT, GRADUATED, WITHDRAWN, EXPELLED, SELECTED_GRADE11 }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Student student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "academic_year_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private AcademicYear academicYear;

    @Column(name = "grade_level", nullable = false)
    private Integer gradeLevel;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "class_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private SchoolClass schoolClass;

    @Column(name = "final_average", precision = 5, scale = 2)
    private BigDecimal finalAverage;

    @Column(name = "class_rank")
    private Integer classRank;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Outcome outcome;

    @Column(name = "next_grade_level")
    private Integer nextGradeLevel;

    @Column(name = "is_exam_eligible", nullable = false)
    private Boolean isExamEligible = true;

    @Column(name = "attendance_pct", precision = 5, scale = 2)
    private BigDecimal attendancePct;

    private String notes;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "processed_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private AppUser processedBy;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
