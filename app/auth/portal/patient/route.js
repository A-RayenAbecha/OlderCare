import { NextResponse } from "next/server";
import { getSession, setSession } from "@/lib/auth";

export async function POST(request) {
  const session = await getSession();
  if (!session?.userId || session.role !== "PORTAL") {
    return NextResponse.redirect(new URL("/auth/login-code-page", request.url), 303);
  }
  await setSession({ role: "PATIENT", userId: session.userId });
  return NextResponse.redirect(new URL("/dashboard", request.url), 303);
}
