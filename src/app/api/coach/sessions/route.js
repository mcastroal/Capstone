import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthPayload } from "@/lib/auth-api";
import { normalizeSessionTypeInput } from "@/lib/sessionTypes";

const MAX_FIGHTERS_PER_BULK = 40;

function normalizeDate(value) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string") {
    return value.slice(0, 10);
  }
  return value;
}

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
          u.last_name,
          u.email
        FROM training_sessions ts
        INNER JOIN users u ON u.id = ts.user_id
        WHERE u.role = 'fighter'
          AND u.coach_code = ?
        ORDER BY ts.session_date DESC, ts.id DESC
        LIMIT 500`,
      [coach.coach_code],
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
      fighter: {
        id: row.user_id,
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
      },
    }));

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("GET /api/coach/sessions:", error);
    return NextResponse.json(
      { message: "Could not load sessions." },
      { status: 500 },
    );
  }
}

/** Coach creates the same session for one or more linked fighters (one DB row per fighter). */
export async function POST(req) {
  const auth = getAuthPayload(req);
  if (!auth) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (auth.role !== "coach") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });
  }

  const {
    fighter_ids: fighterIdsRaw,
    session_date,
    duration_minutes,
    session_type,
    intensity,
    notes,
  } = body ?? {};

  if (!Array.isArray(fighterIdsRaw) || fighterIdsRaw.length === 0) {
    return NextResponse.json(
      { message: "Select at least one fighter (fighter_ids)." },
      { status: 400 },
    );
  }

  const fighterIds = [
    ...new Set(
      fighterIdsRaw
        .map((x) => Number(x))
        .filter((n) => Number.isFinite(n) && n >= 1),
    ),
  ];

  if (fighterIds.length === 0) {
    return NextResponse.json({ message: "Invalid fighter_ids." }, { status: 400 });
  }
  if (fighterIds.length > MAX_FIGHTERS_PER_BULK) {
    return NextResponse.json(
      { message: `You can log at most ${MAX_FIGHTERS_PER_BULK} fighters per submission.` },
      { status: 400 },
    );
  }

  if (!session_date || duration_minutes == null || !session_type) {
    return NextResponse.json(
      { message: "session_date, duration_minutes, and session_type are required." },
      { status: 400 },
    );
  }

  const duration = Number(duration_minutes);
  if (!Number.isFinite(duration) || duration < 1 || duration > 24 * 60) {
    return NextResponse.json(
      { message: "duration_minutes must be between 1 and 1440." },
      { status: 400 },
    );
  }

  const typeStr = normalizeSessionTypeInput(session_type);
  if (!typeStr) {
    return NextResponse.json({ message: "Select at least one technique." }, { status: 400 });
  }

  const notesVal = notes != null ? String(notes).slice(0, 8000) : null;
  const intensityVal = intensity ? String(intensity).trim().slice(0, 32) : null;

  let connection;
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

    const placeholders = fighterIds.map(() => "?").join(",");
    const [allowed] = await db.execute(
      `SELECT id FROM users
       WHERE role = 'fighter' AND coach_code = ? AND id IN (${placeholders})`,
      [coach.coach_code, ...fighterIds],
    );

    if (allowed.length !== fighterIds.length) {
      return NextResponse.json(
        {
          message:
            "One or more fighters are not linked to your coach code. They must add your code on their account.",
        },
        { status: 400 },
      );
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const insertedIds = [];
    for (const userId of fighterIds) {
      const [ins] = await connection.execute(
        `INSERT INTO training_sessions
          (user_id, session_date, duration_minutes, session_type, intensity, notes, coach_notes, coach_notes_unread)
         VALUES (?, ?, ?, ?, ?, ?, NULL, 0)`,
        [userId, session_date, duration, typeStr, intensityVal, notesVal],
      );
      insertedIds.push(ins.insertId);
    }

    await connection.commit();
    return NextResponse.json({
      success: true,
      sessionIds: insertedIds,
      count: insertedIds.length,
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch {
        /* ignore */
      }
    }
    console.error("POST /api/coach/sessions:", error);
    return NextResponse.json(
      { message: "Could not save sessions. Did you run training_sessions.sql?" },
      { status: 500 },
    );
  } finally {
    if (connection) connection.release();
  }
}
