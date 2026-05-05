package com.oldercare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "allergies_lifestyle")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AllergiesLifestyle {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "drug_allergies", columnDefinition = "text")
    private String drugAllergies;

    @Column(name = "other_allergies", columnDefinition = "text")
    private String otherAllergies;

    @Column(name = "smoking_status")
    private String smokingStatus; // NEVER, FORMER, CURRENT

    @Column(name = "alcohol_consumption")
    private String alcoholConsumption; // NON_DRINKER, OCCASIONAL, DAILY

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
