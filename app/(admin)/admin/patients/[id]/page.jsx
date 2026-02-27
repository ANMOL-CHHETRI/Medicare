"use client"

import { use } from "react"
import { PatientsProvider } from "@/lib/context/patients"
import { PatientDetail } from "@/components/patients/patient-detail"

export default function PatientDetailPage({ params }) {
  const { id } = use(params)
  
  return (
    <PatientsProvider>
      <div className="p-6 max-w-6xl mx-auto">
        <PatientDetail patientId={id} />
      </div>
    </PatientsProvider>
  )
}

