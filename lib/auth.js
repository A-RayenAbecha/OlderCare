import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const COOKIE_NAME = "oldercare_session";

function secret() {
  return process.env.JWT_SECRET || "oldercare-next-local-dev-secret-change-me";
}

function base64url(value) {
  return Buffer.from(value).toString("base64url");
}

function sign(payload) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  };
}

export function createSessionToken(session) {
  const body = base64url(JSON.stringify({
    ...session,
    iat: Date.now()
  }));
  return `${body}.${sign(body)}`;
}

export function applySessionCookie(response, session) {
  response.cookies.set(COOKIE_NAME, createSessionToken(session), sessionCookieOptions());
  return response;
}

export async function setSession(session) {
  const store = await cookies();
  store.set(COOKIE_NAME, createSessionToken(session), sessionCookieOptions());
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token || !token.includes(".")) return null;
  const [body, signature] = token.split(".");
  const expected = sign(body);
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export async function requirePatient() {
  const session = await getSession();
  if (!session || session.role !== "PATIENT" || !session.userId) {
    redirect("/auth/login-code-page");
  }
  return session.userId;
}

export async function requireReadOnly() {
  const session = await getSession();
  if (!session || session.role !== "READ_ONLY" || !session.patientUserId) {
    redirect("/auth/login-code-page");
  }
  return session;
}

export async function redirectIfLoggedIn() {
  const session = await getSession();
  if (session?.role === "PATIENT") redirect("/dashboard");
  if (session?.role === "READ_ONLY") redirect("/readonly/profile");
  if (session?.role === "PORTAL") redirect("/auth/portal");
}
