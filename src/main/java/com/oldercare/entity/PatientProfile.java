package com.oldercare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "patient_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "surname")
    private String surname;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "gender")
    private String gender; // MALE, FEMALE

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "blood_type")
    private String bloodType;

    @Column(name = "marital_status")
    private String maritalStatus; // SINGLE, MARRIED, DIVORCED, WIDOWED

    @Column(name = "nationality")
    private String nationality;

    @Column(name = "sos_message", columnDefinition = "text")
    private String sosMessage;

    @Column(name = "profile_complete")
    private Boolean profileComplete;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        profileComplete = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
