package com.oldercare.controller;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

@ControllerAdvice
public class ReferenceDataAdvice {

    private final List<String> nationalities = Arrays.stream(Locale.getISOCountries())
            .map(countryCode -> new Locale.Builder().setRegion(countryCode).build().getDisplayCountry(Locale.FRENCH))
            .filter(country -> !country.isBlank())
            .distinct()
            .sorted()
            .toList();

    @ModelAttribute("nationalities")
    public List<String> nationalities() {
        return nationalities;
    }

    @ModelAttribute("socialSecurityOptions")
    public List<String> socialSecurityOptions() {
        return List.of("CNAM", "CNSS", "Privé", "Aucune");
    }

    @ModelAttribute("bloodTypeOptions")
    public List<String> bloodTypeOptions() {
        return List.of("Inconnu", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-");
    }
}
