package com.oldercare.service;

import com.oldercare.entity.User;
import com.oldercare.repository.UserRepository;
import com.oldercare.security.JwtTokenProvider;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository, JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public User registerPatient(String firstName,
                                String surname,
                                String email,
                                String braceletCode) {
        String normalizedBraceletCode = normalizeBraceletCode(braceletCode);
        String normalizedEmail = normalizeEmail(email);

        if (normalizedBraceletCode.isBlank()) {
            throw new IllegalArgumentException("Le code bracelet est obligatoire.");
        }
        if (normalizedEmail.isBlank()) {
            throw new IllegalArgumentException("L'e-mail est obligatoire.");
        }
        if (userRepository.existsByBraceletCode(normalizedBraceletCode)) {
            throw new IllegalArgumentException("Ce code bracelet est deja connecte a un autre patient.");
        }
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalArgumentException("Cet e-mail est deja enregistre.");
        }

        User user = User.builder()
                .fullName(fullName(firstName, surname))
                .email(normalizedEmail)
                .braceletCode(normalizedBraceletCode)
                .qrCode(qrValueFor(normalizedBraceletCode))
                .userType("PATIENT")
                .deviceToken("PENDING")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        try {
            User savedUser = userRepository.save(user);
            savedUser.setDeviceToken(jwtTokenProvider.generateToken(savedUser.getId(), "PATIENT"));
            return userRepository.save(savedUser);
        } catch (DataIntegrityViolationException exception) {
            throw new IllegalArgumentException("Ce code bracelet ou cet e-mail est deja enregistre.", exception);
        }
    }

    public Optional<User> loginByBraceletCode(String braceletCode) {
        String normalizedBraceletCode = normalizeBraceletCode(braceletCode);
        if (normalizedBraceletCode.isBlank()) {
            return Optional.empty();
        }

        Optional<User> user = userRepository.findByBraceletCode(normalizedBraceletCode)
                .filter(foundUser -> "PATIENT".equals(foundUser.getUserType()));
        if (user.isPresent()) {
            User foundUser = user.get();
            foundUser.setLastLogin(LocalDateTime.now());
            foundUser.setDeviceToken(jwtTokenProvider.generateToken(foundUser.getId(), "PATIENT"));
            return Optional.of(userRepository.save(foundUser));
        }
        return Optional.empty();
    }

    public Optional<User> validateDeviceToken(String deviceToken) {
        if (jwtTokenProvider.validateToken(deviceToken)) {
            String userId = jwtTokenProvider.getUserIdFromToken(deviceToken);
            return userRepository.findById(UUID.fromString(userId));
        }
        return Optional.empty();
    }

    private String normalizeBraceletCode(String braceletCode) {
        return braceletCode == null ? "" : braceletCode.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private String fullName(String firstName, String surname) {
        String value = ((firstName == null ? "" : firstName.trim()) + " "
                + (surname == null ? "" : surname.trim())).trim();
        return value.isBlank() ? "Patient" : value;
    }

    private String qrValueFor(String braceletCode) {
        return "OLDERCARE-BRACELET:" + braceletCode;
    }
}
