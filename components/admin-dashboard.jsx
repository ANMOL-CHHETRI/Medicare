"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Users, Calendar, CreditCard, AlertCircle } from "lucide-react"

const dashboardStats = [
  { label: "Total Patients", value: "2,348", icon: Users, trend: "+12%" },
  { label: "Appointments Today", value: "24", icon: Calendar, trend: "+5%" },
  { label: "Revenue This Month", value: "$45,231", icon: CreditCard, trend: "+18%" },
  { label: "Pending Issues", value: "8", icon: AlertCircle, trend: "-2%" },
]

const appointmentData = [
  { date: "Mon", completed: 12, cancelled: 2, pending: 4 },
  { date: "Tue", completed: 15, cancelled: 1, pending: 3 },
  { date: "Wed", completed: 10, cancelled: 3, pending: 5 },
  { date: "Thu", completed: 18, cancelled: 0, pending: 2 },
  { date: "Fri", completed: 14, cancelled: 2, pending: 4 },
  { date: "Sat", completed: 8, cancelled: 1, pending: 6 },
  { date: "Sun", completed: 5, cancelled: 0, pending: 3 },
]

const patientsByDepartment = [
  { department: "Cardiology", patients: 324 },
  { department: "Orthopedics", patients: 287 },
  { department: "Neurology", patients: 256 },
  { department: "Dermatology", patients: 198 },
  { department: "Pediatrics", patients: 165 },
]

export function AdminDashboard() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState({ name: "", email: "", password: "" })
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleCreateDoctor = async (e) => {
    e.preventDefault()
    setCreating(true)
    setMessage("")
    const nextErrors = { name: "", email: "", password: "" }
    if (name.trim().length < 2) nextErrors.name = "Name must be at least 2 characters"
    if (!/.+@.+\..+/.test(email)) nextErrors.email = "Enter a valid email address"
    if (password.length < 8) nextErrors.password = "Password must be at least 8 characters"
    setErrors(nextErrors)
    if (nextErrors.name || nextErrors.email || nextErrors.password) {
      setCreating(false)
      return
    }
    try {
      const res = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || "Failed to create doctor")
      setMessage("Doctor created successfully")
      setName("")
      setEmail("")
      setPassword("")
    } catch (err) {
      setMessage(err.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to the admin dashboard</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="h-10" />
        <Button onClick={() => { setShowCreateModal(true); setMessage("") }}>New Doctor</Button>
      </div>

      {showCreateModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreateModal(false)} />
          <div className="relative z-10 w-full max-w-lg mx-4 rounded-lg border bg-card">
            <CardHeader>
              <CardTitle>Create Doctor</CardTitle>
              <CardDescription>Add a new doctor account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={async (e) => { await handleCreateDoctor(e); if (!Object.values(errors).some(Boolean) && !creating) { /* close after success */ if (message && message.toLowerCase().includes("success")) setShowCreateModal(false) } }} className="grid gap-4">
                {message ? <p className="text-sm">{message}</p> : null}
                <div className="grid gap-2">
                  <Label htmlFor="doc-name">Full name</Label>
                  <Input id="doc-name"  value={name} onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: "" })) }} required />
                  {errors.name ? <p className="text-xs text-red-600">{errors.name}</p> : null}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="doc-email">Email</Label>
                  <Input id="doc-email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: "" })) }} required />
                  {errors.email ? <p className="text-xs text-red-600">{errors.email}</p> : null}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="doc-pass">Password</Label>
                  <Input id="doc-pass" type="password" value={password} onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: "" })) }} required />
                  {errors.password ? <p className="text-xs text-red-600">{errors.password}</p> : null}
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                  <Button type="submit" disabled={creating}>{creating ? "Creating..." : "Create Doctor"}</Button>
                </div>
              </form>
            </CardContent>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <span className="text-sm text-green-600">{stat.trend}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Appointment Trends</CardTitle>
            <CardDescription>Weekly appointment status overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={appointmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="var(--chart-1)" />
                <Bar dataKey="pending" fill="var(--chart-2)" />
                <Bar dataKey="cancelled" fill="var(--destructive)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patients by Department</CardTitle>
            <CardDescription>Distribution across specialties</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={patientsByDepartment}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="department" stroke="var(--muted-foreground)" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip />
                <Line type="monotone" dataKey="patients" stroke="var(--chart-1)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
