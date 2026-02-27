"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PatientsProvider } from "@/lib/context/patients"
import { PatientForm } from "@/components/patients/patient-form"
import { usePatients } from "@/lib/context/patients"

function EditPatientContent({ patientId }) {
  const router = useRouter()
  const { getPatient } = usePatients()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try to get from context first
    const contextPatient = getPatient(patientId)
    if (contextPatient) {
      setPatient(contextPatient)
      setLoading(false)
    } else {
      // Fetch directly from API if not in context
      async function fetchPatient() {
        try {
          const res = await fetch(`/api/patients/${patientId}`, { cache: "no-store" })
          if (res.ok) {
            const data = await res.json()
            setPatient(data.patient)
          }
        } catch (err) {
          console.error("Failed to fetch patient", err)
        } finally {
          setLoading(false)
        }
      }
      fetchPatient()
    }
  }, [patientId, getPatient])

  if (loading) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>Loading patient...</p>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>Patient not found</p>
      </div>
    )
  }

  return (
    <PatientForm
      patient={patient}
      onSubmit={() => {
        router.push(`/admin/patients/${patientId}`)
      }}
      onCancel={() => {
        router.push(`/admin/patients/${patientId}`)
      }}
    />
  )
}

export default function EditPatientPage({ params }) {
  const { id } = use(params)
  
  return (
    <PatientsProvider>
      <div className="p-6 max-w-4xl mx-auto">
        <EditPatientContent patientId={id} />
      </div>
    </PatientsProvider>
  )
}
