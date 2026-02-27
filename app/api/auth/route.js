import { connectDB } from "@/lib/db/connDb";
import User from "@/lib/db/models/user.model";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password, role } = body || {};

    if (!name || !email || !password) {
      return new Response(JSON.stringify({ message: "Missing required fields" }), { status: 400 });
    }

    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase() }).lean();
    if (existing) {
      return new Response(JSON.stringify({ message: "Email already registered" }), { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const created = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: role && ["admin", "doctor"].includes(role) ? role : undefined,
    });

    const user = {
      id: created._id.toString(),
      name: created.name,
      email: created.email,
      role: created.role,
      createdAt: created.createdAt,
    };

    return new Response(JSON.stringify({ user }), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Signup error", err);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}


