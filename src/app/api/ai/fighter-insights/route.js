import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthPayload } from "@/lib/auth-api";
import { runOpenAIChat } from "@/lib/ai-openai";

function normalizeDate(value) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string") {
    return value.slice(0, 10);
  }
  return value;
}

function clip(text, max) {
  if (text == null || text === "") return null;
  const s = String(text);
  if (s.length <= max) return s;
  return `${s.slice(0, max)}…`;
}

export async function POST(req) {
  const auth = getAuthPayload(req);
  if (!auth) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (auth.role !== "fighter") {
    return NextResponse.json({ message: "Only fighters can use this endpoint." }, { status: 403 });
  }

  try {
    const [rows] = await db.execute(
      `SELECT session_date, duration_minutes, session_type, intensity, notes, coach_notes
       FROM training_sessions
       WHERE user_id = ?
       ORDER BY session_date ASC, id ASC
       LIMIT 200`,
      [auth.id],
    );

    if (!rows.length) {
      return NextResponse.json(
        { message: "Log at least one training session before generating insights." },
        { status: 400 },
      );
    }

    const sessions = rows.map((row) => ({
      session_date: normalizeDate(row.session_date),
      duration_minutes: row.duration_minutes,
      session_type: row.session_type,
      intensity: row.intensity,
      notes: clip(row.notes, 1200),
      coach_feedback: clip(row.coach_notes, 600),
    }));

    const firstDate = sessions[0].session_date;
    const lastDate = sessions[sessions.length - 1].session_date;

    const userPrompt = `You are a supportive Muay Thai training assistant helping an athlete reflect on their own training log.

Context:
- Total logged sessions: ${sessions.length}
- Date range (first to last session): ${firstDate} → ${lastDate}
- Sessions are in chronological order (oldest first) so you can comment on progression over time.

Training session data (JSON array):
${JSON.stringify(sessions)}

Write personalized guidance for THIS athlete. Include clear headings and bullet points:

1) **Training journey** — Brief narrative of what their history suggests (volume, consistency, focus areas, intensity patterns).

2) **Patterns & habits** — What the data shows about how they train (e.g. technique mix, note-taking, gaps between sessions if inferable from dates only).

3) **Strengths** — What they are doing well based on the log.

4) **Growth opportunities** — Areas to develop next, tied to specific evidence from sessions when possible.

5) **Next 2 weeks** — Concrete, actionable suggestions for upcoming sessions (drills, emphasis areas, recovery balance). Suggest how to vary training.

6) **Sample week** — One example 7-day outline they could adapt (not medical advice).

Safety and tone:
- Be encouraging and practical; avoid shaming.
- Do not diagnose injuries or medical conditions; if something sounds like pain or injury, tell them to stop and consult a qualified professional and their coach.
- Remind them their human coach knows them best if they have one.
- This is training guidance based on a log, not a substitute for in-person coaching.`;

    const insights = await runOpenAIChat({
      system:
        "You give concise, structured Muay Thai training guidance. Use markdown-style headings (##) and bullets. Stay within practical gym training.",
      user: userPrompt,
    });

    return NextResponse.json({
      insights,
      meta: {
        sessionCount: sessions.length,
        firstSessionDate: firstDate,
        lastSessionDate: lastDate,
      },
    });
  } catch (error) {
    if (error?.code === "OPENAI_API_KEY_MISSING") {
      return NextResponse.json(
        { message: "AI insights are not configured. Add OPENAI_API_KEY to your environment." },
        { status: 503 },
      );
    }
    console.error("POST /api/ai/fighter-insights:", error);
    return NextResponse.json({ message: "Could not generate insights. Try again later." }, { status: 500 });
  }
}
