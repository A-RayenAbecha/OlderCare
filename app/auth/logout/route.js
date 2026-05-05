import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

export async function GET(request) {
  await clearSession();
  return NextResponse.redirect(new URL("/auth/welcome", request.url), 303);
}

export async function POST(request) {
  return GET(request);
}
