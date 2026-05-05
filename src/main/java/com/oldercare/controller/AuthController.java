package com.oldercare.controller;

import com.oldercare.entity.User;
import com.oldercare.service.AuthService;
import com.oldercare.service.PatientProfileService;
import jakarta.servlet.http.HttpSession;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class AuthController {

    private final AuthService authService;
    private final PatientProfileService patientProfileService;

    public AuthController(AuthService authService,
                          PatientProfileService patientProfileService) {
        this.authService = authService;
        this.patientProfileService = patientProfileService;
    }

    @GetMapping("/auth/welcome")
    public String welcome(HttpSession session) {
        String activeRedirect = redirectActiveSession(session);
        if (activeRedirect != null) {
            return activeRedirect;
        }
        return "auth/welcome";
    }

    @GetMapping("/auth/signup/patient")
    public String patientSignup(HttpSession session, Model model) {
        String activeRedirect = redirectActiveSession(session);
        if (activeRedirect != null) {
            return activeRedirect;
        }
        return "auth/signup-patient";
    }

    @PostMapping({ "/register", "/auth/signup/patient" })
    public String registerPatient(@RequestParam String surname,
                                  @RequestParam String firstName,
                                  @RequestParam String email,
                                  @RequestParam String braceletCode,
                                  @RequestParam String gender,
                                  @RequestParam String dateOfBirth,
                                  @RequestParam(defaultValue = "Inconnu") String bloodType,
                                  @RequestParam String maritalStatus,
                                  @RequestParam String nationality,
                                  @RequestParam String occupation,
                                  @RequestParam Integer numChildren,
                                  @RequestParam String socialSecurityType,
                                  @RequestParam String phoneNumber,
                                  @RequestParam String region,
                                  @RequestParam String address,
                                  @RequestParam String postalCode,
                                  @RequestParam(defaultValue = "") String chronicConditions,
                                  @RequestParam(defaultValue = "") String surgicalProcedures,
                                  @RequestParam(defaultValue = "") String obGynHistory,
                                  @RequestParam(defaultValue = "") String drugAllergies,
                                  @RequestParam(defaultValue = "") String otherAllergies,
                                  @RequestParam(defaultValue = "Jamais fume") String smokingStatus,
                                  @RequestParam(defaultValue = "Non buveur") String alcoholConsumption,
                                  @RequestParam(name = "emergencyName", required = false) List<String> emergencyNames,
                                  @RequestParam(name = "emergencyRelationship", required = false) List<String> emergencyRelationships,
                                  @RequestParam(name = "emergencyPhone", required = false) List<String> emergencyPhones,
                                  @RequestParam(name = "emergencyResidence", required = false) List<String> emergencyResidences,
                                  HttpSession session,
                                  Model model) {
        String activeRedirect = redirectActiveSession(session);
        if (activeRedirect != null) {
            return activeRedirect;
        }

        User user;
        try {
            user = authService.registerPatient(firstName, surname, email, braceletCode);
        } catch (IllegalArgumentException exception) {
            return signupError(model, exception.getMessage());
        }

        patientProfileService.createOrUpdatePatientProfile(
                user.getId(), surname, firstName, gender, LocalDate.parse(dateOfBirth),
                bloodType, maritalStatus, nationality);
        patientProfileService.createOrUpdateContactDemographic(
                user.getId(), occupation, numChildren, socialSecurityType, phoneNumber, region, address, postalCode);
        patientProfileService.createOrUpdateMedicalHistory(
                user.getId(), chronicConditions, surgicalProcedures, obGynHistory);
        patientProfileService.createOrUpdateAllergiesLifestyle(
                user.getId(), drugAllergies, otherAllergies, smokingStatus, alcoholConsumption);
        patientProfileService.replaceEmergencyContacts(
                user.getId(), emergencyNames, emergencyRelationships, emergencyPhones, emergencyResidences);
        patientProfileService.markProfileComplete(user.getId());

        setPatientSession(session, user);
        return "redirect:/dashboard?bracelet=connected";
    }

    @GetMapping("/auth/login-code-page")
    public String codeEntry(HttpSession session) {
        String activeRedirect = redirectActiveSession(session);
        if (activeRedirect != null) {
            return activeRedirect;
        }
        return "auth/code-entry";
    }

    @PostMapping("/auth/login-code")
    public String loginByCode(@RequestParam String code, HttpSession session, Model model) {
        String activeRedirect = redirectActiveSession(session);
        if (activeRedirect != null) {
            return activeRedirect;
        }
        Optional<User> user = authService.loginByBraceletCode(code);
        if (user.isEmpty()) {
            model.addAttribute("error", "Code bracelet invalide. Verifiez le code inscrit sur le bracelet.");
            return "auth/code-entry";
        }

        setPortalSession(session, user.get());
        return "redirect:/auth/portal?bracelet=connected";
    }

    @GetMapping("/auth/portal")
    public String loginPortal(HttpSession session) {
        if (session.getAttribute("portalPatientUserId") == null) {
            return redirectActiveSession(session) == null ? "redirect:/auth/login-code-page" : redirectActiveSession(session);
        }
        return "auth/portal";
    }

    @PostMapping("/auth/portal/patient")
    public String openPatientDashboard(HttpSession session) {
        UUID patientUserId = requirePortalPatient(session);
        session.setAttribute("userId", patientUserId);
        session.setAttribute("userType", "PATIENT");
        session.setAttribute("deviceToken", session.getAttribute("portalDeviceToken"));
        clearPortalSession(session);
        return "redirect:/dashboard";
    }

    @PostMapping("/auth/portal/staff")
    public String openStaffReadOnly(HttpSession session) {
        UUID patientUserId = requirePortalPatient(session);
        session.setAttribute("userId", patientUserId);
        session.setAttribute("patientUserId", patientUserId);
        session.setAttribute("userType", "READ_ONLY");
        session.setAttribute("staffMode", true);
        clearPortalSession(session);
        return "redirect:/readonly/profile";
    }

    @PostMapping("/auth/portal/autre")
    public String openOtherReadOnly(HttpSession session) {
        UUID patientUserId = requirePortalPatient(session);
        session.setAttribute("userId", patientUserId);
        session.setAttribute("patientUserId", patientUserId);
        session.setAttribute("userType", "READ_ONLY");
        session.setAttribute("staffMode", false);
        clearPortalSession(session);
        return "redirect:/readonly/profile";
    }

    @GetMapping("/auth/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/auth/welcome";
    }

    private String signupError(Model model, String error) {
        model.addAttribute("error", error);
        return "auth/signup-patient";
    }

    private void setPatientSession(HttpSession session, User user) {
        session.setAttribute("userId", user.getId());
        session.setAttribute("userType", "PATIENT");
        session.setAttribute("deviceToken", user.getDeviceToken());
    }

    private void setPortalSession(HttpSession session, User user) {
        session.setAttribute("portalPatientUserId", user.getId());
        session.setAttribute("portalDeviceToken", user.getDeviceToken());
        session.removeAttribute("userId");
        session.removeAttribute("patientUserId");
        session.removeAttribute("userType");
        session.removeAttribute("staffMode");
    }

    private UUID requirePortalPatient(HttpSession session) {
        UUID patientUserId = (UUID) session.getAttribute("portalPatientUserId");
        if (patientUserId == null) {
            throw new IllegalStateException("Aucune connexion bracelet en cours.");
        }
        return patientUserId;
    }

    private void clearPortalSession(HttpSession session) {
        session.removeAttribute("portalPatientUserId");
        session.removeAttribute("portalDeviceToken");
    }

    private String redirectActiveSession(HttpSession session) {
        if (session == null || session.getAttribute("userId") == null) {
            return null;
        }
        if ("PATIENT".equals(session.getAttribute("userType"))) {
            return "redirect:/dashboard";
        }
        if ("READ_ONLY".equals(session.getAttribute("userType"))) {
            return "redirect:/readonly/profile";
        }
        return null;
    }
}
