"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppointments } from "@/lib/context/appointments"
import { usePatients } from "@/lib/context/patients"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AppointmentForm({ appointment, onSubmit, onCancel }) {
  const router = useRouter()
  const { addAppointment, updateAppointment, isLoading } = useAppointments()
  const { patients } = usePatients()
  const [doctors, setDoctors] = useState([])
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState({
    patient: appointment?.patient?.id || appointment?.patient || "",
    doctor: appointment?.doctor?.id || appointment?.doctor || "",
    date: appointment?.date 
      ? (appointment.date instanceof Date 
          ? appointment.date.toISOString().split("T")[0] 
          : new Date(appointment.date).toISOString().split("T")[0])
      : "",
    time: appointment?.time || "",
    reason: appointment?.reason || "",
    status: appointment?.status || "Scheduled",
  })

  // Fetch doctors for dropdown
  useEffect(() => {
    async function fetchDoctors() {
      setLoadingDoctors(true)
      try {
        const res = await fetch("/api/doctors", { cache: "no-store" })
        if (res.ok) {
          const data = await res.json()
          setDoctors(data.doctors || [])
        }
      } catch (err) {
        console.error("Failed to fetch doctors", err)
      } finally {
        setLoadingDoctors(false)
      }
    }
    fetchDoctors()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!formData.patient) {
      setError("Patient is required")
      return
    }

    if (!formData.doctor) {
      setError("Doctor is required")
      return
    }

    if (!formData.date) {
      setError("Date is required")
      return
    }

    if (!formData.time) {
      setError("Time is required")
      return
    }

    try {
      // Prepare data for API
      const appointmentData = {
        patient: formData.patient,
        doctor: formData.doctor,
        date: formData.date,
        time: formData.time,
        reason: formData.reason.trim() || undefined,
        status: formData.status,
      }

      if (appointment?.id) {
        // Update existing appointment
        await updateAppointment(appointment.id, appointmentData)
      } else {
        // Create new appointment
        await addAppointment(appointmentData)
      }

      // Call onSubmit callback if provided
      if (onSubmit) {
        onSubmit()
      } else {
        // Reset form if no callback
        setFormData({
          patient: "",
          doctor: "",
          date: "",
          time: "",
          reason: "",
          status: "Scheduled",
        })
      }
    } catch (err) {
      setError(err.message || "Failed to save appointment")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {appointment?.id ? "Edit Appointment" : "New Appointment"}
        </h2>
        <p className="text-muted-foreground mt-1">
          {appointment?.id ? "Update appointment information" : "Schedule a new appointment"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Appointment Details</CardTitle>
            <CardDescription>Required appointment information</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient">
                Patient <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.patient ? formData.patient : "none"}
                onValueChange={(value) => handleSelectChange("patient", value === "none" ? "" : value)}
              >
                <SelectTrigger id="patient">
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select a patient</SelectItem>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctor">
                Doctor <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.doctor ? formData.doctor : "none"}
                onValueChange={(value) => handleSelectChange("doctor", value === "none" ? "" : value)}
                disabled={loadingDoctors}
              >
                <SelectTrigger id="doctor">
                  <SelectValue placeholder={loadingDoctors ? "Loading doctors..." : "Select a doctor"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select a doctor</SelectItem>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name} {doctor.email ? `(${doctor.email})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">
                Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">
                Time <span className="text-destructive">*</span>
              </Label>
              <Input
                id="time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="reason">Reason for Visit</Label>
              <Textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Enter reason for the appointment"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : appointment?.id ? "Update Appointment" : "Create Appointment"}
          </Button>
        </div>
      </form>
    </div>
  )
}
