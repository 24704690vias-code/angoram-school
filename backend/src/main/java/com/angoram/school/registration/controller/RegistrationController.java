package com.angoram.school.registration.controller;

import com.angoram.school.registration.model.AnnualRegistration;
import com.angoram.school.registration.service.RegistrationService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    private final RegistrationService service;

    public RegistrationController(RegistrationService service) {
        this.service = service;
    }

    @GetMapping
    public List<AnnualRegistration> getAll(@RequestParam(required = false) Integer yearId) {
        return service.getByYear(yearId);
    }

    @PostMapping
    public AnnualRegistration register(@RequestBody Map<String, Object> body) {
        Long studentId    = Long.valueOf(body.get("studentId").toString());
        Integer yearId    = Integer.valueOf(body.get("yearId").toString());
        String notes      = body.containsKey("notes") ? body.get("notes").toString() : null;
        return service.register(studentId, yearId, null, notes, null);
    }

    @PutMapping("/{id}")
    public AnnualRegistration update(@PathVariable Long id, @RequestBody AnnualRegistration registration) {
        return service.update(id, registration);
    }
}
