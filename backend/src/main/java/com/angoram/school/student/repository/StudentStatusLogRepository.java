package com.angoram.school.student.repository;

import com.angoram.school.student.model.StudentStatusLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface StudentStatusLogRepository extends JpaRepository<StudentStatusLog, Long> {

    @Query("SELECT l FROM StudentStatusLog l WHERE l.student.id = :studentId ORDER BY l.createdAt DESC")
    List<StudentStatusLog> findByStudentId(@Param("studentId") Long studentId);
}
