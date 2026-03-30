import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthPayload } from "@/lib/auth-api";

export async function GET(request) {
  const auth = getAuthPayload(request);
  if (!auth) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const [rows] = await db.execute(
      "SELECT id, first_name, last_name, email, role, coach_code FROM users WHERE id = ?",
      [auth.id],
    );
    const u = rows[0];
    if (!u) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const displayName = [u.first_name, u.last_name].filter(Boolean).join(" ").trim();

    return NextResponse.json({
      user: {
        id: u.id,
        name: displayName || u.email,
        email: u.email,
        role: u.role,
        coach_code: u.coach_code ?? null,
      },
    });
  } catch (error) {
    console.error("GET /api/user/me:", error);
    return NextResponse.json({ message: "Could not load profile." }, { status: 500 });
  }
}
