package com.angoram.school.fee.model;

import com.angoram.school.academic.model.AcademicYear;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "fee_levy_type")
public class FeeLevyType {

    public enum AppliesTo { ALL, BOARDING, NON_BOARDING }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "levy_name", nullable = false)
    private String levyName;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal amount;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "academic_year_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private AcademicYear academicYear;

    @Enumerated(EnumType.STRING)
    @Column(name = "applies_to", nullable = false)
    private AppliesTo appliesTo = AppliesTo.ALL;

    private String description;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
