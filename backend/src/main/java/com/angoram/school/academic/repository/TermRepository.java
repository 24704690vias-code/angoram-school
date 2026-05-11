package com.angoram.school.academic.repository;

import com.angoram.school.academic.model.Term;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TermRepository extends JpaRepository<Term, Integer> {

    @Query("SELECT t FROM Term t WHERE t.academicYear.id = :yearId ORDER BY t.termNumber")
    List<Term> findByAcademicYearId(@Param("yearId") Integer yearId);
}
