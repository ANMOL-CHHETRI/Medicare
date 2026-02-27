"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { usePatients } from "@/lib/context/patients"
import { MedicalRecordsProvider } from "@/lib/context/medical-records"
import { RecordForm } from "@/components/medical-records/record-form"

export default function NewRecordPage({ params }) {
  const { id } = use(params)
  const router = useRouter()
  const { getPatient } = usePatients()
  const patient = getPatient(id)

  if (!patient) {
    return <div className="text-center text-muted-foreground">Patient not found</div>
  }

  return (
    <MedicalRecordsProvider>
      <RecordForm
        patientId={id}
        onSubmit={() => {
          router.push(`/admin/patients/${id}/records`)
        }}
      />
    </MedicalRecordsProvider>
  )
}
