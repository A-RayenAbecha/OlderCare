"use server";

import { redirect } from "next/navigation";
import { clearSession, requirePatient, requireReadOnly, setSession } from "@/lib/auth";
import {
  addAppointment,
  addMedication,
  addVaccine,
  createPatient,
  findUserByBraceletCode,
  touchLogin,
  updateContactAndSos,
  updateIdentity,
  updateMedication
} from "@/lib/data";

function encodedError(message) {
  return encodeURIComponent(message || "Une erreur est survenue.");
}

export async function registerPatientAction(formData) {
  let userId;
  try {
    userId = await createPatient(formData);
  } catch (error) {
    redirect(`/auth/signup/patient?error=${encodedError(error.message)}`);
  }
  await setSession({ role: "PATIENT", userId });
  redirect("/dashboard?bracelet=connected");
}

export async function loginBraceletAction(formData) {
  const user = await findUserByBraceletCode(formData.get("code"));
  if (!user) {
    redirect("/auth/login-code-page?error=Code%20bracelet%20invalide.");
  }
  await touchLogin(user.id);
  await setSession({ role: "PORTAL", userId: user.id });
  redirect("/auth/portal?bracelet=connected");
}

export async function portalPatientAction() {
  const session = await import("@/lib/auth").then((module) => module.getSession());
  if (!session?.userId || session.role !== "PORTAL") redirect("/auth/login-code-page");
  await setSession({ role: "PATIENT", userId: session.userId });
  redirect("/dashboard");
}

export async function portalStaffAction() {
  const session = await import("@/lib/auth").then((module) => module.getSession());
  if (!session?.userId || session.role !== "PORTAL") redirect("/auth/login-code-page");
  await setSession({ role: "READ_ONLY", patientUserId: session.userId, staffMode: true });
  redirect("/readonly/profile");
}

export async function portalOtherAction() {
  const session = await import("@/lib/auth").then((module) => module.getSession());
  if (!session?.userId || session.role !== "PORTAL") redirect("/auth/login-code-page");
  await setSession({ role: "READ_ONLY", patientUserId: session.userId, staffMode: false });
  redirect("/readonly/profile");
}

export async function unlockStaffAction(formData) {
  const session = await requireReadOnly();
  if (!session.staffMode) redirect("/readonly/profile?error=Acces%20interdit.");
  if (String(formData.get("staffAccessCode") || "") !== "accesspatient123") {
    redirect("/readonly/profile?error=Code%20d%27acces%20invalide.");
  }
  await setSession({ role: "PATIENT", userId: session.patientUserId });
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/auth/welcome");
}

export async function saveIdentityAction(formData) {
  const userId = await requirePatient();
  await updateIdentity(userId, formData);
  redirect("/dashboard");
}

export async function saveContactAction(formData) {
  const userId = await requirePatient();
  try {
    await updateContactAndSos(userId, formData);
  } catch (error) {
    redirect(`/profile/setup?step=2&error=${encodedError(error.message)}`);
  }
  redirect("/dashboard");
}

export async function addMedicationAction(formData) {
  const userId = await requirePatient();
  await addMedication(userId, formData);
  redirect("/dashboard/medications");
}

export async function updateMedicationAction(formData) {
  const userId = await requirePatient();
  await updateMedication(userId, formData);
  redirect("/dashboard/medications");
}

export async function addAppointmentAction(formData) {
  const userId = await requirePatient();
  try {
    await addAppointment(userId, formData);
  } catch (error) {
    redirect(`/dashboard/appointments?error=${encodedError(error.message)}`);
  }
  redirect("/dashboard/appointments");
}

export async function addVaccineAction(formData) {
  const userId = await requirePatient();
  await addVaccine(userId, formData);
  redirect("/dashboard/vaccines");
}
