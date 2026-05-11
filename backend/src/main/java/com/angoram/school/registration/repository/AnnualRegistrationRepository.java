package com.angoram.school.registration.repository;

import com.angoram.school.registration.model.AnnualRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface AnnualRegistrationRepository extends JpaRepository<AnnualRegistration, Long> {

    @Query("SELECT r FROM AnnualRegistration r WHERE r.student.id = :sid AND r.academicYear.id = :yid")
    Optional<AnnualRegistration> findByStudentAndYear(@Param("sid") Long sid, @Param("yid") Integer yid);

    @Query("SELECT r FROM AnnualRegistration r WHERE r.academicYear.id = :yid")
    List<AnnualRegistration> findByAcademicYearId(@Param("yid") Integer yid);
}
