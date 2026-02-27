"use client"

import { useMedicalRecords } from "@/lib/context/medical-records"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, ArrowLeft } from "lucide-react"
import Link from "next/link"

const recordTypeColors = {
  diagnosis: "bg-red-100 text-red-800",
  treatment: "bg-blue-100 text-blue-800",
  "lab-result": "bg-purple-100 text-purple-800",
  prescription: "bg-green-100 text-green-800",
  imaging: "bg-orange-100 text-orange-800",
  note: "bg-gray-100 text-gray-800",
}

export function RecordDetail({ patientId, recordId, patientName }) {
  const { getRecord } = useMedicalRecords()
  const record = getRecord(recordId)

  if (!record) {
    return (
      <div className="space-y-6">
        <Link href={`/admin/patients/${patientId}/records`}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Records
          </Button>
        </Link>
        <div className="text-center text-muted-foreground">Record not found</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/admin/patients/${patientId}/records`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{record.title}</h1>
            <p className="text-muted-foreground mt-1">Patient: {patientName}</p>
          </div>
        </div>
        <Link href={`/admin/patients/${patientId}/records/${record.id}/edit`}>
          <Button>
            <Edit className="w-4 h-4 mr-2" />
            Edit Record
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Record Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <Badge className={recordTypeColors[record.type] || ""}>{record.type}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">{new Date(record.recordDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="font-medium whitespace-pre-wrap">{record.description}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Doctor</p>
              <p className="font-medium">{record.doctorName}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {record.diagnosis && (
              <>
                <div>
                  <p className="text-muted-foreground">ICD-10 Code</p>
                  <p className="font-medium">{record.diagnosis.icd10Code}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Severity</p>
                  <p className="font-medium capitalize">{record.diagnosis.severity}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{record.diagnosis.status}</p>
                </div>
              </>
            )}

            {record.labResult && (
              <>
                <div>
                  <p className="text-muted-foreground">Test Name</p>
                  <p className="font-medium">{record.labResult.testName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Result</p>
                  <p className="font-medium">
                    {record.labResult.value} {record.labResult.unit}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Reference Range</p>
                  <p className="font-medium">{record.labResult.referenceRange}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge
                    className={
                      record.labResult.status === "normal" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }
                  >
                    {record.labResult.status}
                  </Badge>
                </div>
              </>
            )}

            {record.prescription && (
              <>
                <div>
                  <p className="text-muted-foreground">Medication</p>
                  <p className="font-medium">{record.prescription.medicationName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Dosage</p>
                  <p className="font-medium">{record.prescription.dosage}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Frequency</p>
                  <p className="font-medium">{record.prescription.frequency}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
