import { connectDB } from "@/lib/db/connDb";
import User from "@/lib/db/models/user.model";
import bcrypt from "bcryptjs";

export async function GET(_, context) {
  try {
    await connectDB();
    const { id } = await context.params;
    const doc = await User.findOne({ _id: id, role: "doctor" })
      .select({ name: 1, email: 1, role: 1, createdAt: 1 })
      .lean();
    if (!doc) return new Response(JSON.stringify({ message: "Doctor not found" }), { status: 404 });
    const user = { id: doc._id.toString(), name: doc.name, email: doc.email, role: doc.role, createdAt: doc.createdAt };
    return new Response(JSON.stringify({ user }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Get doctor error", err);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}

export async function PUT(req, context) {
  try {
    await connectDB();
    const { id } = await context.params;
    const { name, email, password } = await req.json();

    const update = {};
    if (typeof name === "string" && name.trim().length >= 2) update.name = name.trim();
    if (typeof email === "string" && /.+@.+\..+/.test(email)) update.email = email.toLowerCase();
    if (typeof password === "string" && password.length >= 8) update.password = await bcrypt.hash(password, 10);

    if (Object.keys(update).length === 0) {
      return new Response(JSON.stringify({ message: "No valid fields to update" }), { status: 400 });
    }

    // Ensure email uniqueness when changing email
    if (update.email) {
      const existing = await User.findOne({ email: update.email, _id: { $ne: id } }).lean();
      if (existing) {
        return new Response(JSON.stringify({ message: "Email already exists" }), { status: 409 });
      }
    }

    const updated = await User.findOneAndUpdate(
      { _id: id, role: "doctor" },
      { $set: update },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return new Response(JSON.stringify({ message: "Doctor not found" }), { status: 404 });

    const user = { id: updated._id.toString(), name: updated.name, email: updated.email, role: updated.role, createdAt: updated.createdAt };
    return new Response(JSON.stringify({ user }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Update doctor error", err);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}

export async function DELETE(_, context) {
  try {
    await connectDB();
    const { id } = await context.params;
    const deleted = await User.findOneAndDelete({ _id: id, role: "doctor" }).lean();
    if (!deleted) return new Response(JSON.stringify({ message: "Doctor not found" }), { status: 404 });
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("Delete doctor error", err);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}


