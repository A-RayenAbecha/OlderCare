package com.oldercare.controller;

import com.oldercare.entity.AllergiesLifestyle;
import com.oldercare.entity.ContactDemographic;
import com.oldercare.entity.EmergencyContact;
import com.oldercare.entity.MedicalHistory;
import com.oldercare.entity.PatientProfile;
import com.oldercare.service.PatientProfileService;
import jakarta.servlet.http.HttpSession;
import java.util.ArrayList;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.server.ResponseStatusException;

@Controller
@RequestMapping("/profile")
public class ProfileController {

    private final PatientProfileService patientProfileService;

    public ProfileController(PatientProfileService patientProfileService) {
        this.patientProfileService = patientProfileService;
    }

    @GetMapping("/setup")
    public String setupProfile(@RequestParam(defaultValue = "1") int step, HttpSession session, Model model) {
        UUID userId = (UUID) session.getAttribute("userId");
        if (userId == null) {
            return "redirect:/auth/signup/patient";
        }
        model.addAttribute("step", step);
        model.addAttribute("profile", patientProfileService.getPatientProfile(userId).orElse(new PatientProfile()));
        model.addAttribute("contact", patientProfileService.getContactDemographic(userId).orElse(new ContactDemographic()));
        MedicalHistory history = patientProfileService.getMedicalHistory(userId).orElse(new MedicalHistory());
        AllergiesLifestyle lifestyle = patientProfileService.getAllergiesLifestyle(userId).orElse(new AllergiesLifestyle());
        model.addAttribute("history", history);
        model.addAttribute("lifestyle", lifestyle);
        model.addAttribute("drugAllergyItems", splitMultiValue(lifestyle.getDrugAllergies()));
        model.addAttribute("otherAllergyItems", splitMultiValue(lifestyle.getOtherAllergies()));
        model.addAttribute("emergencyContacts", padEmergencyContacts(patientProfileService.getEmergencyContacts(userId)));
        model.addAttribute("sosMessage", patientProfileService.sosMessageFor(userId));

        return switch (step) {
            case 2 -> "profile/civil-data-2";
            case 3 -> "profile/medical-history";
            case 4 -> "profile/surgical-history";
            case 5 -> "profile/obgyn-history";
            case 6 -> "profile/allergies-lifestyle";
            default -> "profile/civil-data-1";
        };
    }

    @PostMapping("/civil-data-1")
    @ResponseBody
    public ResponseEntity<?> saveCivilData1(@RequestParam String surname,
                                            @RequestParam String firstName,
                                            @RequestParam String gender,
                                            @RequestParam String dateOfBirth,
                                            @RequestParam(defaultValue = "Inconnu") String bloodType,
                                            @RequestParam String maritalStatus,
                                            @RequestParam String nationality,
                                            HttpSession session) {
        UUID userId = requirePatient(session);
        PatientProfile profile = patientProfileService.createOrUpdatePatientProfile(
                userId, surname, firstName, gender, LocalDate.parse(dateOfBirth), bloodType, maritalStatus, nationality);
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/civil-data-2")
    @ResponseBody
    public ResponseEntity<?> saveCivilData2(@RequestParam String occupation,
                                            @RequestParam Integer numChildren,
                                            @RequestParam String socialSecurityType,
                                            @RequestParam String phoneNumber,
                                            @RequestParam String region,
                                            @RequestParam String address,
                                            @RequestParam String postalCode,
                                            @RequestParam(defaultValue = "") String sosMessage,
                                            @RequestParam(name = "emergencyName", required = false) List<String> emergencyNames,
                                            @RequestParam(name = "emergencyRelationship", required = false) List<String> emergencyRelationships,
                                            @RequestParam(name = "emergencyPhone", required = false) List<String> emergencyPhones,
                                            @RequestParam(name = "emergencyResidence", required = false) List<String> emergencyResidences,
                                            HttpSession session) {
        UUID userId = requirePatient(session);
        ContactDemographic demographic = patientProfileService.createOrUpdateContactDemographic(
                userId, occupation, numChildren, socialSecurityType, phoneNumber, region, address, postalCode);
        patientProfileService.replaceEmergencyContacts(
                userId, emergencyNames, emergencyRelationships, emergencyPhones, emergencyResidences);
        patientProfileService.updateSosMessage(userId, sosMessage);
        return ResponseEntity.ok(demographic);
    }

    @PostMapping("/medical-history")
    @ResponseBody
    public ResponseEntity<?> saveMedicalHistory(@RequestParam(required = false) String chronicConditions,
                                                @RequestParam(required = false) String surgicalProcedures,
                                                @RequestParam(required = false) String obGynHistory,
                                                HttpSession session) {
        UUID userId = requirePatient(session);
        MedicalHistory existing = patientProfileService.getMedicalHistory(userId).orElse(new MedicalHistory());
        return ResponseEntity.ok(patientProfileService.createOrUpdateMedicalHistory(
                userId,
                chronicConditions == null ? existing.getChronicConditions() : chronicConditions,
                surgicalProcedures == null ? existing.getSurgicalProcedures() : surgicalProcedures,
                obGynHistory == null ? existing.getObGynHistory() : obGynHistory));
    }

    @PostMapping("/allergies-lifestyle")
    @ResponseBody
    public ResponseEntity<?> saveAllergiesLifestyle(@RequestParam(defaultValue = "") String drugAllergies,
                                                    @RequestParam(defaultValue = "") String otherAllergies,
                                                    @RequestParam String smokingStatus,
                                                    @RequestParam String alcoholConsumption,
                                                    HttpSession session) {
        UUID userId = requirePatient(session);
        patientProfileService.markProfileComplete(userId);
        return ResponseEntity.ok(patientProfileService.createOrUpdateAllergiesLifestyle(
                userId, drugAllergies, otherAllergies, smokingStatus, alcoholConsumption));
    }

    private UUID requirePatient(HttpSession session) {
        UUID userId = (UUID) session.getAttribute("userId");
        if (userId == null || !"PATIENT".equals(session.getAttribute("userType"))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return userId;
    }

    private List<String> splitMultiValue(String value) {
        if (value == null || value.isBlank()) {
            return List.of("");
        }
        List<String> values = Arrays.stream(value.split("\\r?\\n|\\s*,\\s*"))
                .map(String::trim)
                .filter(item -> !item.isEmpty())
                .toList();
        return values.isEmpty() ? List.of("") : values;
    }

    private List<EmergencyContact> padEmergencyContacts(List<EmergencyContact> contacts) {
        List<EmergencyContact> slots = new ArrayList<>(contacts);
        while (slots.size() < 3) {
            slots.add(new EmergencyContact());
        }
        return slots.subList(0, 3);
    }
}
