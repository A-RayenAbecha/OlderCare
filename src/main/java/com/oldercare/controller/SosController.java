package com.oldercare.controller;

import com.oldercare.service.SosAlertService;
import jakarta.servlet.http.HttpSession;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.server.ResponseStatusException;

@Controller
public class SosController {
    private final SosAlertService sosAlertService;

    public SosController(SosAlertService sosAlertService) {
        this.sosAlertService = sosAlertService;
    }

    @PostMapping("/sos/send")
    @ResponseBody
    public ResponseEntity<SosAlertService.SosSendResult> sendSos(@RequestParam(required = false) String latitude,
                                                                 @RequestParam(required = false) String longitude,
                                                                 @RequestParam(required = false) String address,
                                                                 HttpSession session) {
        UUID patientUserId = resolvePatientUserId(session);
        return ResponseEntity.ok(sosAlertService.sendSos(patientUserId, latitude, longitude, address));
    }

    private UUID resolvePatientUserId(HttpSession session) {
        Object userType = session.getAttribute("userType");
        if ("PATIENT".equals(userType)) {
            UUID userId = (UUID) session.getAttribute("userId");
            if (userId != null) {
                return userId;
            }
        }
        if ("READ_ONLY".equals(userType)) {
            UUID patientUserId = (UUID) session.getAttribute("patientUserId");
            if (patientUserId != null) {
                return patientUserId;
            }
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
    }
}
