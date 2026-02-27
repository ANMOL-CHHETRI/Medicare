"use client"

import { useRouter } from "next/navigation"
import { AppointmentsProvider } from "@/lib/context/appointments"
import { PatientsProvider } from "@/lib/context/patients"
import { AppointmentForm } from "@/components/appointments/appointment-form"

export default function NewAppointmentPage() {
  const router = useRouter()

  return (
    <PatientsProvider>
      <AppointmentsProvider>
        <div className="p-6 max-w-4xl mx-auto">
          <AppointmentForm
            onSubmit={() => {
              router.push("/admin/appointments")
            }}
            onCancel={() => {
              router.push("/admin/appointments")
            }}
          />
        </div>
      </AppointmentsProvider>
    </PatientsProvider>
  )
}

