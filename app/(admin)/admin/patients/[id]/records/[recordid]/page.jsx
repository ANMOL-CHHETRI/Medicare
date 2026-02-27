"use client"

import { use } from "react"
import { usePatients } from "@/lib/context/patients"
import { MedicalRecordsProvider } from "@/lib/context/medical-records"
import { RecordDetail } from "@/components/medical-records/record-detail"

export default function RecordDetailPage({ params }) {
  const { id, recordId } = use(params)
  const { getPatient } = usePatients()
  const patient = getPatient(id)

  if (!patient) {
    return <div className="text-center text-muted-foreground">Patient not found</div>
  }

  return (
    <MedicalRecordsProvider>
      <RecordDetail
        patientId={id}
        recordId={recordId}
        patientName={patient.name}
      />
    </MedicalRecordsProvider>
  )
}
