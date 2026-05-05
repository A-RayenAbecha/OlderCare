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
@Table(name = "vaccines")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vaccine {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "vaccine_name", nullable = false)
    private String vaccineName;

    @Column(name = "date_administered")
    private LocalDate dateAdministered;

    @Column(name = "location")
    private String location;

    @Column(name = "next_reminder_date")
    private LocalDate nextReminderDate;

    @Column(name = "last_edited_by_user_id")
    private UUID lastEditedByUserId;

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
