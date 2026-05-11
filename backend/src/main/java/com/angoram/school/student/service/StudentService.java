package com.angoram.school.student.service;

import com.angoram.school.student.model.Student;
import com.angoram.school.student.model.StudentStatusLog;
import com.angoram.school.student.repository.StudentRepository;
import com.angoram.school.student.repository.StudentStatusLogRepository;
import com.angoram.school.schoolclass.model.SchoolClass;
import com.angoram.school.schoolclass.repository.SchoolClassRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
public class StudentService {

    private final StudentRepository            repo;
    private final SchoolClassRepository        classRepo;
    private final StudentStatusLogRepository   logRepo;

    public StudentService(StudentRepository repo,
                          SchoolClassRepository classRepo,
                          StudentStatusLogRepository logRepo) {
        this.repo      = repo;
        this.classRepo = classRepo;
        this.logRepo   = logRepo;
    }

    public List<Student> getAll()   { return repo.findAll(); }

    public Student getById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found: " + id));
    }

    @Transactional
    public Student create(Student s) {
        if (s.getStudentNumber() == null || s.getStudentNumber().isBlank()) {
            s.setStudentNumber(generateNumber(s.getCurrentGradeLevel()));
        }
        return repo.save(s);
    }

    @Transactional
    public Student update(Long id, Student data) {
        Student existing = getById(id);
        existing.setFirstname(data.getFirstname());
        existing.setLastname(data.getLastname());
        existing.setDateOfBirth(data.getDateOfBirth());
        existing.setGender(data.getGender());
        existing.setContactPhone(data.getContactPhone());
        existing.setProvince(data.getProvince());
        existing.setDistrict(data.getDistrict());
        existing.setVillage(data.getVillage());
        existing.setGuardianName(data.getGuardianName());
        existing.setGuardianContact(data.getGuardianContact());
        existing.setGuardianRelationship(data.getGuardianRelationship());
        existing.setEnrolmentType(data.getEnrolmentType());
        existing.setGrade8Score(data.getGrade8Score());
        existing.setPreviousSchool(data.getPreviousSchool());
        existing.setTransferClearance(data.getTransferClearance());
        existing.setCurrentGradeLevel(data.getCurrentGradeLevel());
        existing.setIsBoarding(data.getIsBoarding());
        existing.setTffRegistered(data.getTffRegistered());
        return repo.save(existing);
    }

    @Transactional
    public Student updateStatus(Long id, Student.Status newStatus, String reason, Long recordedById) {
        Student s = getById(id);
        Student.Status oldStatus = s.getStatus();
        s.setStatus(newStatus);
        repo.save(s);
        StudentStatusLog log = new StudentStatusLog();
        log.setStudent(s);
        log.setOldStatus(oldStatus.name());
        log.setNewStatus(newStatus.name());
        log.setReason(reason);
        log.setEffectiveDate(LocalDate.now());
        logRepo.save(log);
        return s;
    }

    @Transactional
    public Student assignToClass(Long studentId, Long classId) {
        Student s = getById(studentId);
        SchoolClass sc = classRepo.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found: " + classId));
        // Exclude the student being assigned from the count —
        // they may already be in this class (reassignment) or moving from another
        long count = repo.countActiveByClassIdExcluding(classId, studentId);
        if (count >= sc.getMaxCapacity())
            throw new RuntimeException("Class is at full capacity (" + sc.getMaxCapacity() + ").");
        s.setCurrentClass(sc);
        s.setCurrentGradeLevel(sc.getGradeLevel());
        return repo.save(s);
    }

    public void delete(Long id) { repo.deleteById(id); }

    public List<StudentStatusLog> getStatusLog(Long id) {
        return logRepo.findByStudentId(id);
    }

    private String generateNumber(Integer grade) {
        long count = repo.count() + 1;
        return String.format("SS%d%04d", grade != null ? grade : 9, count);
    }
}