package com.angoram.school.student.controller;

import com.angoram.school.student.model.Student;
import com.angoram.school.student.model.StudentStatusLog;
import com.angoram.school.student.service.StudentService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService service;

    public StudentController(StudentService service) {
        this.service = service;
    }

    @GetMapping
    public List<Student> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Student get(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public Student create(@RequestBody Student student) {
        return service.create(student);
    }

    @PutMapping("/{id}")
    public Student update(@PathVariable Long id, @RequestBody Student student) {
        return service.update(id, student);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @PutMapping("/{id}/status")
    public Student updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String reason) {
        return service.updateStatus(id, Student.Status.valueOf(status), reason, null);
    }

    @PutMapping("/{id}/assign-class")
    public Student assignClass(@PathVariable Long id, @RequestParam Long classId) {
        return service.assignToClass(id, classId);
    }

    @GetMapping("/{id}/status-log")
    public List<StudentStatusLog> statusLog(@PathVariable Long id) {
        return service.getStatusLog(id);
    }
}
