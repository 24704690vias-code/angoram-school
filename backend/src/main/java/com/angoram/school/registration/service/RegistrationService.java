package com.angoram.school.registration.service;

import com.angoram.school.academic.model.AcademicYear;
import com.angoram.school.registration.model.AnnualRegistration;
import com.angoram.school.student.model.Student;
import com.angoram.school.academic.repository.AcademicYearRepository;
import com.angoram.school.registration.repository.AnnualRegistrationRepository;
import com.angoram.school.student.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class RegistrationService {

    private final AnnualRegistrationRepository repo;
    private final StudentRepository studentRepo;
    private final AcademicYearRepository yearRepo;

    public RegistrationService(AnnualRegistrationRepository repo,
                                StudentRepository studentRepo,
                                AcademicYearRepository yearRepo) {
        this.repo = repo;
        this.studentRepo = studentRepo;
        this.yearRepo = yearRepo;
    }

    public List<AnnualRegistration> getByYear(Integer yearId) {
        return repo.findByAcademicYearId(yearId);
    }

    @Transactional
    public AnnualRegistration register(Long studentId, Integer yearId, Long classId, String notes, Long userId) {
        repo.findByStudentAndYear(studentId, yearId).ifPresent(r -> {
            throw new RuntimeException("Student is already registered for this academic year.");
        });

        Student student = studentRepo.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));

        AcademicYear year = yearRepo.findById(yearId)
            .orElseThrow(() -> new RuntimeException("Academic year not found: " + yearId));

        AnnualRegistration reg = new AnnualRegistration();
        reg.setStudent(student);
        reg.setAcademicYear(year);
        reg.setGradeLevel(student.getCurrentGradeLevel() != null ? student.getCurrentGradeLevel() : 9);
        reg.setRegStatus(AnnualRegistration.RegStatus.CONFIRMED);
        reg.setNotes(notes);

        return repo.save(reg);
    }

    public AnnualRegistration update(Long id, AnnualRegistration data) {
        AnnualRegistration existing = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Registration not found: " + id));
        existing.setRegStatus(data.getRegStatus());
        existing.setNotes(data.getNotes());
        return repo.save(existing);
    }
}
