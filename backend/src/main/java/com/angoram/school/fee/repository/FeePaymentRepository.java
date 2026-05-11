package com.angoram.school.fee.repository;

import com.angoram.school.fee.model.FeePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

public interface FeePaymentRepository extends JpaRepository<FeePayment, Long> {

    @Query("SELECT f FROM FeePayment f WHERE f.student.id = :sid ORDER BY f.paymentDate DESC")
    List<FeePayment> findByStudentId(@Param("sid") Long sid);

    @Query("SELECT f FROM FeePayment f WHERE f.student.id = :sid AND f.academicYear.id = :yid")
    List<FeePayment> findByStudentAndYear(@Param("sid") Long sid, @Param("yid") Integer yid);

    @Query("SELECT COALESCE(SUM(f.amountPaid), 0) FROM FeePayment f WHERE f.student.id = :sid AND f.academicYear.id = :yid")
    BigDecimal getTotalPaid(@Param("sid") Long sid, @Param("yid") Integer yid);

    @Query("SELECT COALESCE(SUM(f.amountPaid), 0) FROM FeePayment f WHERE f.academicYear.id = :yid")
    BigDecimal getTotalCollectedForYear(@Param("yid") Integer yid);

    // ── Aggregate report queries (CP2 - Report Generation with GROUP BY) ──

    /** Total collected grouped by payment method */
    @Query("SELECT f.paymentMethod, COUNT(f), SUM(f.amountPaid) FROM FeePayment f WHERE f.academicYear.id = :yid GROUP BY f.paymentMethod")
    List<Object[]> summaryByMethod(@Param("yid") Integer yid);

    /** Total collected per levy type */
    @Query("SELECT f.levyType.levyName, COUNT(f), SUM(f.amountPaid) FROM FeePayment f WHERE f.academicYear.id = :yid AND f.levyType IS NOT NULL GROUP BY f.levyType.levyName ORDER BY SUM(f.amountPaid) DESC")
    List<Object[]> summaryByLevyType(@Param("yid") Integer yid);

    /** Monthly fee collection totals */
    @Query("SELECT MONTH(f.paymentDate), YEAR(f.paymentDate), COUNT(f), SUM(f.amountPaid) FROM FeePayment f WHERE f.academicYear.id = :yid GROUP BY YEAR(f.paymentDate), MONTH(f.paymentDate) ORDER BY YEAR(f.paymentDate), MONTH(f.paymentDate)")
    List<Object[]> monthlyCollection(@Param("yid") Integer yid);

    /** Number of students who have paid in a given year */
    @Query("SELECT COUNT(DISTINCT f.student.id) FROM FeePayment f WHERE f.academicYear.id = :yid")
    long countStudentsWithPayments(@Param("yid") Integer yid);
}
