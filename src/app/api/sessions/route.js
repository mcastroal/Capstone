import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthPayload } from "@/lib/auth-api";
import { normalizeSessionTypeInput } from "@/lib/sessionTypes";

function normalizeDate(value) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string") {
    return value.slice(0, 10);
  }
  return value;
}

export async function GET(request) {
  const auth = getAuthPayload(request);
  if (!auth) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const [rows] = await db.execute(
      `SELECT id, user_id, session_date, duration_minutes, session_type, intensity, notes,
              coach_notes, coach_notes_unread, created_at
       FROM training_sessions
       WHERE user_id = ?
       ORDER BY session_date DESC, id DESC
       LIMIT 100`,
      [auth.id]
    );

    const sessions = rows.map((row) => ({
      ...row,
      session_date: normalizeDate(row.session_date),
      coach_notes:
        row.coach_notes != null && row.coach_notes !== ""
          ? String(row.coach_notes)
          : null,
      coach_notes_unread: Number(row.coach_notes_unread) === 1,
      created_at:
        row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    }));

    const unreadCoachNotesCount = sessions.filter(
      (s) =>
        s.coach_notes &&
        String(s.coach_notes).trim() !== "" &&
        s.coach_notes_unread === true,
    ).length;

    return NextResponse.json({ sessions, unreadCoachNotesCount });
  } catch (error) {
    console.error("GET /api/sessions:", error);
    return NextResponse.json(
      { message: "Could not load sessions. Did you run training_sessions.sql?" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const auth = getAuthPayload(request);
  if (!auth) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const {
    session_date,
    duration_minutes,
    session_type,
    intensity,
    notes,
  } = body ?? {};

  if (!session_date || duration_minutes == null || !session_type) {
    return NextResponse.json(
      { message: "session_date, duration_minutes, and session_type are required" },
      { status: 400 }
    );
  }

  const duration = Number(duration_minutes);
  if (!Number.isFinite(duration) || duration < 1 || duration > 24 * 60) {
    return NextResponse.json(
      { message: "duration_minutes must be between 1 and 1440" },
      { status: 400 }
    );
  }

  const typeStr = normalizeSessionTypeInput(session_type);
  if (!typeStr) {
    return NextResponse.json({ message: "Select at least one technique." }, { status: 400 });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO training_sessions
        (user_id, session_date, duration_minutes, session_type, intensity, notes, coach_notes, coach_notes_unread)
       VALUES (?, ?, ?, ?, ?, ?, NULL, 0)`,
      [
        auth.id,
        session_date,
        duration,
        typeStr,
        intensity ? String(intensity).trim().slice(0, 32) : null,
        notes != null ? String(notes).slice(0, 8000) : null,
      ]
    );

    return NextResponse.json({
      success: true,
      id: result.insertId,
    });
  } catch (error) {
    console.error("POST /api/sessions:", error);
    return NextResponse.json(
      { message: "Could not save session. Did you run training_sessions.sql?" },
      { status: 500 }
    );
  }
}
