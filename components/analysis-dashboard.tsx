"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Brain, AlertTriangle, Languages, Download, Share2, Clock, Shield, Scale, Eye } from "lucide-react"
import { ClassificationResults } from "./classification-results"
import { RiskAssessmentDisplay } from "./risk-assessment-display"
import { MultilingualSummary } from "./multilingual-summary"
import type { ClassificationResult } from "@/lib/ml-classifier"
import type { RiskAssessment } from "@/lib/risk-assessment-engine"
import type { MultilingualSummary as MultilingualSummaryType } from "@/lib/multilingual-summarizer"

interface ProcessedDocument {
  name: string
  size: number
  pageCount: number
  wordCount: number
  processingTime: number
  extractedText: string
  isScanned: boolean
  classificationResult: ClassificationResult
  riskAssessment?: RiskAssessment
  multilingualSummary?: MultilingualSummaryType
}

interface AnalysisDashboardProps {
  document: ProcessedDocument
  onClose?: () => void
}

export function AnalysisDashboard({ document, onClose }: AnalysisDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null)
  const [multilingualSummary, setMultilingualSummary] = useState<MultilingualSummaryType | null>(null)
  const [isLoadingRisk, setIsLoadingRisk] = useState(false)
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [riskError, setRiskError] = useState<string | null>(null)

  useEffect(() => {
    // Load risk assessment if not already loaded
    if (!document.riskAssessment && !isLoadingRisk) {
      loadRiskAssessment()
    }

    // Load multilingual summary if not already loaded
    if (!document.multilingualSummary && !isLoadingSummary) {
      loadMultilingualSummary()
    }
  }, [document])

  const loadRiskAssessment = async () => {
    setIsLoadingRisk(true)
    setRiskError(null)
    try {
      const response = await fetch("/api/assess-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classificationResult: document.classificationResult,
          extractedText: document.extractedText,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setRiskAssessment(result)
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        setRiskError(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error("Failed to load risk assessment:", error)
      setRiskError("Failed to load risk assessment. Please check your connection and try again.")
    } finally {
      setIsLoadingRisk(false)
    }
  }

  const loadMultilingualSummary = async () => {
    setIsLoadingSummary(true)
    setSummaryError(null)
    try {
      console.log("[v0] Starting multilingual summary generation...")

      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: document.extractedText,
          languages: ["en", "hi", "ta", "te"],
        }),
      })

      const contentType = response.headers.get("content-type")

      if (response.ok) {
        if (contentType && contentType.includes("application/json")) {
          const result = await response.json()
          console.log("[v0] Summary generation successful:", result)
          setMultilingualSummary(result)
        } else {
          console.error("[v0] Server returned non-JSON response:", contentType)
          setSummaryError("Server returned an invalid response format. Please try again.")
        }
      } else {
        let errorData
        try {
          if (contentType && contentType.includes("application/json")) {
            errorData = await response.json()
          } else {
            const textResponse = await response.text()
            console.error("[v0] Server returned HTML error page:", textResponse.substring(0, 200))
            errorData = {
              error: `Server error (HTTP ${response.status})`,
              details: "The server encountered an internal error. Please try again in a few moments.",
            }
          }
        } catch (parseError) {
          console.error("[v0] Failed to parse error response:", parseError)
          errorData = {
            error: `HTTP ${response.status}: ${response.statusText}`,
            details: "Failed to parse server response",
          }
        }

        console.error("[v0] Summary generation failed:", errorData)

        if (response.status === 503) {
          setSummaryError("Translation service is temporarily unavailable. Please try again in a few moments.")
        } else if (response.status === 408) {
          setSummaryError("Summary generation timed out. Please try with a shorter document or try again later.")
        } else if (response.status === 400) {
          setSummaryError(errorData.error || "Invalid request. Please check your document and try again.")
        } else if (response.status === 500) {
          setSummaryError("Server encountered an internal error. Please try again in a few moments.")
        } else {
          const errorMsg = errorData.error || `Failed to generate summary (HTTP ${response.status})`
          const details = errorData.details ? ` - ${errorData.details}` : ""
          setSummaryError(`${errorMsg}${details}`)
        }
      }
    } catch (error) {
      console.error("[v0] Network or parsing error:", error)

      if (error instanceof TypeError && error.message.includes("fetch")) {
        setSummaryError(
          "Network error: Unable to connect to the summary service. Please check your connection and try again.",
        )
      } else {
        setSummaryError("Failed to generate multilingual summary. Please check your connection and try again.")
      }
    } finally {
      setIsLoadingSummary(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getRiskLevel = () => {
    const highRisk = document.classificationResult.summary.highRiskClauses
    const totalClauses = document.classificationResult.summary.totalClauses

    if (highRisk === 0) return { level: "Low", color: "text-green-500", bgColor: "bg-green-500/10" }
    if (highRisk / totalClauses < 0.3) return { level: "Medium", color: "text-yellow-500", bgColor: "bg-yellow-500/10" }
    return { level: "High", color: "text-red-500", bgColor: "bg-red-500/10" }
  }

  const getClauseTypes = () => {
    if (!document.classificationResult?.clauses) return []
    const uniqueTypes = [...new Set(document.classificationResult.clauses.map((clause) => clause.type))]
    return uniqueTypes
  }

  const riskLevel = getRiskLevel()
  const clauseTypes = getClauseTypes()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Document Analysis Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">{document.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <Eye className="h-4 w-4 mr-2" />
                  Back to Upload
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Document Size</p>
                  <p className="text-2xl font-bold text-foreground">{formatFileSize(document.size)}</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {document.pageCount} pages • {document.wordCount} words
                {document.isScanned && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    OCR
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Clauses Found</p>
                  <p className="text-2xl font-bold text-foreground">
                    {document.classificationResult.summary.totalClauses}
                  </p>
                </div>
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <div className="mt-2 text-xs text-muted-foreground">{clauseTypes.length} different types</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
                  <p className={`text-2xl font-bold ${riskLevel.color}`}>{riskLevel.level}</p>
                </div>
                <div className={`p-2 rounded-full ${riskLevel.bgColor}`}>
                  <AlertTriangle className={`h-6 w-6 ${riskLevel.color}`} />
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {document.classificationResult.summary.highRiskClauses} high-risk clauses
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Processing Time</p>
                  <p className="text-2xl font-bold text-foreground">{(document.processingTime / 1000).toFixed(1)}s</p>
                </div>
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <div className="mt-2 text-xs text-muted-foreground">AI analysis completed</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="classification" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Classification
            </TabsTrigger>
            <TabsTrigger value="risk" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Risk Assessment
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              Summary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Document Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Document Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">File Name</p>
                      <p className="text-sm text-foreground">{document.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">File Size</p>
                      <p className="text-sm text-foreground">{formatFileSize(document.size)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pages</p>
                      <p className="text-sm text-foreground">{document.pageCount}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Words</p>
                      <p className="text-sm text-foreground">{document.wordCount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Processing Details</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Text Extraction</span>
                        <Badge variant={document.isScanned ? "secondary" : "outline"}>
                          {document.isScanned ? "OCR Applied" : "Direct Extraction"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Processing Time</span>
                        <span className="text-foreground">{(document.processingTime / 1000).toFixed(2)}s</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-primary" />
                    Analysis Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Clauses</span>
                      <span className="text-lg font-semibold text-foreground">
                        {document.classificationResult.summary.totalClauses}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">High Risk</span>
                        <Badge variant="destructive">{document.classificationResult.summary.highRiskClauses}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Medium Risk</span>
                        <Badge variant="secondary">{document.classificationResult.summary.mediumRiskClauses}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Low Risk</span>
                        <Badge variant="outline">{document.classificationResult.summary.lowRiskClauses}</Badge>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Clause Types Found</p>
                      <div className="flex flex-wrap gap-1">
                        {clauseTypes.map((type) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="classification" className="mt-6">
            <ClassificationResults result={document.classificationResult} />
          </TabsContent>

          <TabsContent value="risk" className="mt-6">
            {riskAssessment ? (
              <RiskAssessmentDisplay assessment={riskAssessment} />
            ) : isLoadingRisk ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading risk assessment...</p>
                </CardContent>
              </Card>
            ) : riskError ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Risk Assessment Error</h3>
                  <p className="text-muted-foreground mb-4">{riskError}</p>
                  <Button onClick={loadRiskAssessment} disabled={isLoadingRisk}>
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Risk Assessment</h3>
                  <p className="text-muted-foreground mb-4">
                    Detailed risk analysis is being prepared for this document.
                  </p>
                  <Button onClick={loadRiskAssessment} disabled={isLoadingRisk}>
                    Load Risk Assessment
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="summary" className="mt-6">
            {multilingualSummary ? (
              <MultilingualSummary summary={multilingualSummary} />
            ) : isLoadingSummary ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Generating multilingual summaries...</p>
                  <p className="text-xs text-muted-foreground mt-2">This may take a few moments for large documents</p>
                </CardContent>
              </Card>
            ) : summaryError ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Summary Generation Error</h3>
                  <p className="text-muted-foreground mb-4">{summaryError}</p>
                  <div className="space-y-2">
                    <Button onClick={loadMultilingualSummary} disabled={isLoadingSummary}>
                      Try Again
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      If the problem persists, the translation service may be temporarily unavailable
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Languages className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Multilingual Summary</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate document summaries in multiple Indian languages with text-to-speech support.
                  </p>
                  <Button onClick={loadMultilingualSummary} disabled={isLoadingSummary}>
                    Generate Summaries
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
