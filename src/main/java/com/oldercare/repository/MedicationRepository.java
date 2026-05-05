package com.oldercare.repository;

import com.oldercare.entity.Medication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MedicationRepository extends JpaRepository<Medication, UUID> {
    List<Medication> findByUserIdAndEndDateIsNullOrderByStartDateDesc(UUID userId);
    List<Medication> findByUserIdOrderByStartDateDesc(UUID userId);
    Optional<Medication> findByIdAndUserId(UUID id, UUID userId);
}
