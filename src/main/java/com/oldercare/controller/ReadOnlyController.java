package com.oldercare.controller;

import com.oldercare.entity.EmergencyContact;
import com.oldercare.entity.PatientProfile;
import com.oldercare.service.PatientProfileService;
import jakarta.servlet.http.HttpSession;
import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.server.ResponseStatusException;

@Controller
@RequestMapping("/readonly")
public class ReadOnlyController {
    private static final String STAFF_UNLOCK_CODE = "accesspatient123";

    private final PatientProfileService patientProfileService;

    public ReadOnlyController(PatientProfileService patientProfileService) {
        this.patientProfileService = patientProfileService;
    }

    @GetMapping("/profile")
    public String profile(HttpSession session, Model model) {
        UUID patientUserId = requireReadOnlyPatient(session);
        PatientProfile profile = patientProfileService.getPatientProfile(patientUserId).orElse(new PatientProfile());
        List<EmergencyContact> emergencyContacts = patientProfileService.getEmergencyContacts(patientUserId);

        model.addAttribute("profile", profile);
        model.addAttribute("age", calculateAge(profile));
        model.addAttribute("emergencyContacts", emergencyContacts);
        model.addAttribute("primaryEmergencyContact", emergencyContacts.isEmpty() ? null : emergencyContacts.get(0));
        model.addAttribute("sosMessage", patientProfileService.sosMessageFor(patientUserId));
        model.addAttribute("emergencyInfoUrl", "/readonly/emergency-info");
        model.addAttribute("staffMode", Boolean.TRUE.equals(session.getAttribute("staffMode")));
        return "readonly/profile";
    }

    @PostMapping("/unlock")
    public String unlockFullPatient(@RequestParam String staffAccessCode, HttpSession session, Model model) {
        UUID patientUserId = requireReadOnlyPatient(session);
        if (!Boolean.TRUE.equals(session.getAttribute("staffMode"))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        if (!STAFF_UNLOCK_CODE.equals(staffAccessCode)) {
            model.addAttribute("unlockError", "Code d'acces invalide.");
            return profile(session, model);
        }

        session.setAttribute("userId", patientUserId);
        session.setAttribute("userType", "PATIENT");
        session.removeAttribute("patientUserId");
        session.removeAttribute("staffMode");
        return "redirect:/dashboard";
    }

    @GetMapping("/sos")
    public String sos(HttpSession session, Model model) {
        UUID patientUserId = requireReadOnlyPatient(session);
        PatientProfile profile = patientProfileService.getPatientProfile(patientUserId).orElse(new PatientProfile());
        model.addAttribute("profile", profile);
        model.addAttribute("emergencyContacts", patientProfileService.getEmergencyContacts(patientUserId));
        model.addAttribute("contact", patientProfileService.getContactDemographic(patientUserId).orElse(null));
        model.addAttribute("sosMessage", patientProfileService.sosMessageFor(patientUserId));
        model.addAttribute("cancelUrl", "/readonly/profile");
        return "dashboard/sos";
    }

    @GetMapping("/emergency-info")
    public String emergencyInfo(HttpSession session, Model model) {
        UUID patientUserId = requireReadOnlyPatient(session);
        PatientProfile profile = patientProfileService.getPatientProfile(patientUserId).orElse(new PatientProfile());
        List<EmergencyContact> emergencyContacts = patientProfileService.getEmergencyContacts(patientUserId);

        model.addAttribute("profile", profile);
        model.addAttribute("age", calculateAge(profile));
        model.addAttribute("emergencyContacts", emergencyContacts);
        model.addAttribute("primaryEmergencyContact", emergencyContacts.isEmpty() ? null : emergencyContacts.get(0));
        model.addAttribute("sosMessage", patientProfileService.sosMessageFor(patientUserId));
        model.addAttribute("cancelUrl", "/readonly/profile");
        model.addAttribute("sosUrl", "/readonly/sos");
        return "dashboard/emergency-info";
    }

    private UUID requireReadOnlyPatient(HttpSession session) {
        UUID patientUserId = (UUID) session.getAttribute("patientUserId");
        if (patientUserId == null || !"READ_ONLY".equals(session.getAttribute("userType"))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return patientUserId;
    }

    private Integer calculateAge(PatientProfile profile) {
        if (profile.getDateOfBirth() == null) {
            return null;
        }
        return Period.between(profile.getDateOfBirth(), LocalDate.now()).getYears();
    }
}
