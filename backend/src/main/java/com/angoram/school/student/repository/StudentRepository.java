package com.angoram.school.student.repository;

import com.angoram.school.student.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByStudentNumber(String studentNumber);

    // Basic filters
    @Query("SELECT s FROM Student s WHERE s.status = :status")
    List<Student> findByStatus(@Param("status") Student.Status status);

    @Query("SELECT s FROM Student s WHERE s.currentGradeLevel = :grade")
    List<Student> findByGradeLevel(@Param("grade") Integer grade);

    @Query("SELECT s FROM Student s WHERE s.currentClass.id = :classId")
    List<Student> findByClassId(@Param("classId") Long classId);

    @Query("SELECT COUNT(s) FROM Student s WHERE s.currentClass.id = :classId AND s.status = 'ACTIVE'")
    long countActiveByClassId(@Param("classId") Long classId);

    /** Count active students in a class excluding a specific student (used during class assignment) */
    @Query("SELECT COUNT(s) FROM Student s WHERE s.currentClass.id = :classId AND s.status = 'ACTIVE' AND s.id != :excludeId")
    long countActiveByClassIdExcluding(@Param("classId") Long classId, @Param("excludeId") Long excludeId);

    // ── Aggregate / report queries (CP1 - GROUP BY, SELECT, JOIN) ──

    /** Count of students grouped by status */
    @Query("SELECT s.status, COUNT(s) FROM Student s GROUP BY s.status")
    List<Object[]> countByStatus();

    /** Count of active students grouped by grade level */
    @Query("SELECT s.currentGradeLevel, COUNT(s) FROM Student s WHERE s.status = 'ACTIVE' GROUP BY s.currentGradeLevel ORDER BY s.currentGradeLevel")
    List<Object[]> countActiveByGrade();

    /** Count of students grouped by province */
    @Query("SELECT COALESCE(s.province,'Unknown'), COUNT(s) FROM Student s GROUP BY s.province ORDER BY COUNT(s) DESC")
    List<Object[]> countByProvince();

    /** Count of students grouped by enrolment type */
    @Query("SELECT s.enrolmentType, COUNT(s) FROM Student s GROUP BY s.enrolmentType")
    List<Object[]> countByEnrolmentType();

    /** Count of boarding vs non-boarding active students */
    @Query("SELECT s.isBoarding, COUNT(s) FROM Student s WHERE s.status = 'ACTIVE' GROUP BY s.isBoarding")
    List<Object[]> countByBoarding();
}