"use client"

import { AppointmentsProvider } from "@/lib/context/appointments"
import { PatientsProvider } from "@/lib/context/patients"
import { AppointmentList } from "@/components/appointments/appointment-list"

export default function AppointmentsPage() {
  return (
    <PatientsProvider>
      <AppointmentsProvider>
        <div className="p-6">
          <AppointmentList />
        </div>
      </AppointmentsProvider>
    </PatientsProvider>
  )
}

