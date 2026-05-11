package com.angoram.school.attendance.model;

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

@Getter @Setter @Entity @Table(name="attendance")
public class Attendance {

    public enum AttendanceStatus { PRESENT, ABSENT, LATE, EXCUSED }

    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Student is required")
    @ManyToOne(fetch=FetchType.EAGER)
    @JoinColumn(name="student_id", nullable=false)
    @JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
    private Student student;

    @NotNull(message = "Class is required")
    @ManyToOne(fetch=FetchType.EAGER)
    @JoinColumn(name="class_id", nullable=false)
    @JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
    private SchoolClass schoolClass;

    @NotNull(message = "Academic year is required")
    @ManyToOne(fetch=FetchType.EAGER)
    @JoinColumn(name="academic_year_id", nullable=false)
    @JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
    private AcademicYear academicYear;

    @NotNull(message = "Attendance date is required")
    @Column(name="attendance_date", nullable=false)
    private LocalDate attendanceDate;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private AttendanceStatus status = AttendanceStatus.PRESENT;

    @Size(max = 255)
    private String notes;

    @ManyToOne(fetch=FetchType.EAGER)
    @JoinColumn(name="recorded_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
    private AppUser recordedBy;

    @Column(name="created_at", updatable=false)
    private LocalDateTime createdAt;

    @PrePersist protected void onCreate(){ createdAt=LocalDateTime.now(); }
}