package com.oldercare.controller;

import com.oldercare.entity.PatientProfile;
import com.oldercare.entity.AllergiesLifestyle;
import com.oldercare.entity.ContactDemographic;
import com.oldercare.entity.MedicalHistory;
import com.oldercare.service.HospitalDataService;
import com.oldercare.service.PatientProfileService;
import com.oldercare.service.PdfExportService;
import jakarta.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.UUID;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.server.ResponseStatusException;

@Controller
@RequestMapping("/dashboard")
public class DashboardController {

    private final PatientProfileService patientProfileService;
    private final HospitalDataService hospitalDataService;
    private final PdfExportService pdfExportService;

    public DashboardController(PatientProfileService patientProfileService,
                               HospitalDataService hospitalDataService,
                               PdfExportService pdfExportService) {
        this.patientProfileService = patientProfileService;
        this.hospitalDataService = hospitalDataService;
        this.pdfExportService = pdfExportService;
    }

    @GetMapping({ "", "/" })
    public String patientHome(HttpSession session, Model model) {
        UUID userId = requirePatient(session);
        PatientProfile profile = patientProfileService.getPatientProfile(userId).orElse(new PatientProfile());
        MedicalHistory history = patientProfileService.getMedicalHistory(userId).orElse(new MedicalHistory());
        AllergiesLifestyle lifestyle = patientProfileService.getAllergiesLifestyle(userId).orElse(new AllergiesLifestyle());
        model.addAttribute("profile", profile);
        model.addAttribute("history", history);
        model.addAttribute("lifestyle", lifestyle);
        model.addAttribute("age", calculateAge(profile));
        model.addAttribute("drugAllergyItems", splitMultiValue(lifestyle.getDrugAllergies()));
        model.addAttribute("otherAllergyItems", splitMultiValue(lifestyle.getOtherAllergies()));
        List<String> chronicConditionItems = splitMedicalValues(history.getChronicConditions());
        model.addAttribute("chronicConditionItems", chronicConditionItems);
        model.addAttribute("chronicConditionSummary", chronicConditionItems.isEmpty()
                ? "Aucune pathologie enregistree"
                : String.join(", ", chronicConditionItems));
        model.addAttribute("emergencyContacts", patientProfileService.getEmergencyContacts(userId));
        model.addAttribute("sosMessage", patientProfileService.sosMessageFor(userId));
        model.addAttribute("emergencyInfoUrl", "/dashboard/emergency-info");
        model.addAttribute("appointments", hospitalDataService.getUpcomingAppointments(userId));
        model.addAttribute("vaccines", hospitalDataService.getVaccineHistory(userId));
        model.addAttribute("medications", hospitalDataService.getActiveMedications(userId));
        return "dashboard/patient-home";
    }

    @GetMapping("/appointments")
    public String appointments(HttpSession session, Model model) {
        UUID userId = requirePatient(session);
        addEmergencyInfoModel(userId, model);
        model.addAttribute("appointments", hospitalDataService.getAllAppointments(userId));
        return "dashboard/appointments";
    }

    @GetMapping("/medications")
    public String medications(HttpSession session, Model model) {
        UUID userId = requirePatient(session);
        addEmergencyInfoModel(userId, model);
        model.addAttribute("medications", hospitalDataService.getAllMedications(userId));
        model.addAttribute("frequencyOptions", medicationFrequencyOptions());
        return "dashboard/medications";
    }

    @GetMapping("/vaccines")
    public String vaccines(HttpSession session, Model model) {
        UUID userId = requirePatient(session);
        addEmergencyInfoModel(userId, model);
        model.addAttribute("vaccines", hospitalDataService.getVaccineHistory(userId));
        return "dashboard/vaccines";
    }

    @GetMapping("/profile")
    public String medicalProfile(HttpSession session, Model model) {
        UUID userId = requirePatient(session);
        PatientProfile profile = patientProfileService.getPatientProfile(userId).orElse(new PatientProfile());
        MedicalHistory history = patientProfileService.getMedicalHistory(userId).orElse(new MedicalHistory());
        AllergiesLifestyle lifestyle = patientProfileService.getAllergiesLifestyle(userId).orElse(new AllergiesLifestyle());

        model.addAttribute("profile", profile);
        model.addAttribute("history", history);
        model.addAttribute("lifestyle", lifestyle);
        model.addAttribute("age", calculateAge(profile));
        model.addAttribute("drugAllergyItems", splitMultiValue(lifestyle.getDrugAllergies()));
        model.addAttribute("otherAllergyItems", splitMultiValue(lifestyle.getOtherAllergies()));
        model.addAttribute("allergyItems", combineLists(
                splitMultiValue(lifestyle.getDrugAllergies()),
                splitMultiValue(lifestyle.getOtherAllergies())));
        model.addAttribute("chronicConditionItems", splitMedicalValues(history.getChronicConditions()));
        model.addAttribute("surgicalProcedureItems", splitMedicalValues(history.getSurgicalProcedures()));
        model.addAttribute("obGynItems", splitMedicalValues(history.getObGynHistory()));
        model.addAttribute("recordNumber", recordNumberFor(userId));
        model.addAttribute("emergencyContacts", patientProfileService.getEmergencyContacts(userId));
        model.addAttribute("sosMessage", patientProfileService.sosMessageFor(userId));
        model.addAttribute("emergencyInfoUrl", "/dashboard/emergency-info");
        model.addAttribute("medications", hospitalDataService.getActiveMedications(userId));
        model.addAttribute("appointments", hospitalDataService.getUpcomingAppointments(userId));
        model.addAttribute("vaccines", hospitalDataService.getVaccineHistory(userId));
        return "dashboard/medical-profile";
    }

    @GetMapping("/emergency-info")
    public String emergencyInfo(HttpSession session, Model model) {
        UUID userId = requirePatient(session);
        addEmergencyInfoModel(userId, model);
        model.addAttribute("cancelUrl", "/dashboard");
        model.addAttribute("sosUrl", "/dashboard/sos");
        return "dashboard/emergency-info";
    }

    @GetMapping("/profile/pdf")
    public ResponseEntity<byte[]> downloadMedicalProfile(HttpSession session) {
        UUID userId = requirePatient(session);
        PatientProfile profile = patientProfileService.getPatientProfile(userId).orElse(new PatientProfile());
        ContactDemographic contact = patientProfileService.getContactDemographic(userId).orElse(new ContactDemographic());
        MedicalHistory history = patientProfileService.getMedicalHistory(userId).orElse(new MedicalHistory());
        AllergiesLifestyle lifestyle = patientProfileService.getAllergiesLifestyle(userId).orElse(new AllergiesLifestyle());
        byte[] pdf = pdfExportService.buildPatientMedicalPdf(
                profile,
                contact,
                history,
                lifestyle,
                patientProfileService.getEmergencyContacts(userId),
                hospitalDataService.getAllMedications(userId),
                hospitalDataService.getVaccineHistory(userId),
                hospitalDataService.getAllAppointments(userId),
                calculateAge(profile));

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + pdfExportService.fileNameFor(profile) + "\"")
                .body(pdf);
    }

    @GetMapping("/sos")
    public String sos(HttpSession session, Model model) {
        UUID userId = requirePatient(session);
        PatientProfile profile = patientProfileService.getPatientProfile(userId).orElse(new PatientProfile());
        model.addAttribute("profile", profile);
        model.addAttribute("emergencyContacts", patientProfileService.getEmergencyContacts(userId));
        model.addAttribute("contact", patientProfileService.getContactDemographic(userId).orElse(null));
        model.addAttribute("sosMessage", patientProfileService.sosMessageFor(userId));
        model.addAttribute("cancelUrl", "/dashboard");
        return "dashboard/sos";
    }

    @PostMapping("/vaccines")
    public String addVaccine(@RequestParam String vaccineName,
                             @RequestParam String dateAdministered,
                             @RequestParam String location,
                             @RequestParam(required = false) String nextReminderDate,
                             HttpSession session) {
        UUID userId = requirePatient(session);
        hospitalDataService.saveVaccine(
                userId,
                userId,
                vaccineName,
                LocalDate.parse(dateAdministered),
                location,
                parseOptionalDate(nextReminderDate));
        return "redirect:/dashboard/vaccines";
    }

    @PostMapping("/medications")
    public String addMedication(@RequestParam String name,
                                @RequestParam String dosage,
                                @RequestParam String frequency,
                                @RequestParam String startDate,
                                HttpSession session) {
        UUID userId = requirePatient(session);
        hospitalDataService.addMedication(
                userId,
                name,
                dosage,
                frequency,
                LocalDate.parse(startDate));
        return "redirect:/dashboard/medications";
    }

    @PostMapping("/medications/{medicationId}")
    public String updateMedication(@PathVariable UUID medicationId,
                                   @RequestParam String name,
                                   @RequestParam String dosage,
                                   @RequestParam String frequency,
                                   @RequestParam String startDate,
                                   @RequestParam(required = false) String endDate,
                                   HttpSession session) {
        UUID userId = requirePatient(session);
        hospitalDataService.updateMedication(
                medicationId,
                userId,
                name,
                dosage,
                frequency,
                LocalDate.parse(startDate),
                parseOptionalDate(endDate));
        return "redirect:/dashboard/medications";
    }

    @PostMapping("/appointments")
    public String addAppointment(@RequestParam String doctorName,
                                 @RequestParam String specialty,
                                 @RequestParam String appointmentDate,
                                 @RequestParam String clinicLocation,
                                 @RequestParam(required = false) String phoneContact,
                                 HttpSession session) {
        UUID userId = requirePatient(session);
        hospitalDataService.addAppointmentForPatient(
                userId,
                doctorName,
                specialty,
                LocalDateTime.parse(appointmentDate),
                clinicLocation,
                phoneContact);
        return "redirect:/dashboard/appointments";
    }

    private UUID requirePatient(HttpSession session) {
        UUID userId = (UUID) session.getAttribute("userId");
        if (userId == null || !"PATIENT".equals(session.getAttribute("userType"))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return userId;
    }

    private LocalDate parseOptionalDate(String value) {
        return value == null || value.isBlank() ? null : LocalDate.parse(value);
    }

    private void addEmergencyInfoModel(UUID userId, Model model) {
        PatientProfile profile = patientProfileService.getPatientProfile(userId).orElse(new PatientProfile());
        model.addAttribute("profile", profile);
        model.addAttribute("age", calculateAge(profile));
        model.addAttribute("emergencyContacts", patientProfileService.getEmergencyContacts(userId));
        model.addAttribute("sosMessage", patientProfileService.sosMessageFor(userId));
        model.addAttribute("emergencyInfoUrl", "/dashboard/emergency-info");
    }

    private Integer calculateAge(PatientProfile profile) {
        if (profile.getDateOfBirth() == null) {
            return null;
        }
        return Period.between(profile.getDateOfBirth(), LocalDate.now()).getYears();
    }

    private List<String> splitMultiValue(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        return Arrays.stream(value.split("\\r?\\n|\\s*,\\s*"))
                .map(String::trim)
                .filter(item -> !item.isEmpty())
                .toList();
    }

    private List<String> splitMedicalValues(String value) {
        return splitMultiValue(value).stream()
                .map(this::translateMedicalValue)
                .toList();
    }

    private String translateMedicalValue(String value) {
        return switch (value) {
            case "High blood pressure" -> "Hypertension arterielle";
            case "High cholesterol" -> "Hypercholesterolemie";
            case "Heart disease" -> "Maladie cardiaque";
            case "Stroke" -> "AVC";
            case "Diabetes Type 1", "Diabete Type 1", "Diabete type 1", "Diab&egrave;te type 1" -> "Diabete type 1";
            case "Diabetes Type 2", "Diabete Type 2", "Diabete type 2", "Diab&egrave;te type 2" -> "Diabete type 2";
            case "Gestational diabetes", "Gestational Diabetes" -> "Diabete gestationnel";
            case "Thyroid disorders" -> "Troubles thyroidiens";
            case "Asthma" -> "Asthme";
            case "COPD" -> "BPCO";
            case "Sleep Apnea" -> "Apnee du sommeil";
            case "GERD" -> "RGO";
            case "Crohn's disease" -> "Maladie de Crohn";
            case "IBS" -> "SII";
            case "Epilepsy/Seizures" -> "Epilepsie/Convulsions";
            case "Multiple Sclerosis" -> "Sclerose en plaques";
            case "Anxiety" -> "Anxiete";
            case "Depression" -> "Depression";
            case "PTSD" -> "TSPT";
            case "Appendectomy" -> "Appendicectomie";
            case "Cholecystectomy" -> "Cholecystectomie";
            case "Hernia repair" -> "Reparation de hernie";
            case "Knee replacement" -> "Prothese du genou";
            case "Hip replacement" -> "Prothese de hanche";
            case "Spinal fusion" -> "Arthrodese vertebrale";
            case "Heart bypass" -> "Pontage cardiaque";
            case "Stent placement" -> "Pose de stent";
            case "Tonsillectomy" -> "Amygdalectomie";
            case "Adenoidectomy" -> "Adenoidectomie";
            case "Cataract surgery" -> "Chirurgie de la cataracte";
            case "C-section" -> "Cesarienne";
            case "Pregnancies: 1" -> "Grossesses : 1";
            default -> value
                    .replace("Pregnancies:", "Grossesses :")
                    .replace("Births:", "Accouchements :")
                    .replace("Preeclampsia", "Preeclampsie")
                    .replace("Endometriosis", "Endometriose")
                    .replace("Gestationnel Diab&egrave;te", "Diabete gestationnel")
                    .replace("Diab&egrave;te", "Diabete")
                    .replace("PCOS", "SOPK");
        };
    }

    private List<String> combineLists(List<String> first, List<String> second) {
        List<String> combined = new ArrayList<>(first);
        combined.addAll(second);
        return combined;
    }

    private String recordNumberFor(UUID userId) {
        String raw = userId.toString().replace("-", "").toUpperCase();
        return "HN-" + raw.substring(0, 2) + "-" + raw.substring(raw.length() - 6);
    }

    private List<String> medicationFrequencyOptions() {
        return List.of(
                "Chaque matin",
                "Chaque midi",
                "Chaque soir",
                "Au coucher",
                "Matin et soir",
                "1 fois par jour",
                "2 fois par jour",
                "3 fois par jour",
                "Toutes les 6 heures",
                "Toutes les 8 heures",
                "Toutes les 12 heures",
                "Chaque semaine",
                "Selon besoin");
    }
}
