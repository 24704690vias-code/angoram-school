package com.angoram.school.auth.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter @Setter @Entity @Table(name="app_user")
public class AppUser {
    public enum Role { ADMIN, TEACHER, PRINCIPAL }

    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false, unique=true)
    private String username;

    @JsonIgnore  // NEVER serialise the password hash to the client
    @Column(nullable=false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private Role role = Role.TEACHER;

    @Column(name="full_name")
    private String fullName;

    private String email;

    @Column(nullable=false)
    private Boolean enabled = true;

    @Column(name="created_at", updatable=false)
    private LocalDateTime createdAt;

    @Column(name="updated_at")
    private LocalDateTime updatedAt;

    @PrePersist protected void onCreate() { createdAt=LocalDateTime.now(); updatedAt=LocalDateTime.now(); }
    @PreUpdate  protected void onUpdate() { updatedAt=LocalDateTime.now(); }
}