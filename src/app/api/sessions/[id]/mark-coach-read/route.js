import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthPayload } from "@/lib/auth-api";

export async function POST(request, { params }) {
  const auth = getAuthPayload(request);
  if (!auth) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id) || id < 1) {
    return NextResponse.json({ message: "Invalid session id." }, { status: 400 });
  }

  try {
    const [result] = await db.execute(
      `UPDATE training_sessions
       SET coach_notes_unread = 0
       WHERE id = ? AND user_id = ?`,
      [id, auth.id],
    );

    if (!result || result.affectedRows === 0) {
      return NextResponse.json({ message: "Session not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/sessions/[id]/mark-coach-read:", error);
    return NextResponse.json(
      { message: "Could not update read state. Did you run add_coach_notes_to_training_sessions.sql?" },
      { status: 500 },
    );
  }
}
