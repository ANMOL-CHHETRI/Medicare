"use client"

import { useEffect, useState } from "react"
import { useAppointments } from "@/lib/context/appointments"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, ArrowLeft } from "lucide-react"
import Link from "next/link"

const statusColors = {
  Scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

export function AppointmentDetail({ appointmentId }) {
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

  // Determine if we're in doctor context by checking the current path
  const isDoctorContext = typeof window !== "undefined" && window.location.pathname.startsWith("/doctor")
  const backUrl = isDoctorContext ? "/appointments" : "/admin/appointments"
  const editUrl = isDoctorContext ? `/appointments/${appointmentId}/edit` : `/admin/appointments/${appointmentId}/edit`

  if (loading) {
    return (
      <div className="space-y-6">
        <Link href={backUrl}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Appointments
          </Button>
        </Link>
        <div className="text-center text-muted-foreground py-8">Loading appointment...</div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="space-y-6">
        <Link href={backUrl}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Appointments
          </Button>
        </Link>
        <div className="text-center text-muted-foreground py-8">Appointment not found</div>
      </div>
    )
  }

  const appointmentDate = appointment.date instanceof Date 
    ? appointment.date 
    : new Date(appointment.date)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href={backUrl}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Appointment Details</h1>
              <p className="text-muted-foreground mt-1">Appointment ID: {appointment.id}</p>
            </div>
          </div>
        </div>
        {!isDoctorContext && (
          <Link href={editUrl}>
            <Button>
              <Edit className="w-4 h-4 mr-2" />
              Edit Appointment
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>Patient details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {appointment.patient ? (
              <>
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{appointment.patient.name}</p>
                </div>
                {appointment.patient.age && (
                  <div>
                    <p className="text-muted-foreground">Age</p>
                    <p className="font-medium">{appointment.patient.age} years old</p>
                  </div>
                )}
                {appointment.patient.gender && (
                  <div>
                    <p className="text-muted-foreground">Gender</p>
                    <p className="font-medium capitalize">{appointment.patient.gender}</p>
                  </div>
                )}
                {appointment.patient.contactNumber && (
                  <div>
                    <p className="text-muted-foreground">Contact Number</p>
                    <p className="font-medium">{appointment.patient.contactNumber}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">Patient information not available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Doctor Information</CardTitle>
            <CardDescription>Assigned doctor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {appointment.doctor ? (
              <>
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{appointment.doctor.name}</p>
                </div>
                {appointment.doctor.email && (
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{appointment.doctor.email}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">Doctor information not available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>Appointment date and time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Date</p>
              <p className="font-medium">{appointmentDate.toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Time</p>
              <p className="font-medium">{appointment.time}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>Current appointment status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground mb-2">Status</p>
              <Badge className={statusColors[appointment.status] || statusColors.Scheduled}>
                {appointment.status}
              </Badge>
            </div>
            {appointment.createdAt && (
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="font-medium">
                  {new Date(appointment.createdAt).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {appointment.reason && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Reason for Visit</CardTitle>
              <CardDescription>Appointment purpose</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{appointment.reason}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
