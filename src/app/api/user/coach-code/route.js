import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthPayload } from "@/lib/auth-api";

export async function PATCH(request) {
  const auth = getAuthPayload(request);
  if (!auth) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (auth.role !== "fighter") {
    return NextResponse.json({ message: "Only fighters can link a coach code." }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });
  }

  const raw = typeof body?.coachCode === "string" ? body.coachCode.trim() : "";
  if (!raw) {
    return NextResponse.json({ message: "Coach code is required." }, { status: 400 });
  }

  const code = raw.slice(0, 32);

  try {
    const [coaches] = await db.execute(
      "SELECT id FROM users WHERE role = ? AND coach_code = ?",
      ["coach", code],
    );
    if (!coaches.length) {
      return NextResponse.json({ message: "That coach code was not found." }, { status: 400 });
    }

    await db.execute("UPDATE users SET coach_code = ? WHERE id = ? AND role = ?", [
      code,
      auth.id,
      "fighter",
    ]);

    return NextResponse.json({ success: true, coach_code: code });
  } catch (error) {
    console.error("PATCH /api/user/coach-code:", error);
    return NextResponse.json({ message: "Could not save coach code." }, { status: 500 });
  }
}
