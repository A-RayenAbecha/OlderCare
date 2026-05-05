import { NextResponse } from "next/server";
import { applySessionCookie, getSession, verifyPortalToken } from "@/lib/auth";

async function portalUserId(request) {
  const session = await getSession();
  if (session?.userId && session.role === "PORTAL") return session.userId;
  const formData = await request.formData();
  return verifyPortalToken(formData.get("portalToken"));
}

export async function POST(request) {
  const userId = await portalUserId(request);
  if (!userId) {
    return NextResponse.redirect(new URL("/auth/login-code-page", request.url), 303);
  }
  const response = NextResponse.redirect(new URL("/dashboard", request.url), 303);
  return applySessionCookie(response, { role: "PATIENT", userId });
}
