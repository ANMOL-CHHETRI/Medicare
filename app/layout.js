import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/context/auth"
import { Sidebar } from "@/components/sidebar"
import { PatientsProvider } from "@/lib/context/patients"
import { AppointmentsProvider } from "@/lib/context/appointments"
import { MedicalRecordsProvider } from "@/lib/context/medical-records"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata = {
  title: "Patient Management System",
  description: "Comprehensive healthcare management platform",
}

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
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
      </body>
    </html>
  )
}
