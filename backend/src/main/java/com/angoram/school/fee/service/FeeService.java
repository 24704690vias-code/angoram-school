package com.angoram.school.fee.service;

import com.angoram.school.academic.model.AcademicYear;
import com.angoram.school.academic.repository.AcademicYearRepository;
import com.angoram.school.fee.model.FeePayment;
import com.angoram.school.fee.model.FeeLevyType;
import com.angoram.school.fee.repository.FeePaymentRepository;
import com.angoram.school.fee.repository.FeeLevyTypeRepository;
import com.angoram.school.student.model.Student;
import com.angoram.school.student.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
public class FeeService {

    private final FeePaymentRepository  payRepo;
    private final FeeLevyTypeRepository levyRepo;
    private final StudentRepository     studentRepo;
    private final AcademicYearRepository yearRepo;

    @Value("${file.upload-dir:uploads/receipts}")
    private String uploadDir;

    public FeeService(FeePaymentRepository payRepo,
                      FeeLevyTypeRepository levyRepo,
                      StudentRepository studentRepo,
                      AcademicYearRepository yearRepo) {
        this.payRepo     = payRepo;
        this.levyRepo    = levyRepo;
        this.studentRepo = studentRepo;
        this.yearRepo    = yearRepo;
    }

    /** All fee payments — used by FeesProvider global context */
    public List<FeePayment> getAll() {
        return payRepo.findAll();
    }

    public List<FeeLevyType> getLevies(Integer yearId) {
        return levyRepo.findByAcademicYearId(yearId);
    }

    public List<FeePayment> getByStudent(Long studentId) {
        return payRepo.findByStudentId(studentId);
    }

    public BigDecimal getTotalPaid(Long studentId, Integer yearId) {
        return payRepo.getTotalPaid(studentId, yearId);
    }

    public FeePayment getById(Long id) {
        return payRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found: " + id));
    }

    @Transactional
    public FeePayment record(Long studentId, Integer yearId, Integer levyTypeId,
                             BigDecimal amount, FeePayment.PaymentMethod method,
                             String referenceNumber, String receiptNumber, String notes,
                             MultipartFile file) {

        Student student = studentRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));

        // Auto-detect current year if yearId not provided
        final Integer resolvedYearId = (yearId != null) ? yearId
                : yearRepo.findByIsCurrentTrue()
                  .map(AcademicYear::getId)
                  .orElseThrow(() -> new RuntimeException("No current academic year set. Please set a current year first."));
        AcademicYear year = yearRepo.findById(resolvedYearId)
                .orElseThrow(() -> new RuntimeException("Academic year not found: " + resolvedYearId));

        FeePayment payment = new FeePayment();
        payment.setStudent(student);
        payment.setAcademicYear(year);
        payment.setAmountPaid(amount);
        payment.setPaymentMethod(method);
        payment.setReferenceNumber(referenceNumber);
        payment.setReceiptNumber(receiptNumber);
        payment.setNotes(notes);

        if (levyTypeId != null) {
            levyRepo.findById(levyTypeId).ifPresent(payment::setLevyType);
        }

        if (file != null && !file.isEmpty()) {
            try {
                Path dir = Paths.get(uploadDir).toAbsolutePath().normalize();
                Files.createDirectories(dir);
                String storedName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                Files.copy(file.getInputStream(), dir.resolve(storedName),
                        StandardCopyOption.REPLACE_EXISTING);
                payment.setReceiptFileName(file.getOriginalFilename());
                payment.setReceiptFilePath(storedName);
                payment.setReceiptFileType(file.getContentType());
                payment.setReceiptFileSize(file.getSize());
            } catch (Exception e) {
                throw new RuntimeException("File upload failed: " + e.getMessage());
            }
        }

        return payRepo.save(payment);
    }

    public Resource loadReceipt(Long id) {
        FeePayment payment = getById(id);
        try {
            return new UrlResource(
                    Paths.get(uploadDir).resolve(payment.getReceiptFilePath()).toUri());
        } catch (Exception e) {
            throw new RuntimeException("Receipt file not found");
        }
    }

    public void delete(Long id) {
        payRepo.deleteById(id);
    }

    public record FeeSummary(
            BigDecimal totalPaid,
            BigDecimal totalLevied,
            BigDecimal outstanding,
            int paymentCount
    ) {}

    public FeeSummary getSummary(Long studentId, Integer yearId) {
        // If yearId not provided, use current year or sum all payments
        if (yearId == null) {
            var currentYear = yearRepo.findByIsCurrentTrue().orElse(null);
            if (currentYear != null) yearId = currentYear.getId();
        }
        if (yearId == null) {
            // No current year set — return totals across all years
            List<FeePayment> all = payRepo.findByStudentId(studentId);
            BigDecimal paid = all.stream().map(FeePayment::getAmountPaid)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            return new FeeSummary(paid, BigDecimal.ZERO, BigDecimal.ZERO, all.size());
        }
        BigDecimal paid = payRepo.getTotalPaid(studentId, yearId);
        BigDecimal levied = levyRepo.findByAcademicYearId(yearId).stream()
                .map(FeeLevyType::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal outstanding = levied.subtract(paid).max(BigDecimal.ZERO);
        int count = payRepo.findByStudentAndYear(studentId, yearId).size();
        return new FeeSummary(paid, levied, outstanding, count);
    }
}