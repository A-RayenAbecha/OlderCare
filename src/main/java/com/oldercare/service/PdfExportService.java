package com.oldercare.service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.oldercare.entity.AllergiesLifestyle;
import com.oldercare.entity.Appointment;
import com.oldercare.entity.ContactDemographic;
import com.oldercare.entity.EmergencyContact;
import com.oldercare.entity.MedicalHistory;
import com.oldercare.entity.Medication;
import com.oldercare.entity.PatientProfile;
import com.oldercare.entity.Vaccine;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class PdfExportService {
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATE_TIME_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final Color BLUE = new Color(21, 87, 245);
    private static final Color SOFT_BLUE = new Color(232, 238, 255);
    private static final Color LIGHT_GRAY = new Color(245, 247, 252);
    private static final Font TITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, BLUE);
    private static final Font SECTION_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, new Color(24, 30, 45));
    private static final Font LABEL_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(88, 96, 115));
    private static final Font BODY_FONT = FontFactory.getFont(FontFactory.HELVETICA, 10, new Color(32, 39, 54));
    private static final Font BODY_BOLD_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new Color(32, 39, 54));
    private static final Font MUTED_FONT = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(110, 119, 138));

    public byte[] buildPatientMedicalPdf(PatientProfile profile,
                                         ContactDemographic contact,
                                         MedicalHistory history,
                                         AllergiesLifestyle lifestyle,
                                         List<EmergencyContact> emergencyContacts,
                                         List<Medication> medications,
                                         List<Vaccine> vaccines,
                                         List<Appointment> appointments,
                                         Integer age) {
        try {
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 40, 40, 38, 38);
            PdfWriter.getInstance(document, output);
            document.open();

            addHeader(document, profile, age);
            addIdentity(document, profile, contact, age);
            addEmergencyContacts(document, emergencyContacts);
            addMedicalHistory(document, history);
            addAllergiesLifestyle(document, lifestyle);
            addMedications(document, medications);
            addVaccines(document, vaccines);
            addAppointments(document, appointments);

            Paragraph footer = new Paragraph("Genere par OlderCare", MUTED_FONT);
            footer.setSpacingBefore(18);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return output.toByteArray();
        } catch (DocumentException exception) {
            throw new IllegalStateException("Impossible de generer le PDF medical du patient", exception);
        }
    }

    public String fileNameFor(PatientProfile profile) {
        String name = value(profile.getFirstName()) + "-" + value(profile.getSurname());
        String sanitized = name.toLowerCase()
                .replaceAll("[^a-z0-9._-]+", "-")
                .replaceAll("-+", "-")
                .replaceAll("(^-|-$)", "");
        if (sanitized.isBlank() || "non-renseigne-non-renseigne".equals(sanitized)) {
            sanitized = "patient";
        }
        return "oldercare-medical-profile-" + sanitized + ".pdf";
    }

    private void addHeader(Document document, PatientProfile profile, Integer age) throws DocumentException {
        Paragraph title = new Paragraph("Fiche medicale OlderCare", TITLE_FONT);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        Paragraph subtitle = new Paragraph(fullName(profile) + " | Age : " + value(age) + " | Sexe : " + value(profile.getGender()), MUTED_FONT);
        subtitle.setAlignment(Element.ALIGN_CENTER);
        subtitle.setSpacingAfter(14);
        document.add(subtitle);
    }

    private void addIdentity(Document document, PatientProfile profile, ContactDemographic contact, Integer age) throws DocumentException {
        addSectionTitle(document, "Identite du patient");
        PdfPTable table = twoColumnTable();
        addRow(table, "Nom", fullName(profile));
        addRow(table, "Age", value(age));
        addRow(table, "Sexe", value(profile.getGender()));
        addRow(table, "Date de naissance", date(profile.getDateOfBirth()));
        addRow(table, "Groupe sanguin", value(profile.getBloodType()));
        addRow(table, "Situation familiale", value(profile.getMaritalStatus()));
        addRow(table, "Nationalite", value(profile.getNationality()));
        addRow(table, "Telephone", value(contact.getPhoneNumber()));
        addRow(table, "Adresse", value(contact.getAddress()));
        addRow(table, "Region", value(contact.getRegion()));
        addRow(table, "Code postal", value(contact.getPostalCode()));
        addRow(table, "Couverture sociale", value(contact.getSocialSecurityType()));
        document.add(table);
    }

    private void addEmergencyContacts(Document document, List<EmergencyContact> contacts) throws DocumentException {
        addSectionTitle(document, "Contacts d'urgence");
        if (contacts == null || contacts.isEmpty()) {
            addBody(document, "Aucun contact d'urgence enregistre.");
            return;
        }

        PdfPTable table = table(4);
        addHeaderCells(table, "Nom", "Lien", "Telephone", "Residence");
        for (EmergencyContact contact : contacts) {
            addBodyCell(table, value(contact.getFullName()));
            addBodyCell(table, value(contact.getRelationship()));
            addBodyCell(table, value(contact.getPhoneNumber()));
            addBodyCell(table, value(contact.getResidence()));
        }
        document.add(table);
    }

    private void addMedicalHistory(Document document, MedicalHistory history) throws DocumentException {
        addSectionTitle(document, "Antecedents medicaux");
        addTextBlock(document, "Pathologies chroniques", history.getChronicConditions());
        addTextBlock(document, "Antecedents chirurgicaux", history.getSurgicalProcedures());
        addTextBlock(document, "Antecedents gyneco-obstetriques", history.getObGynHistory());
    }

    private void addAllergiesLifestyle(Document document, AllergiesLifestyle lifestyle) throws DocumentException {
        addSectionTitle(document, "Allergies et mode de vie");
        PdfPTable table = twoColumnTable();
        addRow(table, "Allergies medicamenteuses", value(lifestyle.getDrugAllergies()));
        addRow(table, "Autres allergies", value(lifestyle.getOtherAllergies()));
        addRow(table, "Tabac", value(lifestyle.getSmokingStatus()));
        addRow(table, "Alcool", value(lifestyle.getAlcoholConsumption()));
        document.add(table);
    }

    private void addMedications(Document document, List<Medication> medications) throws DocumentException {
        addSectionTitle(document, "Traitements actuels et passes");
        if (medications == null || medications.isEmpty()) {
            addBody(document, "Aucun medicament enregistre.");
            return;
        }

        PdfPTable table = table(5);
        addHeaderCells(table, "Nom", "Dosage", "Frequence", "Debut", "Fin");
        for (Medication medication : medications) {
            addBodyCell(table, value(medication.getName()));
            addBodyCell(table, value(medication.getDosage()));
            addBodyCell(table, value(medication.getFrequency()));
            addBodyCell(table, date(medication.getStartDate()));
            addBodyCell(table, date(medication.getEndDate()));
        }
        document.add(table);
    }

    private void addVaccines(Document document, List<Vaccine> vaccines) throws DocumentException {
        addSectionTitle(document, "Vaccins");
        if (vaccines == null || vaccines.isEmpty()) {
            addBody(document, "Aucun vaccin enregistre.");
            return;
        }

        PdfPTable table = table(4);
        addHeaderCells(table, "Vaccin", "Date", "Lieu", "Prochain rappel");
        for (Vaccine vaccine : vaccines) {
            addBodyCell(table, value(vaccine.getVaccineName()));
            addBodyCell(table, date(vaccine.getDateAdministered()));
            addBodyCell(table, value(vaccine.getLocation()));
            addBodyCell(table, date(vaccine.getNextReminderDate()));
        }
        document.add(table);
    }

    private void addAppointments(Document document, List<Appointment> appointments) throws DocumentException {
        addSectionTitle(document, "Rendez-vous");
        if (appointments == null || appointments.isEmpty()) {
            addBody(document, "Aucun rendez-vous enregistre.");
            return;
        }

        PdfPTable table = table(5);
        addHeaderCells(table, "Medecin", "Specialite", "Date", "Lieu", "Statut");
        for (Appointment appointment : appointments) {
            addBodyCell(table, value(appointment.getDoctorName()));
            addBodyCell(table, value(appointment.getSpecialty()));
            addBodyCell(table, dateTime(appointment.getAppointmentDate()));
            addBodyCell(table, value(appointment.getClinicLocation()));
            addBodyCell(table, value(appointment.getStatus()));
        }
        document.add(table);
    }

    private void addSectionTitle(Document document, String title) throws DocumentException {
        Paragraph paragraph = new Paragraph(title, SECTION_FONT);
        paragraph.setSpacingBefore(12);
        paragraph.setSpacingAfter(6);
        document.add(paragraph);
    }

    private void addTextBlock(Document document, String label, String text) throws DocumentException {
        PdfPTable table = table(1);
        PdfPCell labelCell = new PdfPCell(new Phrase(label, LABEL_FONT));
        labelCell.setBackgroundColor(SOFT_BLUE);
        labelCell.setBorderColor(Color.WHITE);
        labelCell.setPadding(7);
        table.addCell(labelCell);

        PdfPCell bodyCell = new PdfPCell(new Phrase(value(text), BODY_FONT));
        bodyCell.setBackgroundColor(Color.WHITE);
        bodyCell.setBorderColor(new Color(224, 229, 240));
        bodyCell.setPadding(9);
        table.addCell(bodyCell);
        document.add(table);
    }

    private void addBody(Document document, String text) throws DocumentException {
        Paragraph paragraph = new Paragraph(text, BODY_FONT);
        paragraph.setSpacingAfter(4);
        document.add(paragraph);
    }

    private PdfPTable twoColumnTable() {
        PdfPTable table = table(2);
        try {
            table.setWidths(new float[] { 1.1f, 2.2f });
        } catch (DocumentException ignored) {
            // OpenPDF only throws here for invalid width definitions; the fallback layout is acceptable.
        }
        return table;
    }

    private PdfPTable table(int columns) {
        PdfPTable table = new PdfPTable(columns);
        table.setWidthPercentage(100);
        table.setSpacingAfter(8);
        return table;
    }

    private void addRow(PdfPTable table, String label, String value) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, LABEL_FONT));
        labelCell.setBackgroundColor(LIGHT_GRAY);
        labelCell.setBorderColor(Color.WHITE);
        labelCell.setPadding(7);
        table.addCell(labelCell);
        addBodyCell(table, value);
    }

    private void addHeaderCells(PdfPTable table, String... labels) {
        for (String label : labels) {
            PdfPCell cell = new PdfPCell(new Phrase(label, BODY_BOLD_FONT));
            cell.setBackgroundColor(SOFT_BLUE);
            cell.setBorderColor(Color.WHITE);
            cell.setPadding(7);
            table.addCell(cell);
        }
    }

    private void addBodyCell(PdfPTable table, String value) {
        PdfPCell cell = new PdfPCell(new Phrase(value(value), BODY_FONT));
        cell.setBackgroundColor(Color.WHITE);
        cell.setBorderColor(new Color(224, 229, 240));
        cell.setPadding(7);
        table.addCell(cell);
    }

    private String fullName(PatientProfile profile) {
        String firstName = emptyToBlank(profile.getFirstName());
        String surname = emptyToBlank(profile.getSurname());
        String fullName = (firstName + " " + surname).trim();
        return fullName.isBlank() ? "Patient" : fullName;
    }

    private String value(Object value) {
        if (value == null || value.toString().isBlank()) {
            return "Non renseigne";
        }
        return translateValue(value.toString());
    }

    private String emptyToBlank(String value) {
        return value == null ? "" : value.trim();
    }

    private String date(LocalDate value) {
        return value == null ? "Non renseigne" : value.format(DATE_FORMAT);
    }

    private String dateTime(LocalDateTime value) {
        return value == null ? "Non renseigne" : value.format(DATE_TIME_FORMAT);
    }

    private String translateValue(String raw) {
        return switch (raw) {
            case "MALE" -> "Homme";
            case "FEMALE" -> "Femme";
            case "SINGLE" -> "Celibataire";
            case "MARRIED" -> "Marie(e)";
            case "DIVORCED" -> "Divorce(e)";
            case "WIDOWED" -> "Veuf/Veuve";
            case "SCHEDULED" -> "Planifie";
            default -> raw
                    .replace("High blood pressure", "Hypertension arterielle")
                    .replace("High cholesterol", "Hypercholesterolemie")
                    .replace("Heart disease", "Maladie cardiaque")
                    .replace("Stroke", "AVC")
                    .replace("Diabetes Type 1", "Diabete type 1")
                    .replace("Diabetes Type 2", "Diabete type 2")
                    .replace("Gestational diabetes", "Diabete gestationnel")
                    .replace("Gestational Diabetes", "Diabete gestationnel")
                    .replace("Thyroid disorders", "Troubles thyroidiens")
                    .replace("Asthma", "Asthme")
                    .replace("COPD", "BPCO")
                    .replace("Sleep Apnea", "Apnee du sommeil")
                    .replace("GERD", "RGO")
                    .replace("IBS", "SII")
                    .replace("Epilepsy/Seizures", "Epilepsie/Convulsions")
                    .replace("Multiple Sclerosis", "Sclerose en plaques")
                    .replace("Anxiety", "Anxiete")
                    .replace("Depression", "Depression")
                    .replace("PTSD", "TSPT")
                    .replace("Appendectomy", "Appendicectomie")
                    .replace("Cholecystectomy", "Cholecystectomie")
                    .replace("Hernia repair", "Reparation de hernie")
                    .replace("Knee replacement", "Prothese du genou")
                    .replace("Hip replacement", "Prothese de hanche")
                    .replace("Spinal fusion", "Arthrodese vertebrale")
                    .replace("Heart bypass", "Pontage cardiaque")
                    .replace("Stent placement", "Pose de stent")
                    .replace("Tonsillectomy", "Amygdalectomie")
                    .replace("Adenoidectomy", "Adenoidectomie")
                    .replace("Cataract surgery", "Chirurgie de la cataracte")
                    .replace("C-section", "Cesarienne")
                    .replace("Pregnancies:", "Grossesses :")
                    .replace("Births:", "Accouchements :")
                    .replace("Preeclampsia", "Preeclampsie")
                    .replace("Endometriosis", "Endometriose")
                    .replace("PCOS", "SOPK");
        };
    }
}
