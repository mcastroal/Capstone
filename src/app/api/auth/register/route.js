import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req) {
  try {
    const { first_name, last_name, email, password, role, coachCode } = await req.json();

    if (!first_name || !last_name || !email || !password || !role) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    // Check if user exists
    const [existingUsers] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate coach code if coach
    const generatedCode = role === "coach" ? Math.random().toString(36).substring(2, 8) : null;

    // Insert user into database
    await db.execute(
      "INSERT INTO users (first_name, last_name, email, password, role, coach_code) VALUES (?, ?, ?, ?, ?, ?)",
      [first_name, last_name, email, hashedPassword, role, generatedCode]
    );

    return NextResponse.json({
      success: true,
      coachCode: generatedCode, // only for coaches
    });

  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { message: "Internal server error" }, 
      { status: 500 }
    );
  }
}