"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppointmentsProvider } from "@/lib/context/appointments"
import { PatientsProvider } from "@/lib/context/patients"
import { AppointmentForm } from "@/components/appointments/appointment-form"
import { useAppointments } from "@/lib/context/appointments"

function EditAppointmentContent({ appointmentId }) {
  const router = useRouter()
  const { getAppointment } = useAppointments()
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try to get from context first
    const contextAppointment = getAppointment(appointmentId)
    if (contextAppointment) {
      setAppointment(contextAppointment)
      setLoading(false)
    } else {
      // Fetch directly from API if not in context
      async function fetchAppointment() {
        try {
          const res = await fetch(`/api/appointments/${appointmentId}`, { cache: "no-store" })
          if (res.ok) {
            const data = await res.json()
            setAppointment(data.appointment)
          }
        } catch (err) {
          console.error("Failed to fetch appointment", err)
        } finally {
          setLoading(false)
        }
      }
      fetchAppointment()
    }
  }, [appointmentId, getAppointment])

  if (loading) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>Loading appointment...</p>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>Appointment not found</p>
      </div>
    )
  }

  return (
    <AppointmentForm
      appointment={appointment}
      onSubmit={() => {
        router.push(`/admin/appointments/${appointmentId}`)
      }}
      onCancel={() => {
        router.push(`/admin/appointments/${appointmentId}`)
      }}
    />
  )
}

export default function EditAppointmentPage({ params }) {
  const { id } = use(params)
  
  return (
    <PatientsProvider>
      <AppointmentsProvider>
        <div className="p-6 max-w-4xl mx-auto">
          <EditAppointmentContent appointmentId={id} />
        </div>
      </AppointmentsProvider>
    </PatientsProvider>
  )
}

