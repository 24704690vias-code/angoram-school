package com.angoram.school.fee.repository;

import com.angoram.school.fee.model.FeeLevyType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface FeeLevyTypeRepository extends JpaRepository<FeeLevyType, Integer> {

    @Query("SELECT f FROM FeeLevyType f WHERE f.academicYear.id = :yearId")
    List<FeeLevyType> findByAcademicYearId(@Param("yearId") Integer yearId);
}
