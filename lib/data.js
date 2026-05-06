import crypto from "node:crypto";
import { query, transaction } from "@/lib/db";
import { defaultSosMessage, normalizeBraceletCode } from "@/lib/format";

const now = () => new Date();

function text(formData, key, fallback = "") {
  return String(formData.get(key) ?? fallback).trim();
}

function number(formData, key, fallback = 0) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : fallback;
}

function list(formData, key) {
  return formData.getAll(key).map((value) => String(value || "").trim());
}

function normalizeTunisianPhone(value, { required = false, label = "numéro de téléphone" } = {}) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    if (required) throw new Error(`Le ${label} est obligatoire.`);
    return "";
  }

  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00216")) digits = digits.slice(5);
  else if (digits.startsWith("216")) digits = digits.slice(3);

  if (digits.length !== 8) {
    throw new Error(`${label} invalide. Utilisez le format +216 23 444 194.`);
  }

  return `+216 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
}

function phone(formData, key, options) {
  return normalizeTunisianPhone(formData.get(key), options);
}

function phoneList(formData, key) {
  return formData.getAll(key).map((value) => normalizeTunisianPhone(value));
}

export async function findUserByBraceletCode(code) {
  const braceletCode = normalizeBraceletCode(code);
  if (!braceletCode) return null;
  const result = await query("select * from users where bracelet_code = $1 and user_type = 'PATIENT' limit 1", [braceletCode]);
  return result.rows[0] || null;
}

export async function touchLogin(userId) {
  await query("update users set last_login = $2, updated_at = $2 where id = $1", [userId, now()]);
}

export async function createPatient(formData) {
  const braceletCode = normalizeBraceletCode(text(formData, "braceletCode"));
  const email = text(formData, "email").toLowerCase();
  const firstName = text(formData, "firstName");
  const surname = text(formData, "surname");
  if (!braceletCode) throw new Error("Le code bracelet est obligatoire.");
  if (!email) throw new Error("L'e-mail est obligatoire.");

  const existing = await query(
    "select id from users where bracelet_code = $1 or lower(email) = lower($2) limit 1",
    [braceletCode, email]
  );
  if (existing.rowCount > 0) {
    throw new Error("Ce code bracelet ou cet e-mail est déjà enregistré.");
  }

  const userId = crypto.randomUUID();
  const userFullName = `${firstName} ${surname}`.trim() || "Patient";
  const createdAt = now();

  await transaction(async (client) => {
    await client.query(
      `insert into users (id, full_name, email, bracelet_code, qr_code, device_token, user_type, last_login, created_at, updated_at)
       values ($1,$2,$3,$4,$5,$6,'PATIENT',$7,$7,$7)`,
      [userId, userFullName, email, braceletCode, `OLDERCARE-BRACELET:${braceletCode}`, "NEXT_SESSION", createdAt]
    );
    await client.query(
      `insert into patient_profiles (id, user_id, surname, first_name, gender, date_of_birth, blood_type, marital_status, nationality, sos_message, profile_complete, created_at, updated_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true,$11,$11)`,
      [crypto.randomUUID(), userId, surname, firstName, text(formData, "gender"), text(formData, "dateOfBirth") || null, text(formData, "bloodType", "Inconnu"), text(formData, "maritalStatus"), text(formData, "nationality"), text(formData, "sosMessage", defaultSosMessage()), createdAt]
    );
    await client.query(
      `insert into contact_demographic (id, user_id, occupation, num_children, social_security_type, phone_number, region, address, postal_code, created_at, updated_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$10)`,
      [crypto.randomUUID(), userId, text(formData, "occupation"), number(formData, "numChildren"), text(formData, "socialSecurityType"), phone(formData, "phoneNumber", { required: true, label: "numéro de téléphone" }), text(formData, "region"), text(formData, "address"), text(formData, "postalCode"), createdAt]
    );
    await client.query(
      `insert into medical_history (id, user_id, chronic_conditions, surgical_procedures, ob_gyn_history, created_at, updated_at)
       values ($1,$2,$3,$4,$5,$6,$6)`,
      [crypto.randomUUID(), userId, text(formData, "chronicConditions"), text(formData, "surgicalProcedures"), text(formData, "obGynHistory"), createdAt]
    );
    await client.query(
      `insert into allergies_lifestyle (id, user_id, drug_allergies, other_allergies, smoking_status, alcohol_consumption, created_at, updated_at)
       values ($1,$2,$3,$4,$5,$6,$7,$7)`,
      [crypto.randomUUID(), userId, text(formData, "drugAllergies"), text(formData, "otherAllergies"), text(formData, "smokingStatus", "Jamais fumé"), text(formData, "alcoholConsumption", "Non buveur"), createdAt]
    );

    const names = list(formData, "emergencyName");
    const relations = list(formData, "emergencyRelationship");
    const phones = phoneList(formData, "emergencyPhone");
    const residences = list(formData, "emergencyResidence");
    for (let index = 0; index < 3; index++) {
      const hasContact = [names[index], relations[index], phones[index], residences[index]].some(Boolean);
      if (!hasContact) continue;
      await client.query(
        `insert into emergency_contacts (id, user_id, full_name, relationship, phone_number, residence, priority_order, created_at, updated_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$8)`,
        [crypto.randomUUID(), userId, names[index] || "", relations[index] || "", phones[index] || "", residences[index] || "", index + 1, createdAt]
      );
    }
  });

  return userId;
}

export async function getPatientBundle(userId) {
  const [
    profile,
    contact,
    history,
    lifestyle,
    emergencyContacts,
    medications,
    appointments,
    vaccines
  ] = await Promise.all([
    query("select * from patient_profiles where user_id = $1 limit 1", [userId]),
    query("select * from contact_demographic where user_id = $1 limit 1", [userId]),
    query("select * from medical_history where user_id = $1 limit 1", [userId]),
    query("select * from allergies_lifestyle where user_id = $1 limit 1", [userId]),
    query("select * from emergency_contacts where user_id = $1 order by priority_order asc", [userId]),
    query("select * from medications where user_id = $1 order by created_at desc", [userId]),
    query("select * from appointments where user_id = $1 order by appointment_date asc", [userId]),
    query("select * from vaccines where user_id = $1 order by date_administered desc nulls last", [userId])
  ]);

  return {
    profile: profile.rows[0] || {},
    contact: contact.rows[0] || {},
    history: history.rows[0] || {},
    lifestyle: lifestyle.rows[0] || {},
    emergencyContacts: emergencyContacts.rows,
    medications: medications.rows,
    appointments: appointments.rows,
    vaccines: vaccines.rows
  };
}

export async function updateIdentity(userId, formData) {
  await query(
    `update patient_profiles
     set surname=$2, first_name=$3, gender=$4, date_of_birth=$5, blood_type=$6, marital_status=$7, nationality=$8, updated_at=$9
     where user_id=$1`,
    [userId, text(formData, "surname"), text(formData, "firstName"), text(formData, "gender"), text(formData, "dateOfBirth") || null, text(formData, "bloodType"), text(formData, "maritalStatus"), text(formData, "nationality"), now()]
  );
  await query("update users set full_name=$2, updated_at=$3 where id=$1", [userId, `${text(formData, "firstName")} ${text(formData, "surname")}`.trim() || "Patient", now()]);
}

export async function updateContactAndSos(userId, formData) {
  const updatedAt = now();
  await query(
    `update contact_demographic set occupation=$2, num_children=$3, social_security_type=$4, phone_number=$5, region=$6, address=$7, postal_code=$8, updated_at=$9 where user_id=$1`,
    [userId, text(formData, "occupation"), number(formData, "numChildren"), text(formData, "socialSecurityType"), phone(formData, "phoneNumber", { required: true, label: "numéro de téléphone" }), text(formData, "region"), text(formData, "address"), text(formData, "postalCode"), updatedAt]
  );
  await query("update patient_profiles set sos_message=$2, updated_at=$3 where user_id=$1", [userId, text(formData, "sosMessage", defaultSosMessage()), updatedAt]);
  await query("delete from emergency_contacts where user_id=$1", [userId]);
  const names = list(formData, "emergencyName");
  const relations = list(formData, "emergencyRelationship");
  const phones = phoneList(formData, "emergencyPhone");
  const residences = list(formData, "emergencyResidence");
  for (let index = 0; index < 3; index++) {
    const hasContact = [names[index], relations[index], phones[index], residences[index]].some(Boolean);
    if (!hasContact) continue;
    await query(
      `insert into emergency_contacts (id, user_id, full_name, relationship, phone_number, residence, priority_order, created_at, updated_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$8)`,
      [crypto.randomUUID(), userId, names[index] || "", relations[index] || "", phones[index] || "", residences[index] || "", index + 1, updatedAt]
    );
  }
}

export async function updateMedicalHistory(userId, formData) {
  const existing = await query("select * from medical_history where user_id=$1 limit 1", [userId]);
  const current = existing.rows[0] || {};
  const updatedAt = now();
  const chronicConditions = formData.has("chronicConditions") ? text(formData, "chronicConditions") : (current.chronic_conditions || "");
  const surgicalProcedures = formData.has("surgicalProcedures") ? text(formData, "surgicalProcedures") : (current.surgical_procedures || "");
  const obGynHistory = formData.has("obGynHistory") ? text(formData, "obGynHistory") : (current.ob_gyn_history || "");

  if (existing.rowCount === 0) {
    await query(
      `insert into medical_history (id, user_id, chronic_conditions, surgical_procedures, ob_gyn_history, created_at, updated_at)
       values ($1,$2,$3,$4,$5,$6,$6)`,
      [crypto.randomUUID(), userId, chronicConditions, surgicalProcedures, obGynHistory, updatedAt]
    );
    return;
  }
  await query(
    `update medical_history set chronic_conditions=$2, surgical_procedures=$3, ob_gyn_history=$4, updated_at=$5 where user_id=$1`,
    [userId, chronicConditions, surgicalProcedures, obGynHistory, updatedAt]
  );
}

export async function updateAllergiesLifestyle(userId, formData) {
  const existing = await query("select * from allergies_lifestyle where user_id=$1 limit 1", [userId]);
  const updatedAt = now();
  if (existing.rowCount === 0) {
    await query(
      `insert into allergies_lifestyle (id, user_id, drug_allergies, other_allergies, smoking_status, alcohol_consumption, created_at, updated_at)
       values ($1,$2,$3,$4,$5,$6,$7,$7)`,
      [crypto.randomUUID(), userId, text(formData, "drugAllergies"), text(formData, "otherAllergies"), text(formData, "smokingStatus"), text(formData, "alcoholConsumption"), updatedAt]
    );
  } else {
    await query(
      `update allergies_lifestyle set drug_allergies=$2, other_allergies=$3, smoking_status=$4, alcohol_consumption=$5, updated_at=$6 where user_id=$1`,
      [userId, text(formData, "drugAllergies"), text(formData, "otherAllergies"), text(formData, "smokingStatus"), text(formData, "alcoholConsumption"), updatedAt]
    );
  }
  await query("update patient_profiles set profile_complete=true, updated_at=$2 where user_id=$1", [userId, updatedAt]);
}

export async function addMedication(userId, formData) {
  await query(
    `insert into medications (id, user_id, name, dosage, frequency, start_date, created_at, updated_at)
     values ($1,$2,$3,$4,$5,$6,$7,$7)`,
    [crypto.randomUUID(), userId, text(formData, "name"), text(formData, "dosage"), text(formData, "frequency"), text(formData, "startDate") || null, now()]
  );
}

export async function updateMedication(userId, formData) {
  await query(
    `update medications
     set name=$3, dosage=$4, frequency=$5, start_date=$6, end_date=$7, updated_at=$8
     where id=$1 and user_id=$2`,
    [
      text(formData, "medicationId"),
      userId,
      text(formData, "name"),
      text(formData, "dosage"),
      text(formData, "frequency"),
      text(formData, "startDate") || null,
      text(formData, "endDate") || null,
      now()
    ]
  );
}

export async function addAppointment(userId, formData) {
  await query(
    `insert into appointments (id, user_id, doctor_name, specialty, appointment_date, status, clinic_location, phone_contact, created_at, updated_at)
     values ($1,$2,$3,$4,$5,'PLANIFIÉ',$6,$7,$8,$8)`,
    [crypto.randomUUID(), userId, text(formData, "doctorName"), text(formData, "specialty"), text(formData, "appointmentDate") || null, text(formData, "clinicLocation"), phone(formData, "phoneContact", { label: "téléphone du rendez-vous" }), now()]
  );
}

export async function addVaccine(userId, formData) {
  await query(
    `insert into vaccines (id, user_id, vaccine_name, date_administered, location, next_reminder_date, last_edited_by_user_id, created_at, updated_at)
     values ($1,$2,$3,$4,$5,$6,$2,$7,$7)`,
    [crypto.randomUUID(), userId, text(formData, "vaccineName"), text(formData, "dateAdministered") || null, text(formData, "location"), text(formData, "nextReminderDate") || null, now()]
  );
}
