"use client"

import { use } from "react"
import { usePatients } from "@/lib/context/patients"
import { MedicalRecordsProvider } from "@/lib/context/medical-records"
import { RecordList } from "@/components/medical-records/record-list"

export default function PatientRecordsPage({ params }) {
  const { id } = use(params)
  const { getPatient } = usePatients()
  const patient = getPatient(id)

  if (!patient) {
    return <div className="text-center text-muted-foreground">Patient not found</div>
  }

  return (
    <MedicalRecordsProvider>
      <RecordList patientId={id} patientName={patient.name} />
    </MedicalRecordsProvider>
  )
}
