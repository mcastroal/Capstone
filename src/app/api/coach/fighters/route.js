import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthPayload } from "@/lib/auth-api";

export async function GET(req) {
  const auth = getAuthPayload(req);
  if (!auth) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (auth.role !== "coach") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const [coachRows] = await db.execute(
      "SELECT id, coach_code FROM users WHERE id = ? AND role = ?",
      [auth.id, "coach"],
    );
    const coach = coachRows[0];

    if (!coach?.coach_code) {
      return NextResponse.json(
        { message: "Your coach code is missing. Try registering again." },
        { status: 400 },
      );
    }

    const [rows] = await db.execute(
      `SELECT id, first_name, last_name, email
       FROM users
       WHERE role = ? AND coach_code = ?
       ORDER BY id DESC
       LIMIT 200`,
      ["fighter", coach.coach_code],
    );

    return NextResponse.json({
      coachCode: coach.coach_code,
      fighters: rows,
    });
  } catch (error) {
    console.error("GET /api/coach/fighters:", error);
    return NextResponse.json(
      { message: "Could not load fighters." },
      { status: 500 },
    );
  }
}

