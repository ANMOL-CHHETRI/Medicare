"use client"

import { use } from "react"
import { useAuth } from "@/lib/context/auth"
import { AppointmentDetail } from "@/components/appointments/appointment-detail"

export default function DoctorAppointmentDetailPage({ params }) {
  const { id } = use(params)
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <AppointmentDetail appointmentId={id} />
    </div>
  )
}

