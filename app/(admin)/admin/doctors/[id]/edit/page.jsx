"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function EditDoctorPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ name: "", email: "", password: "" })

  useEffect(() => {
    async function load() {
      try {
        if (!id) return
        const res = await fetch(`/api/doctors/${id}`)
        if (!res.ok) throw new Error("Failed to load doctor")
        const data = await res.json()
        setForm({ name: data.user.name || "", email: data.user.email || "", password: "" })
      } catch (e) {
        setError(e.message || "Error loading doctor")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function onSubmit(e) {
    e.preventDefault()
    setError("")
    const payload = { name: form.name, email: form.email }
    if (form.password) payload.password = form.password
    const res = await fetch(`/api/doctors/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    if (res.ok) {
      router.push("/admin/doctors")
      router.refresh?.()
    } else {
      const body = await res.json().catch(() => ({}))
      setError(body.message || "Update failed")
    }
  }

  return (
    <div className="p-6 max-w-lg">
      <h2 className="text-xl font-semibold mb-4">Edit Doctor</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-destructive mb-2">{error}</p>}
      {!loading && (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">New Password (optional)</Label>
            <Input id="password" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Leave blank to keep current" />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Save</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/doctors")}>Cancel</Button>
          </div>
        </form>
      )}
    </div>
  )
}


