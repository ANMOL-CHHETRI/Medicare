"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AssignmentsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [selectedPatient, setSelectedPatient] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState("")

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError("")
      try {
        const [pRes, dRes] = await Promise.all([
          fetch("/api/patients", { cache: "no-store" }),
          fetch("/api/doctors", { cache: "no-store" }),
        ])
        if (!pRes.ok) throw new Error("Failed to load patients")
        if (!dRes.ok) throw new Error("Failed to load doctors")
        const pJson = await pRes.json()
        const dJson = await dRes.json()
        setPatients(pJson.patients || [])
        setDoctors((dJson.doctors || []).map((d) => ({ id: d.id, name: d.name, email: d.email })))
      } catch (e) {
        setError(e.message || "Failed to load assignments")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function assign() {
    if (!selectedPatient || !selectedDoctor) return
    const res = await fetch(`/api/patients/${selectedPatient}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedDoctor: selectedDoctor })
    })
    if (res.ok) {
      alert("Assigned successfully")
    } else {
      const body = await res.json().catch(() => ({}))
      alert(body.message || "Assignment failed")
    }
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Assign Patient to Doctor</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 max-w-xl">
          {loading && <p>Loading...</p>}
          {error && <p className="text-destructive">{error}</p>}
          <div className="space-y-2">
            <label className="text-sm font-medium">Patient</label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger>
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name || `${p.firstName || ""} ${p.lastName || ""}`}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Doctor</label>
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger>
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name} ({d.email})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Button onClick={assign} disabled={!selectedPatient || !selectedDoctor}>Assign</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


