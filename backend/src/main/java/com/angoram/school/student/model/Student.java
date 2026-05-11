package com.angoram.school.student.model;

import com.angoram.school.schoolclass.model.SchoolClass;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @Entity @Table(name="student")
public class Student {
    public enum Status        { ACTIVE, SUSPENDED, WITHDRAWN, EXPELLED, GRADUATED }
    public enum EnrolmentType { NEW_INTAKE, TRANSFER, CONTINUING }
    public enum Gender        { MALE, FEMALE, OTHER }

    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(name="student_number", nullable=false, unique=true)
    private String studentNumber;

    @NotBlank(message = "First name is required")
    @Size(max = 80, message = "First name must not exceed 80 characters")
    @Column(nullable=false)
    private String firstname;

    @NotBlank(message = "Last name is required")
    @Size(max = 80, message = "Last name must not exceed 80 characters")
    @Column(nullable=false)
    private String lastname;

    @Column(name="date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Size(max = 20)
    @Column(name="contact_phone")
    private String contactPhone;

    @Size(max = 100) private String province;
    @Size(max = 100) private String district;
    @Size(max = 100) private String village;

    @Size(max = 160)
    @Column(name="guardian_name")         private String guardianName;
    @Size(max = 20)
    @Column(name="guardian_contact")      private String guardianContact;
    @Size(max = 80)
    @Column(name="guardian_relationship") private String guardianRelationship;

    @NotNull(message = "Enrolment type is required")
    @Enumerated(EnumType.STRING)
    @Column(name="enrolment_type", nullable=false)
    private EnrolmentType enrolmentType = EnrolmentType.NEW_INTAKE;

    @DecimalMin(value = "0.0",   message = "Grade 8 score cannot be negative")
    @DecimalMax(value = "100.0", message = "Grade 8 score cannot exceed 100")
    @Column(name="grade8_score", precision=6, scale=2)
    private BigDecimal grade8Score;

    @Size(max = 160)
    @Column(name="previous_school")  private String previousSchool;
    @Column(name="transfer_clearance") private Boolean transferClearance = false;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private Status status = Status.ACTIVE;

    @Min(value = 9,  message = "Grade level must be at least 9")
    @Max(value = 12, message = "Grade level must not exceed 12")
    @Column(name="current_grade_level")
    private Integer currentGradeLevel;

    @ManyToOne(fetch=FetchType.EAGER)
    @JoinColumn(name="current_class_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler",
            "classTeacher", "academicYear", "stream", "notes",
            "createdAt", "updatedAt", "maxCapacity"})
    private SchoolClass currentClass;

    @Column(name="is_boarding",   nullable=false) private Boolean isBoarding    = false;
    @Column(name="tff_registered",nullable=false) private Boolean tffRegistered = true;
    @Column(name="times_repeated",nullable=false) private Integer timesRepeated = 0;

    @Column(name="created_at", updatable=false) private LocalDateTime createdAt;
    @Column(name="updated_at")                  private LocalDateTime updatedAt;

    @PrePersist protected void onCreate() { createdAt=LocalDateTime.now(); updatedAt=LocalDateTime.now(); }
    @PreUpdate  protected void onUpdate() { updatedAt=LocalDateTime.now(); }
}