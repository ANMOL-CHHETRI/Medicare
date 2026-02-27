"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/context/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Users, Clock, FileText, Eye, ArrowRight, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

const statusColors = {
  Scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

export function DoctorDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const doctorId = user?.id
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [patients, setPatients] = useState([])
  const [reports, setReports] = useState([])
  const [appointments, setAppointments] = useState([])

  useEffect(() => {
    async function load() {
      if (!doctorId) return
      setLoading(true)
      setError("")
      try {
        const [pRes, rRes, aRes] = await Promise.all([
          fetch(`/api/patients?doctorId=${doctorId}`, { cache: "no-store" }),
          fetch(`/api/reports?doctorId=${doctorId}`, { cache: "no-store" }),
          fetch(`/api/appointments?doctorId=${doctorId}`, { cache: "no-store" }),
        ])
        if (!pRes.ok) throw new Error("Failed to load patients")
        if (!rRes.ok) throw new Error("Failed to load reports")
        if (!aRes.ok) throw new Error("Failed to load appointments")
        const pJson = await pRes.json()
        const rJson = await rRes.json()
        const aJson = await aRes.json()
        setPatients(pJson.patients || [])
        setReports(rJson.reports || [])
        setAppointments(aJson.appointments || [])
      } catch (e) {
        setError(e.message || "Failed to load dashboard")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [doctorId])

  // Calculate today's appointments
  const todayAppointments = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return appointments.filter((apt) => {
      const aptDate = apt.date instanceof Date ? apt.date : new Date(apt.date)
      aptDate.setHours(0, 0, 0, 0)
      return aptDate.getTime() === today.getTime() && apt.status === "Scheduled"
    })
  }, [appointments])

  const totalPatients = patients.length
  const totalAppointments = appointments.length
  const pendingReviews = useMemo(() => reports.filter((r) => !r.findings)?.length || 0, [reports])
  const upcomingAppointments = useMemo(() => {
    const now = new Date()
    return appointments
      .filter((apt) => {
        const aptDate = apt.date instanceof Date ? apt.date : new Date(apt.date)
        return aptDate >= now && apt.status === "Scheduled"
      })
      .sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date)
        const dateB = b.date instanceof Date ? b.date : new Date(b.date)
        return dateA.getTime() - dateB.getTime()
      })
      .slice(0, 5)
  }, [appointments])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Doctor Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back{user?.name ? `, Dr. ${user.name}` : ""}</p>
        </div>
        <Button onClick={handleLogout} variant="outline" className="gap-2">
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Today's Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todayAppointments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Scheduled for today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPatients}</div>
            <p className="text-xs text-muted-foreground mt-1">Assigned to you</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Total Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalAppointments}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Pending Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingReviews}</div>
            <p className="text-xs text-muted-foreground mt-1">Reports without findings</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your next scheduled appointments</CardDescription>
            </div>
            <Link href="/appointments">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : upcomingAppointments.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingAppointments.map((apt) => {
                    const aptDate = apt.date instanceof Date ? apt.date : new Date(apt.date)
                    return (
                      <TableRow key={apt.id}>
                        <TableCell className="font-medium">
                          {apt.patient?.name || "Unknown"}
                        </TableCell>
                        <TableCell>{aptDate.toLocaleDateString()}</TableCell>
                        <TableCell>{apt.time}</TableCell>
                        <TableCell className="max-w-xs truncate">{apt.reason || "-"}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[apt.status] || statusColors.Scheduled}>
                            {apt.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/appointments/${apt.id}`}>
                            <Button size="sm" variant="ghost">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground">No upcoming appointments</p>
          )}
        </CardContent>
      </Card>

      {/* Assigned Patients */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Assigned Patients</CardTitle>
              <CardDescription>Patients currently assigned to you</CardDescription>
            </div>
            <Link href="/patients">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : patients.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.age} yrs</TableCell>
                      <TableCell className="capitalize">{p.gender}</TableCell>
                      <TableCell>{p.contactNumber || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/patients/${p.id}`}>
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground">No assigned patients</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>Your latest medical reports</CardDescription>
            </div>
            <Link href="/reports">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : reports.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Date Issued</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.slice(0, 10).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.title}</TableCell>
                      <TableCell>{r.patient?.name || "Unknown"}</TableCell>
                      <TableCell>
                        {new Date(r.dateIssued || r.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {r.findings ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Completed
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/reports/${r.id}`}>
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground">No reports yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
