package com.angoram.school.schoolclass.controller;

import com.angoram.school.schoolclass.model.SchoolClass;
import com.angoram.school.schoolclass.service.SchoolClassService;
import com.angoram.school.student.model.Student;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/classes")
public class SchoolClassController {

    private final SchoolClassService service;

    public SchoolClassController(SchoolClassService service) {
        this.service = service;
    }

    @GetMapping
    public List<SchoolClass> getAll(@RequestParam(required = false) Integer yearId) {
        return yearId != null ? service.getByYear(yearId) : service.getCurrentYearClasses();
    }

    @GetMapping("/{id}")
    public SchoolClass get(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public SchoolClass create(@Valid @RequestBody SchoolClass schoolClass) {
        return service.save(schoolClass);
    }

    @PutMapping("/{id}")
    public SchoolClass update(@PathVariable Long id, @Valid @RequestBody SchoolClass schoolClass) {
        schoolClass.setId(id);
        return service.save(schoolClass);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @GetMapping("/{id}/students")
    public List<Student> students(@PathVariable Long id) {
        return service.getStudents(id);
    }
}