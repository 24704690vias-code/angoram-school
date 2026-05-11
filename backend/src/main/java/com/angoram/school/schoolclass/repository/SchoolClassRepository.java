package com.angoram.school.schoolclass.repository;

import com.angoram.school.schoolclass.model.SchoolClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface SchoolClassRepository extends JpaRepository<SchoolClass, Long> {

    @Query("SELECT c FROM SchoolClass c WHERE c.academicYear.id = :yearId ORDER BY c.gradeLevel, c.classCode")
    List<SchoolClass> findByAcademicYearId(@Param("yearId") Integer yearId);

    @Query("SELECT c FROM SchoolClass c WHERE c.gradeLevel = :grade AND c.academicYear.id = :yearId")
    List<SchoolClass> findByGradeLevelAndYear(@Param("grade") Integer grade, @Param("yearId") Integer yearId);
}