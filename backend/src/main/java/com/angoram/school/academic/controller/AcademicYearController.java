package com.angoram.school.academic.controller;

import com.angoram.school.academic.model.AcademicYear;
import com.angoram.school.academic.model.Term;
import com.angoram.school.academic.service.AcademicYearService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/academic-years")
public class AcademicYearController {

    private final AcademicYearService service;

    public AcademicYearController(AcademicYearService service) {
        this.service = service;
    }

    @GetMapping
    public List<AcademicYear> getAll() {
        return service.getAll();
    }

    @GetMapping("/current")
    public AcademicYear current() {
        return service.getCurrent();
    }

    @GetMapping("/{id}/terms")
    public List<Term> terms(@PathVariable Integer id) {
        return service.getTerms(id);
    }
}
