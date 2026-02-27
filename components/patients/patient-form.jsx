"use client"

import { useState, useEffect } from "react"
import { usePatients } from "@/lib/context/patients"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function PatientForm({ patient, onSubmit, onCancel }) {
  const { addPatient, updatePatient, isLoading } = usePatients()
  const [doctors, setDoctors] = useState([])
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: patient?.name || "",
    age: patient?.age || "",
    gender: patient?.gender || "",
    contactNumber: patient?.contactNumber || "",
    address: patient?.address || "",
    medicalHistory: patient?.medicalHistory?.join("\n") || "",
    assignedDoctor: patient?.assignedDoctor?.id || patient?.assignedDoctor || "",
  })

  // Fetch doctors for dropdown
  useEffect(() => {
    async function fetchDoctors() {
      setLoadingDoctors(true)
      try {
        const res = await fetch("/api/doctors", { cache: "no-store" })
        if (res.ok) {
          const data = await res.json()
          setDoctors(data.doctors || [])
        }
      } catch (err) {
        console.error("Failed to fetch doctors", err)
      } finally {
        setLoadingDoctors(false)
      }
    }
    fetchDoctors()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!formData.name || !formData.name.trim()) {
      setError("Name is required")
      return
    }

    if (!formData.age || isNaN(formData.age) || Number(formData.age) <= 0) {
      setError("Valid age is required")
      return
    }

    if (!formData.gender) {
      setError("Gender is required")
      return
    }

    try {
      // Prepare data for API
      const patientData = {
        name: formData.name.trim(),
        age: Number(formData.age),
        gender: formData.gender,
        contactNumber: formData.contactNumber.trim() || undefined,
        address: formData.address.trim() || undefined,
        medicalHistory: formData.medicalHistory
          ? formData.medicalHistory.split("\n").filter((line) => line.trim())
          : undefined,
        assignedDoctor: formData.assignedDoctor && formData.assignedDoctor !== "none" ? formData.assignedDoctor : undefined,
      }

      if (patient?.id) {
        // Update existing patient
        await updatePatient(patient.id, patientData)
      } else {
        // Create new patient
        await addPatient(patientData)
      }

      // Call onSubmit callback if provided
      if (onSubmit) {
        onSubmit()
      } else {
        // Reset form if no callback
        setFormData({
          name: "",
          age: "",
          gender: "",
          contactNumber: "",
          address: "",
          medicalHistory: "",
          assignedDoctor: "",
        })
      }
    } catch (err) {
      setError(err.message || "Failed to save patient")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {patient?.id ? "Edit Patient" : "New Patient"}
        </h2>
        <p className="text-muted-foreground mt-1">
          {patient?.id ? "Update patient information" : "Add a new patient to the system"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Required patient details</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter patient name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">
                Age <span className="text-destructive">*</span>
              </Label>
              <Input
                id="age"
                name="age"
                type="number"
                min="1"
                max="150"
                value={formData.age}
                onChange={handleChange}
                placeholder="Enter age"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">
                Gender <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleSelectChange("gender", value)}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                name="contactNumber"
                type="tel"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="Enter contact number"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Optional patient details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter patient address"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicalHistory">Medical History</Label>
              <Textarea
                id="medicalHistory"
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleChange}
                placeholder="Enter medical history (one item per line)"
                rows={4}
              />
              <p className="text-sm text-muted-foreground">
                Enter each medical history item on a new line
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedDoctor">Assigned Doctor</Label>
              <Select
                value={formData.assignedDoctor ? formData.assignedDoctor : "none"}
                onValueChange={(value) => handleSelectChange("assignedDoctor", value === "none" ? "" : value)}
                disabled={loadingDoctors}
              >
                <SelectTrigger id="assignedDoctor" className="w-full">
                  <SelectValue placeholder={loadingDoctors ? "Loading doctors..." : "Select a doctor (optional)"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name} {doctor.email ? `(${doctor.email})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : patient?.id ? "Update Patient" : "Create Patient"}
          </Button>
        </div>
      </form>
    </div>
  )
}

