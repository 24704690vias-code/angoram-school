package com.angoram.school.attendance.repository;

import com.angoram.school.attendance.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    @Query("SELECT a FROM Attendance a WHERE a.schoolClass.id = :cid AND a.attendanceDate = :date")
    List<Attendance> findByClassAndDate(@Param("cid") Long cid, @Param("date") LocalDate date);

    @Query("SELECT a FROM Attendance a WHERE a.student.id = :sid AND a.academicYear.id = :yid ORDER BY a.attendanceDate")
    List<Attendance> findByStudentAndYear(@Param("sid") Long sid, @Param("yid") Integer yid);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :sid AND a.academicYear.id = :yid AND a.status = 'PRESENT'")
    long countPresent(@Param("sid") Long sid, @Param("yid") Integer yid);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :sid AND a.academicYear.id = :yid")
    long countTotal(@Param("sid") Long sid, @Param("yid") Integer yid);
}
