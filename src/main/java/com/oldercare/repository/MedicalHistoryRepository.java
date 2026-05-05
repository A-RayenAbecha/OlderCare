package com.oldercare.repository;

import com.oldercare.entity.MedicalHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MedicalHistoryRepository extends JpaRepository<MedicalHistory, UUID> {
    Optional<MedicalHistory> findByUserId(UUID userId);
}
