package com.oldercare.repository;

import com.oldercare.entity.ContactDemographic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContactDemographicRepository extends JpaRepository<ContactDemographic, UUID> {
    Optional<ContactDemographic> findByUserId(UUID userId);
}
