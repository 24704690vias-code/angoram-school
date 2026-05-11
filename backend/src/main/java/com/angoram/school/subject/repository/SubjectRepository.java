package com.angoram.school.subject.repository;

import com.angoram.school.subject.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
}
