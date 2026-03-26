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

  const sessionId = Number(params.sessionId);
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
      UPDATE training_sessions ts
      JOIN users u ON u.id = ts.user_id
      SET ts.notes =
        CASE
          WHEN ts.notes IS NULL OR ts.notes = '' THEN CONCAT('Coach: ', ?)
          ELSE CONCAT(ts.notes, '\\n\\nCoach: ', ?)
        END
      WHERE ts.id = ?
        AND u.role = 'fighter'
        AND u.coach_code = (
          SELECT coach_code
          FROM users
          WHERE id = ? AND role = 'coach'
        )
      `,
      [safeNote, safeNote, sessionId, auth.id],
    );

    if (!result || result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Session not found, or you do not have access." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/coach/sessions/:sessionId/coach-note:", error);
    return NextResponse.json(
      { message: "Could not save coach note." },
      { status: 500 },
    );
  }
}

