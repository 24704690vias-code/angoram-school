package com.angoram.school.yearend.controller;

import com.angoram.school.yearend.model.YearEndResult;
import com.angoram.school.yearend.service.YearEndService;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/year-end")
public class YearEndController {

    private final YearEndService service;

    public YearEndController(YearEndService service) {
        this.service = service;
    }

    @GetMapping
    public List<YearEndResult> getByYear(@RequestParam Integer yearId) {
        return service.getByYear(yearId);
    }

    @PostMapping("/process")
    public YearEndResult process(@RequestBody Map<String, Object> body) {
        Long    studentId      = Long.valueOf(body.get("studentId").toString());
        Integer yearId         = Integer.valueOf(body.get("academicYearId").toString());
        YearEndResult.Outcome outcome = YearEndResult.Outcome.valueOf(body.get("outcome").toString());
        Integer nextGradeLevel = body.containsKey("nextGradeLevel") && body.get("nextGradeLevel") != null
                                    ? Integer.valueOf(body.get("nextGradeLevel").toString()) : null;
        BigDecimal finalAverage = body.containsKey("finalAverage") && body.get("finalAverage") != null
                                    ? new BigDecimal(body.get("finalAverage").toString()) : null;
        BigDecimal attendancePct = body.containsKey("attendancePct") && body.get("attendancePct") != null
                                    ? new BigDecimal(body.get("attendancePct").toString()) : null;
        String notes = body.containsKey("notes") ? body.get("notes").toString() : null;

        return service.process(studentId, yearId, outcome, nextGradeLevel, finalAverage, attendancePct, notes);
    }
}
