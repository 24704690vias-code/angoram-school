package com.angoram.school.schoolclass.model;

import com.angoram.school.academic.model.AcademicYear;
import com.angoram.school.auth.model.AppUser;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "school_class")
public class SchoolClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Class code is required")
    @Size(max = 20, message = "Class code must not exceed 20 characters")
    @Column(name = "class_code", nullable = false)
    private String classCode;

    @NotNull(message = "Grade level is required")
    @Min(value = 9,  message = "Grade level must be at least 9")
    @Max(value = 12, message = "Grade level must not exceed 12")
    @Column(name = "grade_level", nullable = false)
    private Integer gradeLevel;

    @NotNull(message = "Academic year is required")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "academic_year_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private AcademicYear academicYear;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "class_teacher_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private AppUser classTeacher;

    @Min(value = 1,   message = "Max capacity must be at least 1")
    @Max(value = 200, message = "Max capacity must not exceed 200")
    @Column(name = "max_capacity", nullable = false)
    private Integer maxCapacity = 40;

    @Size(max = 80)
    private String stream;

    @Size(max = 255)
    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}