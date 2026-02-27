"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table"

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reports, setReports] = useState([])

  async function load() {
    try {
      setLoading(true)
      const res = await fetch("/api/reports", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to fetch reports")
      const data = await res.json()
      setReports(data.reports || [])
    } catch (e) {
      setError(e.message || "Error loading reports")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id) {
    if (!confirm("Delete this report?")) return
    const res = await fetch(`/api/reports/${id}`, { method: "DELETE" })
    if (res.status === 204) {
      setReports((prev) => prev.filter((r) => r.id !== id))
    } else {
      const body = await res.json().catch(() => ({}))
      alert(body.message || "Failed to delete")
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Reports</h2>
        <Link href="/admin/reports/new">
          <Button>New Report</Button>
        </Link>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-destructive">{error}</p>}

      {!loading && !error && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.title}</TableCell>
                <TableCell>{r.patient?.name || "-"}</TableCell>
                <TableCell>{r.doctor?.name || "-"}</TableCell>
                <TableCell>{new Date(r.dateIssued || r.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Link href={`/admin/reports/${r.id}/edit`}>
                      <Button size="sm" variant="outline">Edit</Button>
                    </Link>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(r.id)}>Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}


