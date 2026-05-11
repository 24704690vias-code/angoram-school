package com.angoram.school.assessment.controller;

import com.angoram.school.assessment.model.Assessment;
import com.angoram.school.assessment.service.AssessmentService;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {

    private final AssessmentService service;

    public AssessmentController(AssessmentService service) {
        this.service = service;
    }

    @GetMapping
    public List<Assessment> getByClassAndTerm(
            @RequestParam Long classId,
            @RequestParam Integer termId) {
        return service.getByClassAndTerm(classId, termId);
    }

    @GetMapping("/student/{id}")
    public List<Assessment> getByStudent(
            @PathVariable Long id,
            @RequestParam Integer yearId) {
        return service.getByStudent(id, yearId);
    }

    @GetMapping("/rankings")
    public List<Map<String, Object>> rankings(
            @RequestParam Long classId,
            @RequestParam Integer termId) {
        return service.getRankings(classId, termId);
    }

    @PostMapping
    public Assessment save(@RequestBody Map<String, Object> body) {
        Long    studentId    = Long.valueOf(body.get("studentId").toString());
        Long    subjectId    = Long.valueOf(body.get("subjectId").toString());
        Integer termId       = Integer.valueOf(body.get("termId").toString());
        Integer yearId       = Integer.valueOf(body.get("academicYearId").toString());
        Long    classId      = body.containsKey("classId") && body.get("classId") != null
                                ? Long.valueOf(body.get("classId").toString()) : null;
        Assessment.AssessmentType type = Assessment.AssessmentType.valueOf(
            body.getOrDefault("assessmentType", "CONTINUOUS").toString());
        BigDecimal score    = body.get("score")    != null ? new BigDecimal(body.get("score").toString())    : null;
        BigDecimal maxScore = body.containsKey("maxScore") && body.get("maxScore") != null
                                ? new BigDecimal(body.get("maxScore").toString()) : BigDecimal.valueOf(100);
        String notes = body.containsKey("notes") ? body.get("notes").toString() : null;

        return service.save(studentId, subjectId, termId, yearId, classId, type, score, maxScore, notes);
    }
}
