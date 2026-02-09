"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert } from "@/components/ui/alert"
import {
  AlertTriangle,
  Shield,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Scale,
  FileWarning,
  Target,
} from "lucide-react"
import type { RiskAssessment } from "@/lib/risk-assessment-engine"

interface RiskAssessmentDisplayProps {
  assessment: RiskAssessment
  isLoading?: boolean
}

const getRiskGradeColor = (grade: string) => {
  switch (grade) {
    case "A":
      return "text-green-500 bg-green-500/10 border-green-500/20"
    case "B":
      return "text-blue-500 bg-blue-500/10 border-blue-500/20"
    case "C":
      return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20"
    case "D":
      return "text-orange-500 bg-orange-500/10 border-orange-500/20"
    case "F":
      return "text-red-500 bg-red-500/10 border-red-500/20"
    default:
      return "text-gray-500 bg-gray-500/10 border-gray-500/20"
  }
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case "critical":
      return <XCircle className="h-4 w-4 text-red-500" />
    case "high":
      return <AlertTriangle className="h-4 w-4 text-orange-500" />
    case "medium":
      return <Shield className="h-4 w-4 text-yellow-500" />
    case "low":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    default:
      return <FileWarning className="h-4 w-4 text-gray-500" />
  }
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "financial":
      return <DollarSign className="h-4 w-4" />
    case "legal":
      return <Scale className="h-4 w-4" />
    case "operational":
      return <Target className="h-4 w-4" />
    case "compliance":
      return <FileWarning className="h-4 w-4" />
    default:
      return <AlertTriangle className="h-4 w-4" />
  }
}

export function RiskAssessmentDisplay({ assessment, isLoading }: RiskAssessmentDisplayProps) {
  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 animate-pulse text-primary" />
            Assessing Risk...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted/50 rounded animate-pulse" />
            <div className="h-20 bg-muted/50 rounded animate-pulse" />
            <div className="h-32 bg-muted/50 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Risk Score */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Overall Risk Assessment</span>
            <Badge className={`text-lg px-3 py-1 ${getRiskGradeColor(assessment.riskGrade)}`}>
              Grade {assessment.riskGrade}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Risk Score</span>
              <span className="text-2xl font-bold">{assessment.overallRiskScore}/100</span>
            </div>
            <Progress value={assessment.overallRiskScore} className="h-3" />
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">
                  {assessment.riskFactors.filter((rf) => rf.severity === "critical" || rf.severity === "high").length}
                </div>
                <div className="text-sm text-muted-foreground">High Priority Issues</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{assessment.riskFactors.length}</div>
                <div className="text-sm text-muted-foreground">Total Risk Factors</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Impact */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Financial Impact Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Potential Liability</div>
              <div className="text-lg font-semibold text-foreground">
                {assessment.financialImpact.potentialLiability}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Cost Risk Level</div>
              <Badge
                variant="outline"
                className={
                  assessment.financialImpact.costRisk === "critical"
                    ? "text-red-400 border-red-500/20"
                    : assessment.financialImpact.costRisk === "high"
                      ? "text-orange-400 border-orange-500/20"
                      : assessment.financialImpact.costRisk === "medium"
                        ? "text-yellow-400 border-yellow-500/20"
                        : "text-green-400 border-green-500/20"
                }
              >
                {assessment.financialImpact.costRisk.toUpperCase()}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">{assessment.financialImpact.description}</p>
        </CardContent>
      </Card>

      {/* Risk Factors */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Identified Risk Factors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assessment.riskFactors.map((factor, index) => (
              <Alert
                key={index}
                className={
                  factor.severity === "critical"
                    ? "border-red-500/50 bg-red-500/5"
                    : factor.severity === "high"
                      ? "border-orange-500/50 bg-orange-500/5"
                      : factor.severity === "medium"
                        ? "border-yellow-500/50 bg-yellow-500/5"
                        : "border-green-500/50 bg-green-500/5"
                }
              >
                <div className="flex items-start gap-3">
                  {getSeverityIcon(factor.severity)}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">{factor.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {getCategoryIcon(factor.category)}
                        <span className="ml-1">{factor.category}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{factor.description}</p>
                    <div className="bg-muted/30 rounded-md p-3 space-y-2">
                      <div>
                        <span className="text-xs font-medium text-foreground">Impact:</span>
                        <p className="text-xs text-muted-foreground">{factor.impact}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-foreground">Recommendation:</span>
                        <p className="text-xs text-blue-400">{factor.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-4 w-4" />
              Immediate Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {assessment.recommendations.immediate.map((rec, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              <Clock className="h-4 w-4" />
              Short Term
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {assessment.recommendations.shortTerm.map((rec, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <TrendingUp className="h-4 w-4" />
              Long Term
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {assessment.recommendations.longTerm.map((rec, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Issues */}
      {assessment.complianceIssues.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileWarning className="h-5 w-5 text-orange-500" />
              Compliance Considerations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assessment.complianceIssues.map((issue, index) => (
                <div key={index} className="border border-border/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-foreground">{issue.jurisdiction}</h4>
                    <Badge
                      variant="outline"
                      className={
                        issue.severity === "critical"
                          ? "text-red-400 border-red-500/20"
                          : issue.severity === "high"
                            ? "text-orange-400 border-orange-500/20"
                            : "text-yellow-400 border-yellow-500/20"
                      }
                    >
                      {issue.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <ul className="space-y-1">
                    {issue.issues.map((issueText, issueIndex) => (
                      <li key={issueIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                        <div className="w-1 h-1 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                        {issueText}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
