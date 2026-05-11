package com.angoram.school.academic.repository;

import com.angoram.school.academic.model.AcademicYear;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AcademicYearRepository extends JpaRepository<AcademicYear, Integer> {
    Optional<AcademicYear> findByIsCurrentTrue();
    Optional<AcademicYear> findByYearLabel(Integer year);
}
