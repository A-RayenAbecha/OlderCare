package com.oldercare.service;

import com.oldercare.entity.*;
import com.oldercare.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Service
public class PatientProfileService {

    @Autowired
    private PatientProfileRepository patientProfileRepository;

    @Autowired
    private ContactDemographicRepository contactDemographicRepository;

    @Autowired
    private MedicalHistoryRepository medicalHistoryRepository;

    @Autowired
    private AllergiesLifestyleRepository allergiesLifestyleRepository;

    @Autowired
    private EmergencyContactRepository emergencyContactRepository;

    public PatientProfile createOrUpdatePatientProfile(UUID userId, String surname, String firstName,
                                                       String gender, LocalDate dateOfBirth,
                                                       String bloodType, String maritalStatus, String nationality) {
        Optional<PatientProfile> existing = patientProfileRepository.findByUserId(userId);
        
        PatientProfile profile = existing.orElse(new PatientProfile());
        profile.setUserId(userId);
        profile.setSurname(surname);
        profile.setFirstName(firstName);
        profile.setGender(gender);
        profile.setDateOfBirth(dateOfBirth);
        profile.setBloodType(bloodType);
        profile.setMaritalStatus(maritalStatus);
        profile.setNationality(nationality);

        if (existing.isEmpty()) {
            profile.setCreatedAt(LocalDateTime.now());
        }
        profile.setUpdatedAt(LocalDateTime.now());

        return patientProfileRepository.save(profile);
    }

    public Optional<PatientProfile> getPatientProfile(UUID userId) {
        return patientProfileRepository.findByUserId(userId);
    }

    public PatientProfile updateSosMessage(UUID userId, String sosMessage) {
        PatientProfile profile = patientProfileRepository.findByUserId(userId).orElseGet(() -> {
            PatientProfile created = new PatientProfile();
            created.setUserId(userId);
            created.setCreatedAt(LocalDateTime.now());
            return created;
        });
        profile.setSosMessage(normalizeSosMessage(sosMessage));
        profile.setUpdatedAt(LocalDateTime.now());
        return patientProfileRepository.save(profile);
    }

    public String sosMessageFor(UUID userId) {
        return patientProfileRepository.findByUserId(userId)
                .map(PatientProfile::getSosMessage)
                .map(this::normalizeSosMessage)
                .orElse(defaultSosMessage());
    }

    public ContactDemographic createOrUpdateContactDemographic(UUID userId, String occupation,
                                                               Integer numChildren, String socialSecurityType,
                                                               String phoneNumber, String region,
                                                               String address, String postalCode) {
        Optional<ContactDemographic> existing = contactDemographicRepository.findByUserId(userId);
        
        ContactDemographic demographic = existing.orElse(new ContactDemographic());
        demographic.setUserId(userId);
        demographic.setOccupation(occupation);
        demographic.setNumChildren(numChildren);
        demographic.setSocialSecurityType(socialSecurityType);
        demographic.setPhoneNumber(phoneNumber);
        demographic.setRegion(region);
        demographic.setAddress(address);
        demographic.setPostalCode(postalCode);

        if (existing.isEmpty()) {
            demographic.setCreatedAt(LocalDateTime.now());
        }
        demographic.setUpdatedAt(LocalDateTime.now());

        return contactDemographicRepository.save(demographic);
    }

    public Optional<ContactDemographic> getContactDemographic(UUID userId) {
        return contactDemographicRepository.findByUserId(userId);
    }

    public List<EmergencyContact> getEmergencyContacts(UUID userId) {
        return emergencyContactRepository.findByUserIdOrderByPriorityOrderAsc(userId);
    }

    @Transactional
    public List<EmergencyContact> replaceEmergencyContacts(UUID userId,
                                                           List<String> names,
                                                           List<String> relationships,
                                                           List<String> phones,
                                                           List<String> residences) {
        List<EmergencyContact> existing = emergencyContactRepository.findByUserIdOrderByPriorityOrderAsc(userId);
        emergencyContactRepository.deleteAll(existing);

        List<EmergencyContact> contacts = new ArrayList<>();
        for (int i = 0; i < 3; i++) {
            String name = valueAt(names, i);
            String relationship = valueAt(relationships, i);
            String phone = valueAt(phones, i);
            String residence = valueAt(residences, i);
            if (name.isBlank() && relationship.isBlank() && phone.isBlank() && residence.isBlank()) {
                continue;
            }

            contacts.add(EmergencyContact.builder()
                    .userId(userId)
                    .fullName(name)
                    .relationship(relationship)
                    .phoneNumber(phone)
                    .residence(residence)
                    .priorityOrder(i + 1)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build());
        }

        return emergencyContactRepository.saveAll(contacts);
    }

    public MedicalHistory createOrUpdateMedicalHistory(UUID userId, String chronicConditions,
                                                       String surgicalProcedures, String obGynHistory) {
        Optional<MedicalHistory> existing = medicalHistoryRepository.findByUserId(userId);
        
        MedicalHistory history = existing.orElse(new MedicalHistory());
        history.setUserId(userId);
        history.setChronicConditions(chronicConditions);
        history.setSurgicalProcedures(surgicalProcedures);
        history.setObGynHistory(obGynHistory);

        if (existing.isEmpty()) {
            history.setCreatedAt(LocalDateTime.now());
        }
        history.setUpdatedAt(LocalDateTime.now());

        return medicalHistoryRepository.save(history);
    }

    public Optional<MedicalHistory> getMedicalHistory(UUID userId) {
        return medicalHistoryRepository.findByUserId(userId);
    }

    public AllergiesLifestyle createOrUpdateAllergiesLifestyle(UUID userId, String drugAllergies,
                                                               String otherAllergies, String smokingStatus,
                                                               String alcoholConsumption) {
        Optional<AllergiesLifestyle> existing = allergiesLifestyleRepository.findByUserId(userId);
        
        AllergiesLifestyle allergies = existing.orElse(new AllergiesLifestyle());
        allergies.setUserId(userId);
        allergies.setDrugAllergies(drugAllergies);
        allergies.setOtherAllergies(otherAllergies);
        allergies.setSmokingStatus(smokingStatus);
        allergies.setAlcoholConsumption(alcoholConsumption);

        if (existing.isEmpty()) {
            allergies.setCreatedAt(LocalDateTime.now());
        }
        allergies.setUpdatedAt(LocalDateTime.now());

        return allergiesLifestyleRepository.save(allergies);
    }

    public Optional<AllergiesLifestyle> getAllergiesLifestyle(UUID userId) {
        return allergiesLifestyleRepository.findByUserId(userId);
    }

    public void markProfileComplete(UUID userId) {
        Optional<PatientProfile> profile = patientProfileRepository.findByUserId(userId);
        if (profile.isPresent()) {
            profile.get().setProfileComplete(true);
            patientProfileRepository.save(profile.get());
        }
    }

    private String normalizeSosMessage(String value) {
        if (value == null || value.isBlank()) {
            return defaultSosMessage();
        }
        return value.trim();
    }

    private String defaultSosMessage() {
        return "SOS : j'ai besoin d'une aide immediate. Veuillez me contacter ou venir a ma position.";
    }

    private String valueAt(List<String> values, int index) {
        if (values == null || index >= values.size() || values.get(index) == null) {
            return "";
        }
        return values.get(index).trim();
    }
}
