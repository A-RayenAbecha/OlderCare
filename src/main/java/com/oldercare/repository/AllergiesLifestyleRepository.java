package com.oldercare.repository;

import com.oldercare.entity.AllergiesLifestyle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AllergiesLifestyleRepository extends JpaRepository<AllergiesLifestyle, UUID> {
    Optional<AllergiesLifestyle> findByUserId(UUID userId);
}
