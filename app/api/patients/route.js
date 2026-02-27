import { connectDB } from "@/lib/db/connDb";
import Patient from "@/lib/db/models/patient.model";
import User from "@/lib/db/models/user.model";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId");
    const q = {};
    if (doctorId) q.assignedDoctor = doctorId;
    const patients = await Patient.find(q)
      .populate({ path: "assignedDoctor", select: "name email" })
      .sort({ createdAt: -1 })
      .lean();
    const data = patients.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      age: p.age,
      gender: p.gender,
      contactNumber: p.contactNumber,
      address: p.address,
      medicalHistory: p.medicalHistory,
      assignedDoctor: p.assignedDoctor ? { id: p.assignedDoctor._id?.toString?.() || "", name: p.assignedDoctor.name, email: p.assignedDoctor.email } : null,
      createdAt: p.createdAt,
    }));
    return new Response(JSON.stringify({ patients: data }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("List patients error", err);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, age, gender, contactNumber, address, medicalHistory, assignedDoctor, firstName, lastName } = body;
    if ((!name && !(firstName && lastName)) || typeof age !== "number" || !gender) {
      return new Response(JSON.stringify({ message: "Missing required fields" }), { status: 400 });
    }
    const created = await Patient.create({ name: name || `${firstName || ""} ${lastName || ""}`.trim(), age, gender, contactNumber, address, medicalHistory, assignedDoctor: assignedDoctor || undefined });
    const patient = { id: created._id.toString(), name: created.name, age: created.age, gender: created.gender, contactNumber: created.contactNumber, address: created.address, medicalHistory: created.medicalHistory, assignedDoctor: created.assignedDoctor?.toString?.() || null, createdAt: created.createdAt };
    return new Response(JSON.stringify({ patient }), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Create patient error", err);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}


