"use client"

import { PatientsProvider } from "@/lib/context/patients"
import { PatientList } from "@/components/patients/patient-list"

export default function PatientsPage() {
  return (
    <PatientsProvider>
      <PatientList />
    </PatientsProvider>
  )
}
