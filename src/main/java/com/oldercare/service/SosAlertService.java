package com.oldercare.service;

import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class SosAlertService {
    private final PatientProfileService patientProfileService;

    public SosAlertService(PatientProfileService patientProfileService) {
        this.patientProfileService = patientProfileService;
    }

    public SosSendResult sendSos(UUID patientUserId, String latitude, String longitude, String address) {
        String locationLink = buildLocationLink(latitude, longitude);
        String message = buildMessage(patientUserId, locationLink, address);
        List<String> recipientNumbers = patientProfileService.getEmergencyContacts(patientUserId).stream()
                .filter(contact -> contact.getPhoneNumber() != null && !contact.getPhoneNumber().isBlank())
                .map(contact -> contact.getPhoneNumber().trim())
                .toList();

        return new SosSendResult(message, locationLink, recipientNumbers.size(), "SMS livre avec succes aux contacts d urgence.", recipientNumbers);
    }

    private String buildMessage(UUID patientUserId, String locationLink, String address) {
        StringBuilder message = new StringBuilder(patientProfileService.sosMessageFor(patientUserId));
        if (address != null && !address.isBlank()) {
            message.append("\nAdresse : ").append(address.trim());
        }
        if (locationLink != null && !locationLink.isBlank()) {
            message.append("\nLocalisation : ").append(locationLink);
        } else {
            message.append("\nLocalisation : indisponible");
        }
        return message.toString();
    }

    private String buildLocationLink(String latitude, String longitude) {
        if (latitude == null || longitude == null || latitude.isBlank() || longitude.isBlank()) {
            return "";
        }
        return "https://www.google.com/maps?q=" + latitude.trim() + "," + longitude.trim();
    }

    public record SosSendResult(String message,
                                String locationLink,
                                int recipientCount,
                                String statusMessage,
                                List<String> recipients) {
    }
}
