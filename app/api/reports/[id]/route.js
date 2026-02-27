import { connectDB } from "@/lib/db/connDb";
import Report from "@/lib/db/models/report.model";
import User from "@/lib/db/models/user.model";
import Patient from "@/lib/db/models/patient.model";

export async function GET(_, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const r = await Report.findById(id)
      .populate({ path: "patient", select: "name" })
      .populate({ path: "doctor", select: "name email" })
      .lean();
    if (!r) return new Response(JSON.stringify({ message: "Report not found" }), { status: 404 });
    const report = {
      id: r._id.toString(),
      title: r.title,
      description: r.description,
      findings: r.findings,
      dateIssued: r.dateIssued,
      patient: r.patient ? { id: r.patient._id?.toString?.() || "", name: r.patient.name } : null,
      doctor: r.doctor ? { id: r.doctor._id?.toString?.() || "", name: r.doctor.name, email: r.doctor.email } : null,
      createdAt: r.createdAt,
    };
    return new Response(JSON.stringify({ report }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Get report error", err);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();
    const allowed = ["patient", "doctor", "title", "description", "findings", "dateIssued"];
    const update = {};
    for (const key of allowed) if (key in body) update[key] = body[key];
    const updated = await Report.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true }).lean();
    if (!updated) return new Response(JSON.stringify({ message: "Report not found" }), { status: 404 });
    return new Response(JSON.stringify({ id: updated._id.toString() }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Update report error", err);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}

export async function DELETE(_, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const deleted = await Report.findByIdAndDelete(id).lean();
    if (!deleted) return new Response(JSON.stringify({ message: "Report not found" }), { status: 404 });
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("Delete report error", err);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}


