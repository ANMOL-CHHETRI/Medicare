"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { AppointmentsProvider } from "@/lib/context/appointments"
import { AppointmentForm } from "@/components/appointments/appointment-form"
import { useAppointments } from "@/lib/context/appointments"

function EditAppointmentContent({ appointmentId }) {
  const router = useRouter()
  const { getAppointment } = useAppointments()
  const appointment = getAppointment(appointmentId)

  return (
    <AppointmentForm
      appointment={appointment}
      onSubmit={() => {
        router.push(`/admin/appointments/${appointmentId}`)
      }}
    />
  )
}

export default function EditAppointmentPage({ params }) {
  const { id } = use(params)
  
  return (
    <AppointmentsProvider>
      <EditAppointmentContent appointmentId={id} />
    </AppointmentsProvider>
  )
}
