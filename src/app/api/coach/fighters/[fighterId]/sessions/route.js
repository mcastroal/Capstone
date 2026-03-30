import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthPayload } from "@/lib/auth-api";

function normalizeDate(value) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string") {
    return value.slice(0, 10);
  }
  return value;
}

export async function GET(req, { params }) {
  const auth = getAuthPayload(req);
  if (!auth) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (auth.role !== "coach") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { fighterId: fighterIdRaw } = await params;
  const fighterId = Number(fighterIdRaw);
  if (!Number.isFinite(fighterId) || fighterId < 1) {
    return NextResponse.json({ message: "Invalid fighter id." }, { status: 400 });
  }

  try {
    const [coachRows] = await db.execute(
      "SELECT coach_code FROM users WHERE id = ? AND role = ?",
      [auth.id, "coach"],
    );
    const coach = coachRows[0];
    if (!coach?.coach_code) {
      return NextResponse.json(
        { message: "Your coach code is missing." },
        { status: 400 },
      );
    }

    const [rows] = await db.execute(
      `SELECT
          ts.id,
          ts.user_id,
          ts.session_date,
          ts.duration_minutes,
          ts.session_type,
          ts.intensity,
          ts.notes,
          ts.coach_notes,
          ts.coach_notes_unread,
          ts.created_at,
          u.first_name,
          u.last_name
        FROM training_sessions ts
        JOIN users u ON u.id = ts.user_id
        WHERE u.role = ?
          AND u.id = ?
          AND u.coach_code = ?
        ORDER BY ts.session_date DESC, ts.id DESC
        LIMIT 200`,
      ["fighter", fighterId, coach.coach_code],
    );

    const sessions = rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      session_date: normalizeDate(row.session_date),
      duration_minutes: row.duration_minutes,
      session_type: row.session_type,
      intensity: row.intensity,
      notes: row.notes,
      coach_notes: row.coach_notes,
      coach_notes_unread: Number(row.coach_notes_unread) === 1,
      created_at:
        row.created_at instanceof Date
          ? row.created_at.toISOString()
          : row.created_at,
      fighter: { first_name: row.first_name, last_name: row.last_name },
    }));

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("GET /api/coach/fighters/:fighterId/sessions:", error);
    return NextResponse.json(
      { message: "Could not load fighter sessions." },
      { status: 500 },
    );
  }
}

