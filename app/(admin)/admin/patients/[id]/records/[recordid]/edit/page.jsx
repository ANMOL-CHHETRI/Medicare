"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { usePatients } from "@/lib/context/patients"
import { MedicalRecordsProvider } from "@/lib/context/medical-records"
import { useMedicalRecords } from "@/lib/context/medical-records"
import { RecordForm } from "@/components/medical-records/record-form"

function EditRecordContent({ patientId, recordId }) {
  const router = useRouter()
  const { getRecord } = useMedicalRecords()
  const record = getRecord(recordId)

  return (
    <RecordForm
      patientId={patientId}
      record={record}
      onSubmit={() => {
        router.push(`/admin/patients/${patientId}/records/${recordId}`)
      }}
    />
  )
}

export default function EditRecordPage({ params }) {
  const { id, recordId } = use(params)
  const { getPatient } = usePatients()
  const patient = getPatient(id)

  if (!patient) {
    return <div className="text-center text-muted-foreground">Patient not found</div>
  }

  return (
    <MedicalRecordsProvider>
      <EditRecordContent patientId={id} recordId={recordId} />
    </MedicalRecordsProvider>
  )
}
