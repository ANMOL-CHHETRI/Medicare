"use client"

import { createContext, useContext, useState, useCallback } from "react"

const MedicalRecordsContext = createContext(undefined)

const mockRecords = [
  {
    id: "rec1",
    patientId: "1",
    type: "diagnosis",
    title: "Hypertension Diagnosis",
    description: "Patient diagnosed with stage 2 hypertension based on repeated BP measurements",
    doctorName: "Dr. Sarah Johnson",
    recordDate: "2024-11-01",
    createdAt: new Date("2024-11-01"),
    updatedAt: new Date("2024-11-01"),
    diagnosis: {
      icd10Code: "I10",
      severity: "moderate",
      status: "active",
    },
  },
  {
    id: "rec2",
    patientId: "1",
    type: "lab-result",
    title: "Blood Work Results",
    description: "Comprehensive metabolic panel and lipid panel",
    doctorName: "Dr. Sarah Johnson",
    recordDate: "2024-11-05",
    createdAt: new Date("2024-11-05"),
    updatedAt: new Date("2024-11-05"),
    labResult: {
      testName: "Total Cholesterol",
      value: "215",
      unit: "mg/dL",
      referenceRange: "<200",
      status: "abnormal",
    },
  },
  {
    id: "rec3",
    patientId: "1",
    type: "prescription",
    title: "Antihypertensive Medication",
    description: "Initial treatment for hypertension",
    doctorName: "Dr. Sarah Johnson",
    recordDate: "2024-11-01",
    createdAt: new Date("2024-11-01"),
    updatedAt: new Date("2024-11-01"),
    prescription: {
      medicationName: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      duration: "Ongoing",
      refills: 11,
    },
  },
  {
    id: "rec4",
    patientId: "2",
    type: "imaging",
    title: "X-Ray Results",
    description: "Shoulder X-ray showing mild osteoarthritis",
    doctorName: "Dr. Michael Chen",
    recordDate: "2024-11-03",
    createdAt: new Date("2024-11-03"),
    updatedAt: new Date("2024-11-03"),
    imaging: {
      imagingType: "X-Ray",
      bodyPart: "Right Shoulder",
      findings: "Mild degenerative changes consistent with early osteoarthritis",
    },
  },
  {
    id: "rec5",
    patientId: "1",
    type: "note",
    title: "Clinical Notes",
    description: "Follow-up visit notes for hypertension management",
    doctorName: "Dr. Sarah Johnson",
    recordDate: "2024-11-10",
    createdAt: new Date("2024-11-10"),
    updatedAt: new Date("2024-11-10"),
  },
]

export function MedicalRecordsProvider({ children }) {
  const [records, setRecords] = useState(mockRecords)
  const [isLoading, setIsLoading] = useState(false)

  const addRecord = useCallback(async (recordData) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const newRecord = {
        ...recordData,
        id: Math.random().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setRecords((prev) => [newRecord, ...prev])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateRecord = useCallback(async (id, updates) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates, updatedAt: new Date() } : r)))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteRecord = useCallback(async (id) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      setRecords((prev) => prev.filter((r) => r.id !== id))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getRecord = useCallback(
    (id) => {
      return records.find((r) => r.id === id)
    },
    [records],
  )

  const getRecordsByPatient = useCallback(
    (patientId) => {
      return records
        .filter((r) => r.patientId === patientId)
        .sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime())
    },
    [records],
  )

  const getRecordsByType = useCallback(
    (patientId, type) => {
      return records
        .filter((r) => r.patientId === patientId && r.type === type)
        .sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime())
    },
    [records],
  )

  return (
    <MedicalRecordsContext.Provider
      value={{
        records,
        isLoading,
        addRecord,
        updateRecord,
        deleteRecord,
        getRecord,
        getRecordsByPatient,
        getRecordsByType,
      }}
    >
      {children}
    </MedicalRecordsContext.Provider>
  )
}

export function useMedicalRecords() {
  const context = useContext(MedicalRecordsContext)
  if (context === undefined) {
    throw new Error("useMedicalRecords must be used within MedicalRecordsProvider")
  }
  return context
}
