package com.oldercare.repository;

import com.oldercare.entity.Vaccine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VaccineRepository extends JpaRepository<Vaccine, UUID> {
    List<Vaccine> findByUserIdOrderByDateAdministeredDesc(UUID userId);
    List<Vaccine> findByUserIdAndNextReminderDateAfterOrderByNextReminderDateAsc(UUID userId, LocalDate date);
    Optional<Vaccine> findByIdAndUserId(UUID id, UUID userId);
}
