import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthPayload } from "@/lib/auth-api";

export async function POST(req, { params }) {
  const auth = getAuthPayload(req);
  if (!auth) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (auth.role !== "coach") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { sessionId: sessionIdRaw } = await params;
  const sessionId = Number(sessionIdRaw);
  if (!Number.isFinite(sessionId) || sessionId < 1) {
    return NextResponse.json({ message: "Invalid session id." }, { status: 400 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });
  }

  const coachNote = typeof body?.coachNote === "string" ? body.coachNote.trim() : "";
  if (!coachNote) {
    return NextResponse.json({ message: "coachNote is required." }, { status: 400 });
  }

  const safeNote = coachNote.slice(0, 2000);

  try {
    const [result] = await db.execute(
      `
      UPDATE training_sessions AS ts
      INNER JOIN users AS fighter ON fighter.id = ts.user_id AND fighter.role = 'fighter'
      INNER JOIN users AS coach ON coach.id = ? AND coach.role = 'coach'
      SET ts.coach_notes =
        CASE
          WHEN ts.coach_notes IS NULL OR ts.coach_notes = '' THEN ?
          ELSE CONCAT(ts.coach_notes, '\\n\\n', ?)
        END,
        ts.coach_notes_unread = 1
      WHERE ts.id = ?
        AND fighter.coach_code IS NOT NULL
        AND fighter.coach_code = coach.coach_code
      `,
      [auth.id, safeNote, safeNote, sessionId],
    );

    if (!result || result.affectedRows === 0) {
      return NextResponse.json(
        {
          message:
            "Could not save: session missing, fighter not linked to your coach code, or wrong session id. Ensure the fighter added your coach code on their account.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/coach/sessions/:sessionId/coach-note:", error);
    return NextResponse.json(
      { message: "Could not save coach comment. Did you run add_coach_notes_to_training_sessions.sql?" },
      { status: 500 },
    );
  }
}

