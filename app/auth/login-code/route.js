import { NextResponse } from "next/server";
import { setSession } from "@/lib/auth";
import { findUserByBraceletCode, touchLogin } from "@/lib/data";

export async function POST(request) {
  const formData = await request.formData();
  const user = await findUserByBraceletCode(formData.get("code"));
  if (!user) {
    return NextResponse.redirect(new URL("/auth/login-code-page?error=Code%20bracelet%20invalide.", request.url), 303);
  }
  await touchLogin(user.id);
  await setSession({ role: "PORTAL", userId: user.id });
  return NextResponse.redirect(new URL("/auth/portal?bracelet=connected", request.url), 303);
}
