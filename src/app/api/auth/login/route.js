import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const [rows] = await db.execute(
      "SELECT * FROM users WHERE email = ?", 
      [email]
    );

    const user = rows[0];

    // if no user found, return error
    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // if user found, check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );

    return nextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Error logging in:", error);
    return nextResponse.json(
      { message: "Internal server error" }, 
      { status: 500 }
    );
  }
}