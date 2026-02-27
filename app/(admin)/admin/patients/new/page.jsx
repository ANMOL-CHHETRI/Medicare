"use client"

import { useRouter } from "next/navigation"
import { PatientsProvider } from "@/lib/context/patients"
import { PatientForm } from "@/components/patients/patient-form"

export default function NewPatientPage() {
  const router = useRouter()

  return (
    <PatientsProvider>
      <div className="p-6 max-w-4xl mx-auto">
        <PatientForm
          onSubmit={() => {
            router.push("/admin/patients")
          }}
          onCancel={() => {
            router.push("/admin/patients")
          }}
        />
      </div>
    </PatientsProvider>
  )
}

