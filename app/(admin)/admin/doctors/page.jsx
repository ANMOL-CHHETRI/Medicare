"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table"

export default function DoctorsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [doctors, setDoctors] = useState([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createError, setCreateError] = useState("")
  const [createForm, setCreateForm] = useState({ name: "", email: "", password: "" })

  async function load() {
    try {
      setLoading(true)
      const res = await fetch("/api/doctors", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to fetch doctors")
      const data = await res.json()
      setDoctors(data.doctors || [])
    } catch (e) {
      setError(e.message || "Error loading doctors")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id) {
    if (!confirm("Delete this doctor?")) return
    const res = await fetch(`/api/doctors/${id}`, { method: "DELETE" })
    if (res.status === 204) {
      setDoctors((prev) => prev.filter((d) => d.id !== id))
    } else {
      const body = await res.json().catch(() => ({}))
      alert(body.message || "Failed to delete")
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Doctors</h2>
        <Button onClick={() => setIsCreateOpen(true)}>Add Doctor</Button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-destructive">{error}</p>}

      {!loading && !error && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doctors.map((d) => (
              <TableRow key={d.id}>
                <TableCell>{d.name}</TableCell>
                <TableCell>{d.email}</TableCell>
                <TableCell>{new Date(d.createdAt).toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Link href={`/admin/doctors/${d.id}/edit`}>
                      <Button size="sm" variant="outline">Edit</Button>
                    </Link>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(d.id)}>Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <AlertDialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create Doctor</AlertDialogTitle>
          </AlertDialogHeader>
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault()
              setCreateError("")
              if (!createForm.name.trim()) return setCreateError("Name is required")
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email)) return setCreateError("Valid email is required")
              if (typeof createForm.password !== "string" || createForm.password.length < 8) return setCreateError("Password must be at least 8 characters")
              const res = await fetch("/api/doctors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(createForm) })
              if (res.ok) {
                const data = await res.json()
                setDoctors((prev) => [{ id: data.user.id, name: data.user.name, email: data.user.email, role: data.user.role, createdAt: data.user.createdAt }, ...prev])
                setIsCreateOpen(false)
                setCreateForm({ name: "", email: "", password: "" })
              } else {
                const body = await res.json().catch(() => ({}))
                setCreateError(body.message || "Failed to create doctor")
              }
            }}
          >
            {createError && <p className="text-destructive text-sm">{createError}</p>}
            <div className="space-y-2">
              <Label htmlFor="doc-name">Name</Label>
              <Input id="doc-name" value={createForm.name} onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc-email">Email</Label>
              <Input id="doc-email" type="email" value={createForm.email} onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc-password">Password</Label>
              <Input id="doc-password" type="password" value={createForm.password} onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))} required />
              <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


