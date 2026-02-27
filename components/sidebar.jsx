"use client"

import { useAuth } from "@/lib/context/auth"
import { Button } from "@/components/ui/button"
import { LogOut, Users, Calendar, FileText, CreditCard, Bell, BarChart3, Home } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const menuItems = {
  admin: [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/admin/patients", label: "Patients", icon: Users },
    { href: "/admin/appointments", label: "Appointments", icon: Calendar },
    { href: "/admin/assignments", label: "Assignments", icon: Users },
    { href: "/admin/doctors", label: "Doctors", icon: Users },
    { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  ],
  doctor: [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/patients", label: "My Patients", icon: Users },
    { href: "/appointments", label: "Schedule", icon: Calendar },
    { href: "/reports", label: "Report", icon: FileText },
  ],
  staff: [
    { href: "/staff", label: "Dashboard", icon: Home },
    { href: "/staff/appointments", label: "Appointments", icon: Calendar },
    { href: "/staff/patients", label: "Patient Directory", icon: Users },
  ],
  patient: [
    { href: "/patient", label: "Dashboard", icon: Home },
    { href: "/patient/appointments", label: "My Appointments", icon: Calendar },
    { href: "/patient/records", label: "Medical Records", icon: FileText },
    { href: "/patient/notifications", label: "Notifications", icon: Bell },
  ],
}

export function Sidebar() {
  const { user, logout } = useAuth()
  const router = useRouter()

  if (!user) return null

  const items = menuItems[user.role] || []

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground">HealthCare</h1>
        <p className="text-xs text-sidebar-foreground/60 mt-1 capitalize">{user.role}</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-3">
        <div className="text-sm">
          <p className="font-medium text-sidebar-foreground">{user.name}</p>
          <p className="text-xs text-sidebar-foreground/60">{user.email}</p>
        </div>
        <Button onClick={handleLogout} variant="outline" className="w-full justify-start gap-2 bg-transparent">
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
