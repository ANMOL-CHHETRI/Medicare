import { connectDB } from "@/lib/db/connDb";
import User from "@/lib/db/models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ message: "Email and password are required" }), { status: 400 });
    }

    if (!/.+@.+\..+/.test(email)) {
      return new Response(JSON.stringify({ message: "Invalid email address" }), { status: 400 });
    }
    if (typeof password !== "string" || password.length < 6) {
      return new Response(JSON.stringify({ message: "Password must be at least 6 characters" }), { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return new Response(JSON.stringify({ message: "Invalid credentials" }), { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return new Response(JSON.stringify({ message: "Invalid credentials" }), { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not set");
      return new Response(JSON.stringify({ message: "Server misconfiguration" }), { status: 500 });
    }

    const payload = { sub: user._id.toString(), email: user.email, role: user.role };
    const token = jwt.sign(payload, secret, { expiresIn: "7d" });

    const safeUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    const res = NextResponse.json({ user: safeUser, token }, { status: 200 });
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (err) {
    console.error("Login error", err);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}


