import { NextResponse } from "next/server";
import { runOpenAIChat } from "@/lib/ai-openai";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });
  }

  const { sessions, traineeName, coachGoal } = body ?? {};
  if (!Array.isArray(sessions)) {
    return NextResponse.json({ message: "sessions array is required." }, { status: 400 });
  }

  const prompt = `
  You are a Muay Thai coach.

  Goal (if provided): ${coachGoal || "Not specified"}.
  Trainee name (if provided): ${traineeName || "Unknown"}.

  Training sessions (most recent last):
  ${JSON.stringify(sessions)}

  Create a coaching plan that a human coach could use. Include:
  1) Strengths observed
  2) Weaknesses / gaps observed
  3) Specific suggestions (drills/exercises) matched to the data
  4) A simple 7-day practice outline (days 1-7)
  5) Notes the coach can copy into messages to the trainee

  Keep the response structured with short headings and bullet points.
  `;

  try {
    const insights = await runOpenAIChat({ user: prompt });
    return NextResponse.json({ insights });
  } catch (error) {
    if (error?.code === "OPENAI_API_KEY_MISSING") {
      return NextResponse.json(
        { message: "AI is not configured. Add OPENAI_API_KEY to your environment." },
        { status: 503 },
      );
    }
    console.error("POST /api/ai/insights:", error);
    return NextResponse.json({ message: "Could not generate insights." }, { status: 500 });
  }
}