"use client"

import { createContext, useContext, useState, useCallback, useEffect } from "react"

const PatientsContext = createContext(undefined)

export function PatientsProvider({ children }) {
  const [patients, setPatients] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Initial load from API
  useEffect(() => {
    let mounted = true
    ;(async () => {
      setIsLoading(true)
      try {
        const res = await fetch("/api/patients", { cache: "no-store" })
        if (res.ok) {
          const data = await res.json()
          if (mounted) setPatients(data.patients || [])
        }
      } finally {
        if (mounted) setIsLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const addPatient = useCallback(async (patientData) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/patients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patientData) })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to create patient")
      }
      const data = await res.json()
      // Reload patients list to get full data
      const listRes = await fetch("/api/patients", { cache: "no-store" })
      if (listRes.ok) {
        const listData = await listRes.json()
        setPatients(listData.patients || [])
      } else {
        // Fallback: add the new patient from response
        setPatients((prev) => [...prev, data.patient])
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updatePatient = useCallback(async (id, updates) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/patients/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to update patient")
      }
      // Reload patients list to get updated data
      const listRes = await fetch("/api/patients", { cache: "no-store" })
      if (listRes.ok) {
        const listData = await listRes.json()
        setPatients(listData.patients || [])
      } else {
        // Fallback: update locally
        setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deletePatient = useCallback(async (id) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/patients/${id}`, { method: "DELETE" })
      if (!res.ok && res.status !== 204) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to delete patient")
      }
      setPatients((prev) => prev.filter((p) => p.id !== id))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getPatient = useCallback(
    (id) => {
      return patients.find((p) => p.id === id)
    },
    [patients],
  )

  return (
    <PatientsContext.Provider value={{ patients, isLoading, addPatient, updatePatient, deletePatient, getPatient }}>
      {children}
    </PatientsContext.Provider>
  )
}

export function usePatients() {
  const context = useContext(PatientsContext)
  if (context === undefined) {
    throw new Error("usePatients must be used within PatientsProvider")
  }
  return context
}
