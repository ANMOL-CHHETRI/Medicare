import { connectDB } from "@/lib/db/connDb";
import Appointment from "@/lib/db/models/appointment.model";
import User from "@/lib/db/models/user.model";
import Patient from "@/lib/db/models/patient.model";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");
    const doctorId = searchParams.get("doctorId");
    const status = searchParams.get("status");
    
    const q = {};
    if (patientId) q.patient = patientId;
    if (doctorId) q.doctor = doctorId;
    if (status) q.status = status;
    
    const appointments = await Appointment.find(q)
      .populate({ path: "patient", select: "name age gender contactNumber" })
      .populate({ path: "doctor", select: "name email" })
      .sort({ date: -1, time: -1 })
      .lean();
    
    const data = appointments.map((a) => ({
      id: a._id.toString(),
      patient: a.patient ? {
        id: a.patient._id.toString(),
        name: a.patient.name,
        age: a.patient.age,
        gender: a.patient.gender,
        contactNumber: a.patient.contactNumber,
      } : null,
      doctor: a.doctor ? {
        id: a.doctor._id.toString(),
        name: a.doctor.name,
        email: a.doctor.email,
      } : null,
      date: a.date,
      time: a.time,
      reason: a.reason,
      status: a.status,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    }));
    
    return new Response(JSON.stringify({ appointments: data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("List appointments error", err);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { patient, doctor, date, time, reason, status } = body;
    
    if (!patient || !doctor || !date || !time) {
      return new Response(JSON.stringify({ message: "Missing required fields" }), { status: 400 });
    }
    
    const created = await Appointment.create({
      patient,
      doctor,
      date: new Date(date),
      time,
      reason: reason || undefined,
      status: status || "Scheduled",
    });
    
    const appointment = await Appointment.findById(created._id)
      .populate({ path: "patient", select: "name age gender contactNumber" })
      .populate({ path: "doctor", select: "name email" })
      .lean();
    
    const data = {
      id: appointment._id.toString(),
      patient: appointment.patient ? {
        id: appointment.patient._id.toString(),
        name: appointment.patient.name,
        age: appointment.patient.age,
        gender: appointment.patient.gender,
        contactNumber: appointment.patient.contactNumber,
      } : null,
      doctor: appointment.doctor ? {
        id: appointment.doctor._id.toString(),
        name: appointment.doctor.name,
        email: appointment.doctor.email,
      } : null,
      date: appointment.date,
      time: appointment.time,
      reason: appointment.reason,
      status: appointment.status,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };
    
    return new Response(JSON.stringify({ appointment: data }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Create appointment error", err);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}

