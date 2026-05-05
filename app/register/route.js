import { NextResponse } from "next/server";
import { applySessionCookie } from "@/lib/auth";
import { createPatient } from "@/lib/data";

export async function POST(request) {
  const formData = await request.formData();
  try {
    const userId = await createPatient(formData);
    const response = NextResponse.redirect(new URL("/dashboard?bracelet=connected", request.url), 303);
    return applySessionCookie(response, { role: "PATIENT", userId });
  } catch (error) {
    return NextResponse.redirect(
      new URL(`/auth/signup/patient?error=${encodeURIComponent(error.message || "Inscription impossible.")}`, request.url),
      303
    );
  }
}
