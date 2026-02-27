"use client"

import { useAuth } from "@/lib/context/auth"
import { LoginForm } from "@/components/login-form"
import { Sidebar } from "@/components/sidebar"
import { AdminDashboard } from "@/components/admin-dashboard"
import { DoctorDashboard } from "@/components/doctor-dashboard"
import { StaffDashboard } from "@/components/staff-dashboard"
import { PatientDashboard } from "@/components/patient-dashboard"
import { useEffect, useState } from "react"

function DashboardContent() {
  const { user } = useAuth()

  if (!user) {
    return <LoginForm />
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {user.role === "admin" && <AdminDashboard />}
          {user.role === "doctor" && <DoctorDashboard />}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return <DashboardContent />
}
