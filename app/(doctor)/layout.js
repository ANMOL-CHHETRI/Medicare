"use client"

import { AuthProvider } from "@/lib/context/auth"
import { PatientsProvider } from "@/lib/context/patients"
import { AppointmentsProvider } from "@/lib/context/appointments"
import { MedicalRecordsProvider } from "@/lib/context/medical-records"
import { Sidebar } from "@/components/sidebar"

export default function DoctorLayout({ children }) {
  return (
    <AuthProvider>
      <PatientsProvider>
        <AppointmentsProvider>
          <MedicalRecordsProvider>
            <div className="flex min-h-screen">
              <div className="flex-1 overflow-y-auto">
                {children}
              </div>
            </div>
          </MedicalRecordsProvider>
        </AppointmentsProvider>
      </PatientsProvider>
    </AuthProvider>
  )
}
