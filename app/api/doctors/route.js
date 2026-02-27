import { connectDB } from "@/lib/db/connDb";
import User from "@/lib/db/models/user.model";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await connectDB();
    const doctors = await User.find({ role: "doctor" })
      .select({ name: 1, email: 1, role: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .lean();
    const data = doctors.map((d) => ({
      id: d._id.toString(),
      name: d.name,
      email: d.email,
      role: d.role,
      createdAt: d.createdAt,
    }));
    return new Response(JSON.stringify({ doctors: data }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("List doctors error", err);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return new Response(JSON.stringify({ message: "Missing required fields" }), { status: 400 });
    }

    if (typeof name !== "string" || name.trim().length < 2) {
      return new Response(JSON.stringify({ message: "Name must be at least 2 characters" }), { status: 400 });
    }
    if (!/.+@.+\..+/.test(email)) {
      return new Response(JSON.stringify({ message: "Invalid email address" }), { status: 400 });
    }
    if (typeof password !== "string" || password.length < 8) {
      return new Response(JSON.stringify({ message: "Password must be at least 8 characters" }), { status: 400 });
    }

    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase() }).lean();
    if (existing) {
      return new Response(JSON.stringify({ message: "Email already exists" }), { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const created = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: "doctor",
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
    console.error("Create doctor error", err);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}


