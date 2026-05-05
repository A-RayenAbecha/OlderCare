package com.oldercare.repository;

import com.oldercare.entity.PatientProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientProfileRepository extends JpaRepository<PatientProfile, UUID> {
    Optional<PatientProfile> findByUserId(UUID userId);
}
