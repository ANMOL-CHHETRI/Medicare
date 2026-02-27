"use client"

import { useRouter } from "next/navigation"
import { AppointmentsProvider } from "@/lib/context/appointments"
import { AppointmentForm } from "@/components/appointments/appointment-form"

export default function NewAppointmentPage() {
  const router = useRouter()

  return (
    <AppointmentsProvider>
      <AppointmentForm
        onSubmit={() => {
          router.push("/admin/appointments")
        }}
      />
    </AppointmentsProvider>
  )
}
