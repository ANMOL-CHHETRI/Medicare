import { connectDB } from "@/lib/db/connDb";
import Patient from "@/lib/db/models/patient.model";
import User from "@/lib/db/models/user.model";

export async function GET(_, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const p = await Patient.findById(id).populate({ path: "assignedDoctor", select: "name email" }).lean();
    if (!p) return new Response(JSON.stringify({ message: "Patient not found" }), { status: 404 });
    const patient = { id: p._id.toString(), name: p.name, age: p.age, gender: p.gender, contactNumber: p.contactNumber, address: p.address, medicalHistory: p.medicalHistory, assignedDoctor: p.assignedDoctor ? { id: p.assignedDoctor._id?.toString?.() || "", name: p.assignedDoctor.name, email: p.assignedDoctor.email } : null, createdAt: p.createdAt };
    return new Response(JSON.stringify({ patient }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Get patient error", err);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();
    const allowed = ["name", "age", "gender", "contactNumber", "address", "medicalHistory", "assignedDoctor", "firstName", "lastName"];
    const update = {};
    for (const key of allowed) if (key in body) update[key] = body[key];
    // Compose name from first/last if not provided
    if (!update.name && (update.firstName || update.lastName)) {
      update.name = `${update.firstName || ""} ${update.lastName || ""}`.trim();
    }
    // Remove transient UI fields
    delete update.firstName;
    delete update.lastName;
    const updated = await Patient.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true }).lean();
    if (!updated) return new Response(JSON.stringify({ message: "Patient not found" }), { status: 404 });
    return new Response(JSON.stringify({ patient: { id: updated._id.toString() } }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Update patient error", err);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}

export async function DELETE(_, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const deleted = await Patient.findByIdAndDelete(id).lean();
    if (!deleted) return new Response(JSON.stringify({ message: "Patient not found" }), { status: 404 });
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("Delete patient error", err);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}


