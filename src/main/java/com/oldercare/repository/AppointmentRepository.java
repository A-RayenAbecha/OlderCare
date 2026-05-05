package com.oldercare.repository;

import com.oldercare.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    List<Appointment> findByUserIdAndAppointmentDateAfterOrderByAppointmentDateAsc(UUID userId, LocalDateTime date);
    List<Appointment> findByUserIdOrderByAppointmentDateDesc(UUID userId);
}
