"use client"

import { use } from "react"
import { AppointmentsProvider } from "@/lib/context/appointments"
import { PatientsProvider } from "@/lib/context/patients"
import { AppointmentDetail } from "@/components/appointments/appointment-detail"

export default function AppointmentDetailPage({ params }) {
  const { id } = use(params)
  
  return (
    <PatientsProvider>
      <AppointmentsProvider>
        <div className="p-6 max-w-6xl mx-auto">
          <AppointmentDetail appointmentId={id} />
        </div>
      </AppointmentsProvider>
    </PatientsProvider>
  )
}

