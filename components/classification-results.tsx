"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Shield, CheckCircle, FileText, Brain } from "lucide-react"
import type { ClassificationResult } from "@/lib/ml-classifier"

interface ClassificationResultsProps {
  result: ClassificationResult
  isLoading?: boolean
}

const getRiskIcon = (riskLevel: string) => {
  switch (riskLevel) {
    case "high":
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    case "medium":
      return <Shield className="h-4 w-4 text-yellow-500" />
    case "low":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

const getRiskColor = (riskLevel: string) => {
  switch (riskLevel) {
    case "high":
      return "bg-red-500/10 text-red-400 border-red-500/20"
    case "medium":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
    case "low":
      return "bg-green-500/10 text-green-400 border-green-500/20"
    default:
      return "bg-gray-500/10 text-gray-400 border-gray-500/20"
  }
}

const getClauseTypeLabel = (type: string) => {
  const labels = {
    termination: "Termination",
    nda: "Non-Disclosure",
    payment: "Payment",
    liability: "Liability",
    intellectual_property: "Intellectual Property",
  }
  return labels[type as keyof typeof labels] || type
}

export function ClassificationResults({ result, isLoading }: ClassificationResultsProps) {
  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 animate-pulse text-primary" />
            ML Model Processing...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-2 bg-primary/20 rounded-full flex-1">
                <div className="h-2 bg-primary rounded-full animate-pulse" style={{ width: "60%" }} />
              </div>
              <span className="text-sm text-muted-foreground">Analyzing clauses...</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { clauses, summary } = result
  const riskScore =
    summary.totalClauses > 0
      ? Math.round(
          ((summary.lowRiskClauses * 1 + summary.mediumRiskClauses * 2 + summary.highRiskClauses * 3) /
            (summary.totalClauses * 3)) *
            100,
        )
      : 0

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clauses</p>
                <p className="text-2xl font-bold text-foreground">{summary.totalClauses}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Risk</p>
                <p className="text-2xl font-bold text-red-400">{summary.highRiskClauses}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Medium Risk</p>
                <p className="text-2xl font-bold text-yellow-400">{summary.mediumRiskClauses}</p>
              </div>
              <Shield className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Risk Score</p>
                <p className="text-2xl font-bold text-foreground">{riskScore}%</p>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center">
                <div className="text-xs font-bold text-primary">{Math.round(riskScore / 10)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Score Progress */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Overall Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Document Risk Level</span>
              <span className="font-medium">{riskScore}% Risk</span>
            </div>
            <Progress value={riskScore} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Low Risk</span>
              <span>High Risk</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classified Clauses */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Classified Clauses</CardTitle>
          <p className="text-sm text-muted-foreground">
            ML model identified {clauses.length} legal clauses with risk assessment from the actual document text
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clauses.map((clause, index) => (
              <div key={index} className="border border-border/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getRiskIcon(clause.riskLevel)}
                    <Badge variant="outline" className={getRiskColor(clause.riskLevel)}>
                      {getClauseTypeLabel(clause.type)}
                    </Badge>
                    <Badge variant="secondary">{Math.round(clause.confidence * 100)}% confidence</Badge>
                  </div>
                  <Badge variant="outline" className={getRiskColor(clause.riskLevel)}>
                    {clause.riskLevel.toUpperCase()} RISK
                  </Badge>
                </div>

                <div className="bg-muted/30 rounded-md p-4 border-l-4 border-primary/30">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-primary">EXTRACTED TEXT FROM DOCUMENT</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-mono bg-background/50 p-3 rounded border">
                    {clause.text}
                  </p>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/20 rounded-md p-3">
                  <p className="text-sm text-blue-400">
                    <strong>ML Analysis:</strong> {clause.explanation}
                  </p>
                </div>
              </div>
            ))}

            {clauses.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No legal clauses detected in this document.</p>
                <p className="text-sm mt-2">
                  This may indicate the document doesn't contain standard legal clauses or the text extraction needs
                  improvement.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
