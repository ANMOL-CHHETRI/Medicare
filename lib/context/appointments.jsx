"use client"

import { createContext, useContext, useState, useCallback, useEffect } from "react"

const AppointmentsContext = createContext(undefined)

export function AppointmentsProvider({ children }) {
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Initial load from API
  useEffect(() => {
    let mounted = true
    ;(async () => {
      setIsLoading(true)
      try {
        const res = await fetch("/api/appointments", { cache: "no-store" })
        if (res.ok) {
          const data = await res.json()
          if (mounted) setAppointments(data.appointments || [])
        }
      } finally {
        if (mounted) setIsLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const addAppointment = useCallback(async (appointmentData) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to create appointment")
      }
      // Reload appointments list to get full data
      const listRes = await fetch("/api/appointments", { cache: "no-store" })
      if (listRes.ok) {
        const listData = await listRes.json()
        setAppointments(listData.appointments || [])
      } else {
        const data = await res.json()
        setAppointments((prev) => [...prev, data.appointment])
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateAppointment = useCallback(async (id, updates) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to update appointment")
      }
      // Reload appointments list to get updated data
      const listRes = await fetch("/api/appointments", { cache: "no-store" })
      if (listRes.ok) {
        const listData = await listRes.json()
        setAppointments(listData.appointments || [])
      } else {
        // Fallback: update locally
        setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)))
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateAppointmentStatus = useCallback(
    async (id, status) => {
      await updateAppointment(id, { status })
    },
    [updateAppointment],
  )

  const deleteAppointment = useCallback(async (id) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" })
      if (!res.ok && res.status !== 204) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to delete appointment")
      }
      setAppointments((prev) => prev.filter((a) => a.id !== id))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getAppointment = useCallback(
    (id) => {
      return appointments.find((a) => a.id === id)
    },
    [appointments],
  )

  const getAppointmentsByDate = useCallback(
    (date) => {
      const dateStr = date instanceof Date ? date.toISOString().split("T")[0] : date
      return appointments
        .filter((a) => {
          const appointmentDate = a.date instanceof Date 
            ? a.date.toISOString().split("T")[0] 
            : new Date(a.date).toISOString().split("T")[0]
          return appointmentDate === dateStr
        })
        .sort((a, b) => {
          const timeA = a.time || ""
          const timeB = b.time || ""
          return timeA.localeCompare(timeB)
        })
    },
    [appointments],
  )

  const getAppointmentsByPatient = useCallback(
    (patientId) => {
      return appointments
        .filter((a) => a.patient?.id === patientId)
        .sort((a, b) => {
          const dateA = new Date(a.date).getTime()
          const dateB = new Date(b.date).getTime()
          if (dateA !== dateB) return dateB - dateA
          return (b.time || "").localeCompare(a.time || "")
        })
    },
    [appointments],
  )

  const getAppointmentsByDoctor = useCallback(
    (doctorId) => {
      return appointments
        .filter((a) => a.doctor?.id === doctorId)
        .sort((a, b) => {
          const dateA = new Date(a.date).getTime()
          const dateB = new Date(b.date).getTime()
          if (dateA !== dateB) return dateB - dateA
          return (b.time || "").localeCompare(a.time || "")
        })
    },
    [appointments],
  )

  return (
    <AppointmentsContext.Provider
      value={{
        appointments,
        isLoading,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        getAppointment,
        getAppointmentsByDate,
        getAppointmentsByPatient,
        getAppointmentsByDoctor,
        updateAppointmentStatus,
      }}
    >
      {children}
    </AppointmentsContext.Provider>
  )
}

export function useAppointments() {
  const context = useContext(AppointmentsContext)
  if (context === undefined) {
    throw new Error("useAppointments must be used within AppointmentsProvider")
  }
  return context
}
