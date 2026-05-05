import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPatientBundle } from "@/lib/data";
import { sosMessage } from "@/lib/format";

export async function POST(request) {
  const session = await getSession();
  const userId = session?.role === "PATIENT" ? session.userId : session?.patientUserId;
  if (!userId) {
    return NextResponse.json({ statusMessage: "Session non autorisée." }, { status: 401 });
  }

  const formData = await request.formData();
  const latitude = formData.get("latitude");
  const longitude = formData.get("longitude");
  const locationLink = latitude && longitude ? `https://www.google.com/maps?q=${latitude},${longitude}` : "";
  const bundle = await getPatientBundle(userId);
  const message = `${sosMessage(bundle.profile)}\nLocalisation : ${locationLink || "indisponible"}`;
  const recipients = bundle.emergencyContacts.map((contact) => contact.phone_number).filter(Boolean);

  return NextResponse.json({
    message,
    locationLink,
    recipients,
    recipientCount: recipients.length,
    statusMessage: "Message SOS livré avec succès aux contacts d'urgence."
  });
}
