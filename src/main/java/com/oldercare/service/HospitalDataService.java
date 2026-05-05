package com.oldercare.service;

import com.oldercare.entity.Appointment;
import com.oldercare.entity.Medication;
import com.oldercare.entity.Vaccine;
import com.oldercare.repository.AppointmentRepository;
import com.oldercare.repository.MedicationRepository;
import com.oldercare.repository.VaccineRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class HospitalDataService {

    private final MedicationRepository medicationRepository;
    private final VaccineRepository vaccineRepository;
    private final AppointmentRepository appointmentRepository;

    public HospitalDataService(MedicationRepository medicationRepository,
                               VaccineRepository vaccineRepository,
                               AppointmentRepository appointmentRepository) {
        this.medicationRepository = medicationRepository;
        this.vaccineRepository = vaccineRepository;
        this.appointmentRepository = appointmentRepository;
    }

    public List<Medication> getActiveMedications(UUID userId) {
        return medicationRepository.findByUserIdAndEndDateIsNullOrderByStartDateDesc(userId);
    }

    public List<Medication> getAllMedications(UUID userId) {
        return medicationRepository.findByUserIdOrderByStartDateDesc(userId);
    }

    public Medication addMedication(UUID userId, String name, String dosage, String frequency, LocalDate startDate) {
        Medication medication = Medication.builder()
                .userId(userId)
                .name(name)
                .dosage(dosage)
                .frequency(frequency)
                .startDate(startDate)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return medicationRepository.save(medication);
    }

    public Optional<Medication> getMedication(UUID medicationId, UUID userId) {
        return medicationRepository.findByIdAndUserId(medicationId, userId);
    }

    public Optional<Medication> updateMedication(UUID medicationId, UUID userId, String name,
                                                 String dosage, String frequency,
                                                 LocalDate startDate, LocalDate endDate) {
        return medicationRepository.findByIdAndUserId(medicationId, userId).map(medication -> {
            medication.setName(name);
            medication.setDosage(dosage);
            medication.setFrequency(frequency);
            medication.setStartDate(startDate);
            medication.setEndDate(endDate);
            medication.setUpdatedAt(LocalDateTime.now());
            return medicationRepository.save(medication);
        });
    }

    public List<Vaccine> getVaccineHistory(UUID userId) {
        return vaccineRepository.findByUserIdOrderByDateAdministeredDesc(userId);
    }

    public Optional<Vaccine> getVaccine(UUID vaccineId, UUID userId) {
        return vaccineRepository.findByIdAndUserId(vaccineId, userId);
    }

    public List<Vaccine> getUpcomingVaccineReminders(UUID userId) {
        return vaccineRepository.findByUserIdAndNextReminderDateAfterOrderByNextReminderDateAsc(userId, LocalDate.now());
    }

    public Vaccine saveVaccine(UUID patientUserId, UUID editorUserId, String vaccineName,
                               LocalDate dateAdministered, String location, LocalDate nextReminder) {
        Vaccine vaccine = Vaccine.builder()
                .userId(patientUserId)
                .vaccineName(vaccineName)
                .dateAdministered(dateAdministered)
                .location(location)
                .nextReminderDate(nextReminder)
                .lastEditedByUserId(editorUserId)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return vaccineRepository.save(vaccine);
    }

    public Optional<Vaccine> updateVaccine(UUID vaccineId, UUID patientUserId, UUID editorUserId,
                                           String vaccineName, LocalDate dateAdministered,
                                           String location, LocalDate nextReminder) {
        return vaccineRepository.findByIdAndUserId(vaccineId, patientUserId).map(vaccine -> {
            vaccine.setVaccineName(vaccineName);
            vaccine.setDateAdministered(dateAdministered);
            vaccine.setLocation(location);
            vaccine.setNextReminderDate(nextReminder);
            vaccine.setLastEditedByUserId(editorUserId);
            vaccine.setUpdatedAt(LocalDateTime.now());
            return vaccineRepository.save(vaccine);
        });
    }

    public List<Appointment> getUpcomingAppointments(UUID userId) {
        return appointmentRepository.findByUserIdAndAppointmentDateAfterOrderByAppointmentDateAsc(userId, LocalDateTime.now());
    }

    public List<Appointment> getAllAppointments(UUID userId) {
        return appointmentRepository.findByUserIdOrderByAppointmentDateDesc(userId);
    }

    public Appointment addAppointmentForPatient(UUID patientUserId, String doctorName,
                                                String specialty, LocalDateTime appointmentDate,
                                                String clinicLocation, String phoneContact) {
        Appointment appointment = Appointment.builder()
                .userId(patientUserId)
                .doctorName(doctorName)
                .specialty(specialty)
                .appointmentDate(appointmentDate)
                .clinicLocation(clinicLocation)
                .phoneContact(phoneContact)
                .status("SCHEDULED")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return appointmentRepository.save(appointment);
    }
}
