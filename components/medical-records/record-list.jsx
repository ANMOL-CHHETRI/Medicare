"use client"

import React, { useState } from "react"
import { useMedicalRecords } from "@/lib/context/medical-records"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Edit, Trash2, Eye, Plus, FileText, Stethoscope, TestTube, Pill, Camera, ClipboardList } from "lucide-react"
import Link from "next/link"

export function RecordList({ patientId, patientName }) {
  const { getRecordsByPatient, deleteRecord } = useMedicalRecords()
  const records = getRecordsByPatient(patientId)
  const [deleteId, setDeleteId] = useState(null)
  const [activeTab, setActiveTab] = useState("all")

  const recordTypeConfig = {
    diagnosis: { label: "Diagnoses", icon: <Stethoscope className="w-4 h-4" />, color: "bg-red-100 text-red-800" },
    treatment: { label: "Treatments", icon: <FileText className="w-4 h-4" />, color: "bg-blue-100 text-blue-800" },
    "lab-result": {
      label: "Lab Results",
      icon: <TestTube className="w-4 h-4" />,
      color: "bg-purple-100 text-purple-800",
    },
    prescription: { label: "Prescriptions", icon: <Pill className="w-4 h-4" />, color: "bg-green-100 text-green-800" },
    imaging: { label: "Imaging", icon: <Camera className="w-4 h-4" />, color: "bg-orange-100 text-orange-800" },
    note: { label: "Clinical Notes", icon: <ClipboardList className="w-4 h-4" />, color: "bg-gray-100 text-gray-800" },
  }

  const filteredRecords = activeTab === "all" ? records : records.filter((r) => r.type === activeTab)

  const handleDelete = async () => {
    if (deleteId) {
      await deleteRecord(deleteId)
      setDeleteId(null)
    }
  }

  const recordsByType = {
    diagnosis: records.filter((r) => r.type === "diagnosis").length,
    treatment: records.filter((r) => r.type === "treatment").length,
    "lab-result": records.filter((r) => r.type === "lab-result").length,
    prescription: records.filter((r) => r.type === "prescription").length,
    imaging: records.filter((r) => r.type === "imaging").length,
    note: records.filter((r) => r.type === "note").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Medical Records</h1>
          <p className="text-muted-foreground mt-1">Patient: {patientName}</p>
        </div>
        <Link href={`/admin/patients/${patientId}/records/new`}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Record
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient Medical History</CardTitle>
          <CardDescription>Total Records: {records.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)}>
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
              <TabsTrigger value="all">All ({records.length})</TabsTrigger>
              {Object.entries(recordTypeConfig).map(([type, config]) => (
                <TabsTrigger key={type} value={type}>
                  {config.label} ({recordsByType[type]})
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filteredRecords.length > 0 ? (
                <div className="space-y-3">
                  {filteredRecords.map((record) => {
                    const config = recordTypeConfig[record.type]
                    return (
                      <div key={record.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              {config.icon}
                              <Badge className={config.color}>{config.label}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(record.recordDate).toLocaleDateString()}
                              </span>
                            </div>
                            <h3 className="font-semibold text-foreground">{record.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{record.description}</p>
                            <p className="text-xs text-muted-foreground mt-2">By {record.doctorName}</p>

                            {record.labResult && (
                              <div className="mt-2 p-2 bg-background rounded text-sm">
                                <p>
                                  {record.labResult.testName}:{" "}
                                  <span className="font-medium">
                                    {record.labResult.value} {record.labResult.unit}
                                  </span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Reference: {record.labResult.referenceRange}
                                </p>
                              </div>
                            )}

                            {record.prescription && (
                              <div className="mt-2 p-2 bg-background rounded text-sm">
                                <p>
                                  <span className="font-medium">{record.prescription.medicationName}</span> -{" "}
                                  {record.prescription.dosage}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {record.prescription.frequency} for {record.prescription.duration}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Link href={`/admin/patients/${patientId}/records/${record.id}`}>
                              <Button size="sm" variant="ghost">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/patients/${patientId}/records/${record.id}/edit`}>
                              <Button size="sm" variant="ghost">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeleteId(record.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No {activeTab !== "all" ? recordTypeConfig[activeTab].label.toLowerCase() : "medical"} records found
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Record</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this medical record? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
