package com.angoram.school.yearend.repository;

import com.angoram.school.yearend.model.YearEndResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface YearEndResultRepository extends JpaRepository<YearEndResult, Long> {

    @Query("SELECT r FROM YearEndResult r WHERE r.academicYear.id = :yid")
    List<YearEndResult> findByAcademicYearId(@Param("yid") Integer yid);

    @Query("SELECT r FROM YearEndResult r WHERE r.student.id = :sid AND r.academicYear.id = :yid")
    Optional<YearEndResult> findByStudentAndYear(@Param("sid") Long sid, @Param("yid") Integer yid);
}
