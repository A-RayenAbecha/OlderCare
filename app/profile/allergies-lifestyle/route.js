import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateAllergiesLifestyle } from "@/lib/data";

export async function POST(request) {
  const session = await getSession();
  if (!session?.userId || session.role !== "PATIENT") {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }
  await updateAllergiesLifestyle(session.userId, await request.formData());
  return NextResponse.json({ ok: true });
}
