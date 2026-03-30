import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthPayload } from "@/lib/auth-api";
import { normalizeSessionTypeInput } from "@/lib/sessionTypes";

export async function PATCH(request, { params }) {
  const auth = getAuthPayload(request);
  if (!auth) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id) || id < 1) {
    return NextResponse.json({ message: "Invalid session id." }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const { session_date, duration_minutes, session_type, intensity, notes } = body ?? {};

  if (!session_date || duration_minutes == null || session_type == null) {
    return NextResponse.json(
      { message: "session_date, duration_minutes, and session_type are required" },
      { status: 400 },
    );
  }

  const duration = Number(duration_minutes);
  if (!Number.isFinite(duration) || duration < 1 || duration > 24 * 60) {
    return NextResponse.json(
      { message: "duration_minutes must be between 1 and 1440" },
      { status: 400 },
    );
  }

  const typeStr = normalizeSessionTypeInput(session_type);
  if (!typeStr) {
    return NextResponse.json({ message: "Select at least one technique." }, { status: 400 });
  }

  try {
    const [result] = await db.execute(
      `UPDATE training_sessions
       SET session_date = ?, duration_minutes = ?, session_type = ?, intensity = ?, notes = ?
       WHERE id = ? AND user_id = ?`,
      [
        session_date,
        duration,
        typeStr,
        intensity ? String(intensity).trim().slice(0, 32) : null,
        notes != null ? String(notes).slice(0, 8000) : null,
        id,
        auth.id,
      ],
    );

    if (!result || result.affectedRows === 0) {
      return NextResponse.json({ message: "Session not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/sessions/[id]:", error);
    return NextResponse.json({ message: "Could not update session." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
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
      "DELETE FROM training_sessions WHERE id = ? AND user_id = ?",
      [id, auth.id],
    );

    if (!result || result.affectedRows === 0) {
      return NextResponse.json({ message: "Session not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/sessions/[id]:", error);
    return NextResponse.json({ message: "Could not delete session." }, { status: 500 });
  }
}
