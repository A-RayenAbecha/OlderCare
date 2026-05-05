package com.oldercare.repository;

import com.oldercare.entity.EmergencyContact;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmergencyContactRepository extends JpaRepository<EmergencyContact, UUID> {
    List<EmergencyContact> findByUserIdOrderByPriorityOrderAsc(UUID userId);
}
