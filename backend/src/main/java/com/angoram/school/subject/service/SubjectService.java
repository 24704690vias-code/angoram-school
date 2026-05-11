package com.angoram.school.subject.service;

import com.angoram.school.subject.model.Subject;
import com.angoram.school.subject.repository.SubjectRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SubjectService {

    private final SubjectRepository repo;

    public SubjectService(SubjectRepository repo) {
        this.repo = repo;
    }

    public List<Subject> getAll() {
        return repo.findAll();
    }

    public Subject save(Subject s) {
        return repo.save(s);
    }

    public Subject update(Long id, Subject data) {
        Subject existing = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Subject not found: " + id));
        existing.setSubjectCode(data.getSubjectCode());
        existing.setSubjectName(data.getSubjectName());
        existing.setIsCompulsory(data.getIsCompulsory());
        return repo.save(existing);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
