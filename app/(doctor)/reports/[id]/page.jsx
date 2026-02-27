"use client"

import { use, useEffect, useState } from "react"
import { useAuth } from "@/lib/context/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function DoctorReportDetailPage({ params }) {
  const { id } = use(params)
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [report, setReport] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError("")
      try {
        const res = await fetch(`/api/reports/${id}`, { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to load report")
        const data = await res.json()
        // Only show report if it belongs to the logged-in doctor
        if (data.report.doctor?.id === user?.id) {
          setReport(data.report)
        } else {
          setError("You don't have access to this report")
        }
      } catch (e) {
        setError(e.message || "Failed to load report")
      } finally {
        setLoading(false)
      }
    }
    if (id && user?.id) {
      load()
    }
  }, [id, user?.id])

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Link href="/reports">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Reports
          </Button>
        </Link>
        <div className="text-center text-muted-foreground py-8">Loading report...</div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="p-6 space-y-6">
        <Link href="/reports">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Reports
          </Button>
        </Link>
        <div className="text-center text-muted-foreground py-8">{error || "Report not found"}</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/reports">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{report.title}</h1>
              <p className="text-muted-foreground mt-1">Report ID: {report.id}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>Patient details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium">{report.patient?.name || "Unknown"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Report Information</CardTitle>
            <CardDescription>Report details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Date Issued</p>
              <p className="font-medium">
                {new Date(report.dateIssued || report.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="font-medium">{report.findings ? "Completed" : "Pending"}</p>
            </div>
          </CardContent>
        </Card>

        {report.description && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{report.description}</p>
            </CardContent>
          </Card>
        )}

        {report.findings && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Findings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{report.findings}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

