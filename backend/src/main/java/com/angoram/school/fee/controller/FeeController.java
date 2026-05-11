package com.angoram.school.fee.controller;

import com.angoram.school.fee.model.FeePayment;
import com.angoram.school.fee.model.FeeLevyType;
import com.angoram.school.fee.service.FeeService;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/fees")
public class FeeController {

    private final FeeService service;

    public FeeController(FeeService service) {
        this.service = service;
    }

    /** All fee payment records — used by FeesProvider on mount */
    @GetMapping
    public List<FeePayment> getAll() {
        return service.getAll();
    }

    /** Levy types for an academic year */
    @GetMapping("/levies")
    public List<FeeLevyType> levies(@RequestParam(required = false) Integer yearId) {
        return service.getLevies(yearId);
    }

    /** Payments for one student */
    @GetMapping("/student/{id}")
    public List<FeePayment> byStudent(@PathVariable Long id) {
        return service.getByStudent(id);
    }

    /** Payment summary for a student */
    @GetMapping("/student/{id}/summary")
    public FeeService.FeeSummary summary(
            @PathVariable Long id,
            @RequestParam(required = false) Integer yearId) {
        return service.getSummary(id, yearId);
    }

    /** Record a new payment (with optional receipt file upload) */
    @PostMapping(value = "/record", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_FORM_URLENCODED_VALUE })
    public FeePayment record(
            @RequestParam Long studentId,
            @RequestParam(required = false) Integer yearId,
            @RequestParam(required = false) Integer levyTypeId,
            @RequestParam BigDecimal amountPaid,
            @RequestParam String paymentMethod,
            @RequestParam(required = false) String referenceNumber,
            @RequestParam(required = false) String receiptNumber,
            @RequestParam(required = false) String notes,
            @RequestParam(required = false) MultipartFile receiptFile) {
        return service.record(
                studentId, yearId, levyTypeId, amountPaid,
                FeePayment.PaymentMethod.valueOf(paymentMethod),
                referenceNumber, receiptNumber, notes, receiptFile
        );
    }

    /** Stream a receipt file inline */
    @GetMapping("/{id}/receipt")
    public ResponseEntity<Resource> receipt(@PathVariable Long id) {
        FeePayment payment  = service.getById(id);
        Resource   resource = service.loadReceipt(id);
        String contentType  = payment.getReceiptFileType() != null
                ? payment.getReceiptFileType()
                : "application/octet-stream";
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + payment.getReceiptFileName() + "\"")
                .body(resource);
    }

    /** Delete a payment record */
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}