"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/context/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, Calendar } from "lucide-react"
import Link from "next/link"

const statusColors = {
  Scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

export default function DoctorAppointmentsPage() {
  const { user } = useAuth()
  const doctorId = user?.id
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [appointments, setAppointments] = useState([])

  useEffect(() => {
    async function load() {
      if (!doctorId) return
      setLoading(true)
      setError("")
      try {
        const res = await fetch(`/api/appointments?doctorId=${doctorId}`, { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to load appointments")
        const data = await res.json()
        setAppointments(data.appointments || [])
      } catch (e) {
        setError(e.message || "Failed to load appointments")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [doctorId])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Appointments</h1>
        <p className="text-muted-foreground mt-1">All your scheduled appointments</p>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Appointment Schedule</CardTitle>
          <CardDescription>Total Appointments: {appointments.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : appointments.length > 0 ? (
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
                  {appointments.map((apt) => {
                    const aptDate = apt.date instanceof Date ? apt.date : new Date(apt.date)
                    return (
                      <TableRow key={apt.id}>
                        <TableCell className="font-medium">
                          {apt.patient?.name || "Unknown"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {aptDate.toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>{apt.time}</TableCell>
                        <TableCell className="max-w-xs truncate">{apt.reason || "-"}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[apt.status] || statusColors.Scheduled}>
                            {apt.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/appointments/${apt.id}`}>
                            <Button size="sm" variant="ghost" title="View">
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
            <p className="text-muted-foreground">No appointments found</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

