import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPatientBundle } from "@/lib/data";
import { calculateAge, fullName, genderLabel, splitMedicalValues } from "@/lib/format";

function escapePdf(value) {
  return String(value || "")
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)")
    .replace(/[^\x20-\x7E]/g, "?");
}

function makePdf(lines) {
  const content = lines.slice(0, 54).map((line, index) => {
    const y = 780 - index * 14;
    const size = index === 0 ? 18 : 10;
    return `BT /F1 ${size} Tf 50 ${y} Td (${escapePdf(line)}) Tj ET`;
  }).join("\n");
  const stream = Buffer.from(content, "ascii");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${stream.length} >> stream\n${content}\nendstream endobj`
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, "ascii"));
    pdf += `${object}\n`;
  }
  const xrefOffset = Buffer.byteLength(pdf, "ascii");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index < offsets.length; index++) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, "ascii");
}

export async function GET() {
  const session = await getSession();
  if (!session?.userId || session.role !== "PATIENT") {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  const bundle = await getPatientBundle(session.userId);
  const { profile, history, lifestyle, emergencyContacts, medications, vaccines, appointments } = bundle;
  const lines = [
    "Fiche medicale OlderCare",
    `Patient : ${fullName(profile)}`,
    `Age : ${calculateAge(profile.date_of_birth) || "Non renseigne"}`,
    `Sexe : ${genderLabel(profile.gender)}`,
    `Groupe sanguin : ${profile.blood_type || "Inconnu"}`,
    "",
    "Allergies et mode de vie",
    `Allergies medicamenteuses : ${lifestyle.drug_allergies || "Aucune"}`,
    `Autres allergies : ${lifestyle.other_allergies || "Aucune"}`,
    `Tabac : ${lifestyle.smoking_status || "Non renseigne"}`,
    `Alcool : ${lifestyle.alcohol_consumption || "Non renseigne"}`,
    "",
    "Historique medical",
    `Pathologies : ${splitMedicalValues(history.chronic_conditions).join(", ") || "Aucune"}`,
    `Chirurgies : ${splitMedicalValues(history.surgical_procedures).join(", ") || "Aucune"}`,
    `OB/GYN : ${splitMedicalValues(history.ob_gyn_history).join(", ") || "Non renseigne"}`,
    "",
    "Medicaments",
    ...(medications.length ? medications.map((item) => `- ${item.name} ${item.dosage || ""} ${item.frequency || ""}`) : ["Aucun medicament."]),
    "",
    "Vaccins",
    ...(vaccines.length ? vaccines.map((item) => `- ${item.vaccine_name}`) : ["Aucun vaccin."]),
    "",
    "Rendez-vous",
    ...(appointments.length ? appointments.map((item) => `- ${item.doctor_name || "Medecin"} ${item.appointment_date ? new Date(item.appointment_date).toLocaleString("fr-FR") : ""}`) : ["Aucun rendez-vous."]),
    "",
    "Contacts d'urgence",
    ...(emergencyContacts.length ? emergencyContacts.map((item) => `- ${item.full_name || "Contact"} : ${item.phone_number || "sans numero"}`) : ["Aucun contact."])
  ];

  return new NextResponse(makePdf(lines), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="fiche-medicale-${fullName(profile).replaceAll(" ", "-").toLowerCase()}.pdf"`
    }
  });
}
