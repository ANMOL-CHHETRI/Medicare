"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/context/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import Link from "next/link"

export default function DoctorReportsPage() {
  const { user } = useAuth()
  const doctorId = user?.id
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reports, setReports] = useState([])

  useEffect(() => {
    async function load() {
      if (!doctorId) return
      setLoading(true)
      setError("")
      try {
        const res = await fetch(`/api/reports?doctorId=${doctorId}`, { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to load reports")
        const data = await res.json()
        setReports(data.reports || [])
      } catch (e) {
        setError(e.message || "Failed to load reports")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [doctorId])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Reports</h1>
        <p className="text-muted-foreground mt-1">Medical reports you've created</p>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Medical Reports</CardTitle>
          <CardDescription>Total Reports: {reports.length}</CardDescription>
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
                  {reports.map((r) => (
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
            <p className="text-muted-foreground">No reports yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

