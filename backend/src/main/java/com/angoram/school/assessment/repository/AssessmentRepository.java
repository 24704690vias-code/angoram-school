package com.angoram.school.assessment.repository;

import com.angoram.school.assessment.model.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface AssessmentRepository extends JpaRepository<Assessment, Long> {

    @Query("SELECT a FROM Assessment a WHERE a.schoolClass.id = :cid AND a.term.id = :tid ORDER BY a.student.lastname")
    List<Assessment> findByClassAndTerm(@Param("cid") Long cid, @Param("tid") Integer tid);

    @Query("SELECT a FROM Assessment a WHERE a.student.id = :sid AND a.academicYear.id = :yid")
    List<Assessment> findByStudentAndYear(@Param("sid") Long sid, @Param("yid") Integer yid);

    @Query("SELECT a FROM Assessment a WHERE a.student.id = :sid AND a.subject.id = :subid AND a.term.id = :tid AND a.assessmentType = :type")
    Optional<Assessment> findExisting(
        @Param("sid")   Long sid,
        @Param("subid") Long subid,
        @Param("tid")   Integer tid,
        @Param("type")  Assessment.AssessmentType type
    );
}
