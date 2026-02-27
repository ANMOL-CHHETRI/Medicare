"use client"

import { useEffect, useState } from "react"
import { usePatients } from "@/lib/context/patients"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, ArrowLeft, User } from "lucide-react"
import Link from "next/link"

export function PatientDetail({ patientId }) {
  const { getPatient } = usePatients()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try to get from context first
    const contextPatient = getPatient(patientId)
    if (contextPatient) {
      setPatient(contextPatient)
      setLoading(false)
    } else {
      // Fetch directly from API if not in context
      async function fetchPatient() {
        try {
          const res = await fetch(`/api/patients/${patientId}`, { cache: "no-store" })
          if (res.ok) {
            const data = await res.json()
            setPatient(data.patient)
          }
        } catch (err) {
          console.error("Failed to fetch patient", err)
        } finally {
          setLoading(false)
        }
      }
      fetchPatient()
    }
  }, [patientId, getPatient])

  if (loading) {
    return (
      <div className="space-y-6">
        <Link href="/admin/patients">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Patients
          </Button>
        </Link>
        <div className="text-center text-muted-foreground py-8">Loading patient...</div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="space-y-6">
        <Link href="/admin/patients">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Patients
          </Button>
        </Link>
        <div className="text-center text-muted-foreground py-8">Patient not found</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/admin/patients">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{patient.name}</h1>
              <p className="text-muted-foreground mt-1">Patient ID: {patient.id}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/patients/${patient.id}/records`}>
            <Button variant="outline">View Records</Button>
          </Link>
          <Link href={`/admin/patients/${patient.id}/edit`}>
            <Button>
              <Edit className="w-4 h-4 mr-2" />
              Edit Patient
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Basic patient details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium">{patient.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Age</p>
              <p className="font-medium">{patient.age} years old</p>
            </div>
            <div>
              <p className="text-muted-foreground">Gender</p>
              <p className="font-medium capitalize">{patient.gender}</p>
            </div>
            {patient.contactNumber && (
              <div>
                <p className="text-muted-foreground">Contact Number</p>
                <p className="font-medium">{patient.contactNumber}</p>
              </div>
            )}
            {patient.createdAt && (
              <div>
                <p className="text-muted-foreground">Registered</p>
                <p className="font-medium">
                  {new Date(patient.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {patient.address && (
          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
              <CardDescription>Patient location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="whitespace-pre-line">{patient.address}</p>
            </CardContent>
          </Card>
        )}

        {patient.assignedDoctor && (
          <Card>
            <CardHeader>
              <CardTitle>Assigned Doctor</CardTitle>
              <CardDescription>Primary care physician</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium">{patient.assignedDoctor.name}</p>
              </div>
              {patient.assignedDoctor.email && (
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{patient.assignedDoctor.email}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {patient.medicalHistory && patient.medicalHistory.length > 0 && (
          <Card className={patient.address ? "md:col-span-2" : ""}>
            <CardHeader>
              <CardTitle>Medical History</CardTitle>
              <CardDescription>Past medical conditions and treatments</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {patient.medicalHistory.map((history, index) => (
                  <li key={index} className="text-sm border-l-2 border-primary pl-3 py-1">
                    {history}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
