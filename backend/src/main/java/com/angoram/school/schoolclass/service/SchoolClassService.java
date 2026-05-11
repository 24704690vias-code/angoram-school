package com.angoram.school.schoolclass.service;

import com.angoram.school.schoolclass.model.SchoolClass;
import com.angoram.school.schoolclass.repository.SchoolClassRepository;
import com.angoram.school.academic.repository.AcademicYearRepository;
import com.angoram.school.student.model.Student;
import com.angoram.school.student.repository.StudentRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SchoolClassService {

    private final SchoolClassRepository repo;
    private final AcademicYearRepository yearRepo;
    private final StudentRepository      studentRepo;

    public SchoolClassService(SchoolClassRepository repo,
                        AcademicYearRepository yearRepo,
                        StudentRepository studentRepo) {
        this.repo        = repo;
        this.yearRepo    = yearRepo;
        this.studentRepo = studentRepo;
    }

    public List<SchoolClass> getCurrentYearClasses() {
        return yearRepo.findByIsCurrentTrue()
                .map(y -> repo.findByAcademicYearId(y.getId()))
                .orElse(List.of());
    }

    public List<SchoolClass> getByYear(Integer yearId) {
        return repo.findByAcademicYearId(yearId);
    }

    public SchoolClass getById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Class not found: " + id));
    }

    public SchoolClass save(SchoolClass c) {
        return repo.save(c);
    }

    public List<Student> getStudents(Long classId) {
        return studentRepo.findByClassId(classId);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}