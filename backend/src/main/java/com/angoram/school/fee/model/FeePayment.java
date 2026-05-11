package com.angoram.school.fee.model;

import com.angoram.school.auth.model.AppUser;
import com.angoram.school.academic.model.AcademicYear;
import com.angoram.school.student.model.Student;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @Entity @Table(name="fee_payment")
public class FeePayment {

    public enum PaymentMethod { CASH, BANK_TRANSFER, ONLINE }

    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    // Exclude currentClass to prevent deep serialisation chain
    // Student → SchoolClass → AppUser (classTeacher) → password
    @ManyToOne(fetch=FetchType.EAGER)
    @JoinColumn(name="student_id", nullable=false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "currentClass"})
    private Student student;

    @ManyToOne(fetch=FetchType.EAGER)
    @JoinColumn(name="academic_year_id", nullable=false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private AcademicYear academicYear;

    @ManyToOne(fetch=FetchType.EAGER)
    @JoinColumn(name="levy_type_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private FeeLevyType levyType;

    @Column(name="amount_paid", nullable=false, precision=10, scale=2)
    private BigDecimal amountPaid;

    @Column(name="payment_date", nullable=false)
    private LocalDate paymentDate;

    @Enumerated(EnumType.STRING)
    @Column(name="payment_method", nullable=false)
    private PaymentMethod paymentMethod = PaymentMethod.CASH;

    @Column(name="reference_number") private String referenceNumber;
    @Column(name="receipt_number")   private String receiptNumber;
    private String notes;

    @Column(name="receipt_file_name") private String receiptFileName;
    @Column(name="receipt_file_path") private String receiptFilePath;
    @Column(name="receipt_file_type") private String receiptFileType;
    @Column(name="receipt_file_size") private Long receiptFileSize;

    // Exclude password from AppUser serialisation
    @ManyToOne(fetch=FetchType.EAGER)
    @JoinColumn(name="recorded_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private AppUser recordedBy;

    @Column(name="created_at", updatable=false)
    private LocalDateTime createdAt;

    @PrePersist protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (paymentDate == null) paymentDate = LocalDate.now();
    }
}