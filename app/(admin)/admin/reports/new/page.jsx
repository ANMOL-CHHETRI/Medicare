"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function NewReportPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [form, setForm] = useState({ patient: "", doctor: "", title: "", description: "", findings: "" })

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
        setDoctors(dJson.doctors || [])
      } catch (e) {
        setError(e.message || "Failed to load options")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function onSubmit(e) {
    e.preventDefault()
    setError("")
    const res = await fetch("/api/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    if (res.ok) {
      router.push("/admin/reports")
    } else {
      const body = await res.json().catch(() => ({}))
      setError(body.message || "Failed to create report")
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-xl font-semibold mb-4">New Report</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-destructive mb-2">{error}</p>}
      {!loading && (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Patient</Label>
              <Select value={form.patient} onValueChange={(v) => setForm((f) => ({ ...f, patient: v }))}>
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
              <Label>Doctor</Label>
              <Select value={form.doctor} onValueChange={(v) => setForm((f) => ({ ...f, doctor: v }))}>
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
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Findings</Label>
            <Textarea value={form.findings} onChange={(e) => setForm((f) => ({ ...f, findings: e.target.value }))} rows={4} />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Create</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/reports")}>Cancel</Button>
          </div>
        </form>
      )}
    </div>
  )
}


