"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/context/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import Link from "next/link"

export default function DoctorPatientsPage() {
  const { user } = useAuth()
  const doctorId = user?.id
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [patients, setPatients] = useState([])

  useEffect(() => {
    async function load() {
      if (!doctorId) return
      setLoading(true)
      setError("")
      try {
        const res = await fetch(`/api/patients?doctorId=${doctorId}`, { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to load patients")
        const data = await res.json()
        setPatients(data.patients || [])
      } catch (e) {
        setError(e.message || "Failed to load patients")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [doctorId])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Patients</h1>
        <p className="text-muted-foreground mt-1">Patients assigned to you</p>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Assigned Patients</CardTitle>
          <CardDescription>Total Patients: {patients.length}</CardDescription>
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
                    <TableHead>Address</TableHead>
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
                      <TableCell className="max-w-xs truncate">{p.address || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/patients/${p.id}`}>
                          <Button size="sm" variant="ghost" title="View">
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
    </div>
  )
}

