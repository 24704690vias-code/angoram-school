package com.angoram.school.registration.model;

import com.angoram.school.academic.model.AcademicYear;
import com.angoram.school.auth.model.AppUser;
import com.angoram.school.schoolclass.model.SchoolClass;
import com.angoram.school.student.model.Student;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @Entity @Table(name="annual_registration")
public class AnnualRegistration {

    public enum RegStatus { PENDING, CONFIRMED, WITHDRAWN }

    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Student is required")
    @ManyToOne(fetch=FetchType.EAGER)
    @JoinColumn(name="student_id", nullable=false)
    @JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
    private Student student;

    @NotNull(message = "Academic year is required")
    @ManyToOne(fetch=FetchType.EAGER)
    @JoinColumn(name="academic_year_id", nullable=false)
    @JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
    private AcademicYear academicYear;

    @ManyToOne(fetch=FetchType.EAGER)
    @JoinColumn(name="class_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
    private SchoolClass schoolClass;

    @NotNull(message = "Grade level is required")
    @Min(value = 9,  message = "Grade level must be at least 9")
    @Max(value = 12, message = "Grade level must not exceed 12")
    @Column(name="grade_level", nullable=false)
    private Integer gradeLevel;

    @Enumerated(EnumType.STRING)
    @Column(name="reg_status", nullable=false)
    private RegStatus regStatus = RegStatus.PENDING;

    @Column(name="reg_date")
    private LocalDate regDate;

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;

    @ManyToOne(fetch=FetchType.EAGER)
    @JoinColumn(name="registered_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
    private AppUser registeredBy;

    @Column(name="created_at", updatable=false) private LocalDateTime createdAt;
    @Column(name="updated_at") private LocalDateTime updatedAt;

    @PrePersist protected void onCreate(){
        createdAt=LocalDateTime.now(); updatedAt=LocalDateTime.now();
        if (regDate==null) regDate=LocalDate.now();
    }
    @PreUpdate protected void onUpdate(){ updatedAt=LocalDateTime.now(); }
}