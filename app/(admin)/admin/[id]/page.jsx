"use client"

import { use } from "react"
import { AppointmentsProvider } from "@/lib/context/appointments"
import { AppointmentDetail } from "@/components/appointments/appointment-detail"

export default function AppointmentDetailPage({ params }) {
  const { id } = use(params)
  
  return (
    <AppointmentsProvider>
      <AppointmentDetail appointmentId={id} />
    </AppointmentsProvider>
  )
}
