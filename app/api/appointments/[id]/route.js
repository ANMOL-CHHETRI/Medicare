import { connectDB } from "@/lib/db/connDb";
import Appointment from "@/lib/db/models/appointment.model";
import User from "@/lib/db/models/user.model";
import Patient from "@/lib/db/models/patient.model";

export async function GET(_, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const appointment = await Appointment.findById(id)
      .populate({ path: "patient", select: "name age gender contactNumber address medicalHistory" })
      .populate({ path: "doctor", select: "name email" })
      .lean();
    
    if (!appointment) {
      return new Response(JSON.stringify({ message: "Appointment not found" }), { status: 404 });
    }
    
    const data = {
      id: appointment._id.toString(),
      patient: appointment.patient ? {
        id: appointment.patient._id.toString(),
        name: appointment.patient.name,
        age: appointment.patient.age,
        gender: appointment.patient.gender,
        contactNumber: appointment.patient.contactNumber,
        address: appointment.patient.address,
        medicalHistory: appointment.patient.medicalHistory,
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
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Get appointment error", err);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();
    const allowed = ["patient", "doctor", "date", "time", "reason", "status"];
    const update = {};
    
    for (const key of allowed) {
      if (key in body) {
        if (key === "date") {
          update[key] = new Date(body[key]);
        } else {
          update[key] = body[key];
        }
      }
    }
    
    const updated = await Appointment.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    )
      .populate({ path: "patient", select: "name age gender contactNumber" })
      .populate({ path: "doctor", select: "name email" })
      .lean();
    
    if (!updated) {
      return new Response(JSON.stringify({ message: "Appointment not found" }), { status: 404 });
    }
    
    const data = {
      id: updated._id.toString(),
      patient: updated.patient ? {
        id: updated.patient._id.toString(),
        name: updated.patient.name,
        age: updated.patient.age,
        gender: updated.patient.gender,
        contactNumber: updated.patient.contactNumber,
      } : null,
      doctor: updated.doctor ? {
        id: updated.doctor._id.toString(),
        name: updated.doctor.name,
        email: updated.doctor.email,
      } : null,
      date: updated.date,
      time: updated.time,
      reason: updated.reason,
      status: updated.status,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
    
    return new Response(JSON.stringify({ appointment: data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Update appointment error", err);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}

export async function DELETE(_, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const deleted = await Appointment.findByIdAndDelete(id).lean();
    
    if (!deleted) {
      return new Response(JSON.stringify({ message: "Appointment not found" }), { status: 404 });
    }
    
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("Delete appointment error", err);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}

