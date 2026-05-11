package com.angoram.school.attendance.controller;

import com.angoram.school.attendance.model.Attendance;
import com.angoram.school.attendance.service.AttendanceService;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService service;

    public AttendanceController(AttendanceService service) {
        this.service = service;
    }

    @GetMapping
    public List<Attendance> getByClassAndDate(
            @RequestParam Long classId,
            @RequestParam String date) {
        return service.getByClassAndDate(classId, LocalDate.parse(date));
    }

    @GetMapping("/student/{id}")
    public List<Attendance> getByStudent(
            @PathVariable Long id,
            @RequestParam Integer yearId) {
        return service.getByStudent(id, yearId);
    }

    @GetMapping("/student/{id}/summary")
    public AttendanceService.AttSummary summary(
            @PathVariable Long id,
            @RequestParam Integer yearId) {
        return service.getSummary(id, yearId);
    }

    @PostMapping("/bulk")
    public List<Attendance> saveBulk(
            @RequestBody List<Attendance> records,
            @RequestParam Integer yearId) {
        return service.saveBulk(records, yearId);
    }
}
