package com.angoram.school.subject.controller;

import com.angoram.school.subject.model.Subject;
import com.angoram.school.subject.service.SubjectService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private final SubjectService service;

    public SubjectController(SubjectService service) {
        this.service = service;
    }

    @GetMapping
    public List<Subject> getAll() {
        return service.getAll();
    }

    @PostMapping
    public Subject create(@RequestBody Subject subject) {
        return service.save(subject);
    }

    @PutMapping("/{id}")
    public Subject update(@PathVariable Long id, @RequestBody Subject subject) {
        return service.update(id, subject);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
