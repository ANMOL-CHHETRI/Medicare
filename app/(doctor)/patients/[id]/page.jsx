"use client"

import { use } from "react"
import { PatientDetail } from "@/components/patients/patient-detail"

export default function DoctorPatientDetailPage({ params }) {
  const { id } = use(params)
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PatientDetail patientId={id} />
    </div>
  )
}

