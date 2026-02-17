"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useDropzone } from "react-dropzone"
import { ClassificationResults } from "./classification-results"
import { AnalysisDashboard } from "./analysis-dashboard"
import type { ClassificationResult } from "@/lib/ml-classifier"

const UploadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
)

const FileTextIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
)

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const AlertCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const Loader2Icon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
)

const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
)

const ScanIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h4M4 8h4m0 0V4m0 4h4m0 0V4m0 4h4m0 0V4"
    />
  </svg>
)

const BrainIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
    />
  </svg>
)

interface ProcessedFile {
  name: string
  size: number
  status: "uploading" | "extracting" | "preprocessing" | "classifying" | "completed" | "error"
  progress: number
  extractedText?: string
  isScanned?: boolean
  pageCount?: number
  wordCount?: number
  processingTime?: number
  currentStep?: string
  classificationResult?: ClassificationResult
}

export function UploadSection() {
  const [files, setFiles] = useState<ProcessedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedFile, setSelectedFile] = useState<ProcessedFile | null>(null)
  const [showDashboard, setShowDashboard] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) => ({
        name: file.name,
        size: file.size,
        status: "uploading" as const,
        progress: 0,
      }))

      setFiles((prev) => [...prev, ...newFiles])
      setIsProcessing(true)

      // Process each file
      for (let i = 0; i < newFiles.length; i++) {
        await processFile(acceptedFiles[i], files.length + i)
      }

      setIsProcessing(false)
    },
    [files.length],
  )

  const processFile = async (file: File, fileIndex: number) => {
    try {
      // Step 1: Upload and extract text
      updateFileStatus(fileIndex, "extracting", 20, "Extracting text from PDF...")

      const formData = new FormData()
      formData.append("file", file)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Upload failed")
      }

      let uploadResult: any = null
      try {
        uploadResult = await uploadResponse.json()
      } catch (parseError) {
        console.error("Failed to parse upload response as JSON:", parseError)
        throw new Error("Upload failed: invalid server response")
      }

      // Step 2: Preprocess text and classify clauses
      updateFileStatus(fileIndex, "preprocessing", 40, "Preprocessing extracted text...")

      const processResponse = await fetch("/api/process-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          extractedText: uploadResult.extractedText,
          fileName: file.name,
        }),
      })

      if (!processResponse.ok) {
        throw new Error("Processing failed")
      }

      let processResult: any = null
      try {
        processResult = await processResponse.json()
      } catch (parseError) {
        console.error("Failed to parse process-document response as JSON:", parseError)
        throw new Error("Processing failed: invalid server response")
      }

      updateFileStatus(fileIndex, "classifying", 80, "Running ML clause classification...")

      // Step 3: Complete
      updateFileStatus(fileIndex, "completed", 100, "Analysis complete", {
        extractedText: uploadResult.extractedText,
        isScanned: uploadResult.isScanned,
        pageCount: uploadResult.pageCount,
        wordCount: processResult.wordCount,
        processingTime: uploadResult.processingTime + processResult.processingTime,
        classificationResult: processResult.classificationResult,
      })
    } catch (error) {
      console.error("File processing error:", error)
      updateFileStatus(fileIndex, "error", 0, "Processing failed")
    }
  }

  const updateFileStatus = (
    fileIndex: number,
    status: ProcessedFile["status"],
    progress: number,
    currentStep?: string,
    additionalData?: Partial<ProcessedFile>,
  ) => {
    setFiles((prev) => {
      const updated = [...prev]
      if (updated[fileIndex]) {
        updated[fileIndex] = {
          ...updated[fileIndex],
          status,
          progress,
          currentStep,
          ...additionalData,
        }
      }
      return updated
    })
  }

  const handleViewDashboard = (file: ProcessedFile) => {
    setSelectedFile(file)
    setShowDashboard(true)
  }

  const handleCloseDashboard = () => {
    setShowDashboard(false)
    setSelectedFile(null)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: true,
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "uploading":
        return <UploadIcon className="h-4 w-4 text-primary" />
      case "extracting":
        return <Loader2Icon className="h-4 w-4 animate-spin text-primary" />
      case "preprocessing":
        return <Loader2Icon className="h-4 w-4 animate-spin text-primary" />
      case "classifying":
        return <BrainIcon className="h-4 w-4 animate-spin text-primary" />
      case "completed":
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircleIcon className="h-4 w-4 text-destructive" />
      default:
        return <FileTextIcon className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusText = (file: ProcessedFile) => {
    if (file.currentStep) return file.currentStep

    switch (file.status) {
      case "uploading":
        return "Uploading..."
      case "extracting":
        return "Extracting text..."
      case "preprocessing":
        return "Preprocessing..."
      case "classifying":
        return "Classifying clauses..."
      case "completed":
        return "Analysis complete"
      case "error":
        return "Processing failed"
      default:
        return "Ready"
    }
  }

  if (showDashboard && selectedFile?.classificationResult) {
    return (
      <AnalysisDashboard
        document={{
          name: selectedFile.name,
          size: selectedFile.size,
          pageCount: selectedFile.pageCount || 0,
          wordCount: selectedFile.wordCount || 0,
          processingTime: selectedFile.processingTime || 0,
          extractedText: selectedFile.extractedText || "",
          isScanned: selectedFile.isScanned || false,
          classificationResult: selectedFile.classificationResult,
        }}
        onClose={handleCloseDashboard}
      />
    )
  }

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Upload Your Legal Documents</h2>
            <p className="text-lg text-muted-foreground">
              Support for both digital and scanned PDF files. Our AI will extract, analyze, and classify your documents.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div>
              <Card className="mb-8">
                <CardContent className="p-8">
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-accent/50"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <UploadIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {isDragActive ? "Drop your files here" : "Drag & drop PDF files here"}
                    </h3>
                    <p className="text-muted-foreground mb-4">or click to browse your computer</p>
                    <Button variant="outline">Choose Files</Button>
                    <p className="text-sm text-muted-foreground mt-4">Supports PDF files up to 50MB each</p>
                  </div>
                </CardContent>
              </Card>

              {files.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Processing Files ({files.length})</h3>
                    <div className="space-y-4">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 bg-accent/30 rounded-lg">
                          {getStatusIcon(file.status)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                              {file.isScanned && (
                                <Badge variant="secondary" className="text-xs">
                                  <ScanIcon className="h-3 w-3 mr-1" />
                                  OCR
                                </Badge>
                              )}
                              {file.classificationResult && (
                                <Badge variant="outline" className="text-xs">
                                  <BrainIcon className="h-3 w-3 mr-1" />
                                  {file.classificationResult.summary.totalClauses} clauses
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)} • {getStatusText(file)}
                            </p>
                            {file.status === "completed" && file.classificationResult && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {file.pageCount} pages • {file.wordCount} words •
                                {file.classificationResult.summary.highRiskClauses > 0 && (
                                  <span className="text-red-400 ml-1">
                                    {file.classificationResult.summary.highRiskClauses} high risk
                                  </span>
                                )}
                              </div>
                            )}
                            {(file.status === "uploading" ||
                              file.status === "extracting" ||
                              file.status === "preprocessing" ||
                              file.status === "classifying") && <Progress value={file.progress} className="mt-2 h-1" />}
                          </div>
                          {file.status === "completed" && (
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => setSelectedFile(file)}>
                                <EyeIcon className="h-4 w-4 mr-1" />
                                View Results
                              </Button>
                              <Button size="sm" onClick={() => handleViewDashboard(file)}>
                                Dashboard
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              {selectedFile?.classificationResult ? (
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Analysis Results</h3>
                    <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
                  </div>
                  <ClassificationResults result={selectedFile.classificationResult} />
                </div>
              ) : (
                <Card className="border-border/50">
                  <CardContent className="p-8 text-center">
                    <BrainIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">AI Analysis Results</h3>
                    <p className="text-muted-foreground">
                      Upload and process a document to see detailed clause classification and risk assessment.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
