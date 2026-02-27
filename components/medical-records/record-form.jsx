"use client"

import { useState } from "react"
import { useMedicalRecords } from "@/lib/context/medical-records"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

const recordTypes = [
  { value: "diagnosis", label: "Diagnosis" },
  { value: "treatment", label: "Treatment" },
  { value: "lab-result", label: "Lab Result" },
  { value: "prescription", label: "Prescription" },
  { value: "imaging", label: "Imaging" },
  { value: "note", label: "Clinical Note" },
]

export function RecordForm({ patientId, record, onSubmit }) {
  const { addRecord, updateRecord, isLoading } = useMedicalRecords()
  const [recordType, setRecordType] = useState(record?.type || "note")
  const [formData, setFormData] = useState({
    title: record?.title || "",
    description: record?.description || "",
    doctorName: record?.doctorName || "",
    recordDate: record?.recordDate || new Date().toISOString().split("T")[0],
    // Diagnosis
    diagnosisIcd10: record?.diagnosis?.icd10Code || "",
    diagnosisSeverity: record?.diagnosis?.severity || "moderate",
    diagnosisStatus: record?.diagnosis?.status || "active",
    // Treatment
    treatmentType: record?.treatment?.treatmentType || "",
    treatmentStartDate: record?.treatment?.startDate || "",
    treatmentEndDate: record?.treatment?.endDate || "",
    treatmentOutcome: record?.treatment?.outcome || "",
    // Lab Result
    labTestName: record?.labResult?.testName || "",
    labValue: record?.labResult?.value || "",
    labUnit: record?.labResult?.unit || "",
    labRefRange: record?.labResult?.referenceRange || "",
    labStatus: record?.labResult?.status || "normal",
    // Prescription
    prescMedicationName: record?.prescription?.medicationName || "",
    prescDosage: record?.prescription?.dosage || "",
    prescFrequency: record?.prescription?.frequency || "",
    prescDuration: record?.prescription?.duration || "",
    prescRefills: record?.prescription?.refills || 0,
    // Imaging
    imagingType: record?.imaging?.imagingType || "",
    imagingBodyPart: record?.imaging?.bodyPart || "",
    imagingFindings: record?.imaging?.findings || "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const baseRecord = {
      patientId,
      type: recordType,
      title: formData.title,
      description: formData.description,
      doctorName: formData.doctorName,
      recordDate: formData.recordDate,
    }

    const recordData = baseRecord

    if (recordType === "diagnosis") {
      recordData.diagnosis = {
        icd10Code: formData.diagnosisIcd10,
        severity: formData.diagnosisSeverity,
        status: formData.diagnosisStatus,
      }
    } else if (recordType === "treatment") {
      recordData.treatment = {
        treatmentType: formData.treatmentType,
        startDate: formData.treatmentStartDate,
        endDate: formData.treatmentEndDate || undefined,
        outcome: formData.treatmentOutcome || undefined,
      }
    } else if (recordType === "lab-result") {
      recordData.labResult = {
        testName: formData.labTestName,
        value: formData.labValue,
        unit: formData.labUnit,
        referenceRange: formData.labRefRange,
        status: formData.labStatus,
      }
    } else if (recordType === "prescription") {
      recordData.prescription = {
        medicationName: formData.prescMedicationName,
        dosage: formData.prescDosage,
        frequency: formData.prescFrequency,
        duration: formData.prescDuration,
        refills: Number(formData.prescRefills),
      }
    } else if (recordType === "imaging") {
      recordData.imaging = {
        imagingType: formData.imagingType,
        bodyPart: formData.imagingBodyPart,
        findings: formData.imagingFindings,
      }
    }

    if (record) {
      await updateRecord(record.id, recordData)
    } else {
      await addRecord(recordData)
    }

    if (onSubmit) {
      onSubmit(recordData)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {record ? "Edit Medical Record" : "Add New Medical Record"}
        </h1>
        <p className="text-muted-foreground mt-1">
          Complete the form below to {record ? "update" : "create"} a medical record
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Record details and type</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recordType">Record Type *</Label>
              <Select value={recordType} onValueChange={(value) => setRecordType(value)}>
                <SelectTrigger id="recordType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {recordTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recordDate">Record Date *</Label>
              <Input
                id="recordDate"
                name="recordDate"
                type="date"
                value={formData.recordDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                required
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="doctorName">Doctor Name *</Label>
              <Input id="doctorName" name="doctorName" value={formData.doctorName} onChange={handleChange} required />
            </div>
          </CardContent>
        </Card>

        {recordType === "diagnosis" && (
          <Card>
            <CardHeader>
              <CardTitle>Diagnosis Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="diagnosisIcd10">ICD-10 Code *</Label>
                <Input
                  id="diagnosisIcd10"
                  name="diagnosisIcd10"
                  value={formData.diagnosisIcd10}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diagnosisSeverity">Severity *</Label>
                <Select
                  value={formData.diagnosisSeverity}
                  onValueChange={(value) => handleSelectChange("diagnosisSeverity", value)}
                >
                  <SelectTrigger id="diagnosisSeverity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="diagnosisStatus">Status *</Label>
                <Select
                  value={formData.diagnosisStatus}
                  onValueChange={(value) => handleSelectChange("diagnosisStatus", value)}
                >
                  <SelectTrigger id="diagnosisStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {recordType === "lab-result" && (
          <Card>
            <CardHeader>
              <CardTitle>Lab Result Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="labTestName">Test Name *</Label>
                <Input
                  id="labTestName"
                  name="labTestName"
                  value={formData.labTestName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="labValue">Value *</Label>
                <Input id="labValue" name="labValue" value={formData.labValue} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="labUnit">Unit *</Label>
                <Input id="labUnit" name="labUnit" value={formData.labUnit} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="labStatus">Status *</Label>
                <Select value={formData.labStatus} onValueChange={(value) => handleSelectChange("labStatus", value)}>
                  <SelectTrigger id="labStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="abnormal">Abnormal</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="labRefRange">Reference Range *</Label>
                <Input
                  id="labRefRange"
                  name="labRefRange"
                  value={formData.labRefRange}
                  onChange={handleChange}
                  required
                />
              </div>
            </CardContent>
          </Card>
        )}

        {recordType === "prescription" && (
          <Card>
            <CardHeader>
              <CardTitle>Prescription Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prescMedicationName">Medication Name *</Label>
                <Input
                  id="prescMedicationName"
                  name="prescMedicationName"
                  value={formData.prescMedicationName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prescDosage">Dosage *</Label>
                <Input
                  id="prescDosage"
                  name="prescDosage"
                  value={formData.prescDosage}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prescFrequency">Frequency *</Label>
                <Input
                  id="prescFrequency"
                  name="prescFrequency"
                  value={formData.prescFrequency}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prescDuration">Duration *</Label>
                <Input
                  id="prescDuration"
                  name="prescDuration"
                  value={formData.prescDuration}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prescRefills">Refills</Label>
                <Input
                  id="prescRefills"
                  name="prescRefills"
                  type="number"
                  value={formData.prescRefills}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : record ? "Update Record" : "Add Record"}
          </Button>
          <Link href={`/admin/patients/${patientId}/records`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
