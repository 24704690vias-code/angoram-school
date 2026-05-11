package com.angoram.school.academic.service;

import com.angoram.school.academic.model.AcademicYear;
import com.angoram.school.academic.model.Term;
import com.angoram.school.academic.repository.AcademicYearRepository;
import com.angoram.school.academic.repository.TermRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AcademicYearService {

    private final AcademicYearRepository yearRepo;
    private final TermRepository termRepo;

    public AcademicYearService(AcademicYearRepository yearRepo, TermRepository termRepo) {
        this.yearRepo = yearRepo;
        this.termRepo = termRepo;
    }

    public List<AcademicYear> getAll() {
        return yearRepo.findAll();
    }

    public AcademicYear getCurrent() {
        return yearRepo.findByIsCurrentTrue()
            .orElseThrow(() -> new RuntimeException("No current academic year set."));
    }

    public List<Term> getTerms(Integer yearId) {
        return termRepo.findByAcademicYearId(yearId);
    }
}
