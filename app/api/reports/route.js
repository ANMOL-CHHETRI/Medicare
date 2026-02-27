import { connectDB } from "@/lib/db/connDb";
import Report from "@/lib/db/models/report.model";
import User from "@/lib/db/models/user.model";
import Patient from "@/lib/db/models/patient.model";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId");
    const patientId = searchParams.get("patientId");
    const q = {};
    if (doctorId) q.doctor = doctorId;
    if (patientId) q.patient = patientId;
    const reports = await Report.find(q)
      .populate({ path: "patient", select: "name" })
      .populate({ path: "doctor", select: "name email" })
      .sort({ createdAt: -1 })
      .lean();
    const data = reports.map((r) => ({
      id: r._id.toString(),
      title: r.title,
      description: r.description,
      findings: r.findings,
      dateIssued: r.dateIssued,
      patient: r.patient ? { id: r.patient._id?.toString?.() || "", name: r.patient.name } : null,
      doctor: r.doctor ? { id: r.doctor._id?.toString?.() || "", name: r.doctor.name, email: r.doctor.email } : null,
      createdAt: r.createdAt,
    }));
    return new Response(JSON.stringify({ reports: data }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("List reports error", err);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { patient, doctor, title, description, findings, dateIssued } = body;
    if (!patient || !doctor || !title) {
      return new Response(JSON.stringify({ message: "Missing required fields" }), { status: 400 });
    }
    const created = await Report.create({ patient, doctor, title, description, findings, dateIssued });
    return new Response(JSON.stringify({ id: created._id.toString() }), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Create report error", err);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}


