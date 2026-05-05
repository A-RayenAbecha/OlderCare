package com.oldercare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "medical_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "chronic_conditions", columnDefinition = "text")
    private String chronicConditions;

    @Column(name = "surgical_procedures", columnDefinition = "text")
    private String surgicalProcedures;

    @Column(name = "ob_gyn_history", columnDefinition = "text")
    private String obGynHistory;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
