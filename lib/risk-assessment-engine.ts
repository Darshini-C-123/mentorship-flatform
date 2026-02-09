import type { ClassificationResult } from "./ml-classifier"

export interface RiskFactor {
  id: string
  category: "financial" | "legal" | "operational" | "compliance"
  severity: "critical" | "high" | "medium" | "low"
  title: string
  description: string
  impact: string
  recommendation: string
  clauses: string[] // IDs of related clauses
}

export interface RiskAssessment {
  overallRiskScore: number // 0-100
  riskGrade: "A" | "B" | "C" | "D" | "F"
  riskFactors: RiskFactor[]
  recommendations: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
  }
  complianceIssues: {
    jurisdiction: string
    issues: string[]
    severity: "critical" | "high" | "medium" | "low"
  }[]
  financialImpact: {
    potentialLiability: string
    costRisk: "low" | "medium" | "high" | "critical"
    description: string
  }
}

export class RiskAssessmentEngine {
  // Risk scoring weights for different clause types
  private readonly RISK_WEIGHTS = {
    termination: { high: 25, medium: 15, low: 5 },
    liability: { high: 30, medium: 20, low: 8 },
    payment: { high: 20, medium: 12, low: 4 },
    nda: { high: 15, medium: 10, low: 3 },
    intellectual_property: { high: 18, medium: 12, low: 5 },
  }

  // Critical risk patterns that require immediate attention
  private readonly CRITICAL_PATTERNS = [
    "unlimited liability",
    "personal guarantee",
    "immediate termination without cause",
    "waive all rights",
    "perpetual license",
    "no limitation of damages",
    "indemnify against all claims",
  ]

  // Compliance risk indicators
  private readonly COMPLIANCE_RISKS = {
    gdpr: ["personal data", "data processing", "data subject rights", "privacy policy"],
    employment: ["at-will employment", "non-compete", "overtime", "benefits"],
    consumer: ["consumer protection", "warranty", "return policy", "dispute resolution"],
    securities: ["investment", "securities", "disclosure", "material information"],
  }

  public async assessRisk(classificationResult: ClassificationResult, documentText: string): Promise<RiskAssessment> {
    // Calculate overall risk score
    const overallRiskScore = this.calculateOverallRiskScore(classificationResult)
    const riskGrade = this.calculateRiskGrade(overallRiskScore)

    // Identify risk factors
    const riskFactors = this.identifyRiskFactors(classificationResult, documentText)

    // Generate recommendations
    const recommendations = this.generateRecommendations(riskFactors, classificationResult)

    // Assess compliance issues
    const complianceIssues = this.assessComplianceRisks(documentText)

    // Calculate financial impact
    const financialImpact = this.assessFinancialImpact(classificationResult, documentText)

    return {
      overallRiskScore,
      riskGrade,
      riskFactors,
      recommendations,
      complianceIssues,
      financialImpact,
    }
  }

  private calculateOverallRiskScore(result: ClassificationResult): number {
    let totalScore = 0
    let maxPossibleScore = 0

    result.clauses.forEach((clause) => {
      const weight = this.RISK_WEIGHTS[clause.type]
      const riskScore = weight[clause.riskLevel]
      totalScore += riskScore * clause.confidence
      maxPossibleScore += weight.high
    })

    // Normalize to 0-100 scale
    const normalizedScore = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0
    return Math.min(100, Math.round(normalizedScore))
  }

  private calculateRiskGrade(score: number): "A" | "B" | "C" | "D" | "F" {
    if (score <= 20) return "A"
    if (score <= 40) return "B"
    if (score <= 60) return "C"
    if (score <= 80) return "D"
    return "F"
  }

  private identifyRiskFactors(result: ClassificationResult, documentText: string): RiskFactor[] {
    const riskFactors: RiskFactor[] = []
    const lowerText = documentText.toLowerCase()

    // Check for critical patterns
    this.CRITICAL_PATTERNS.forEach((pattern, index) => {
      if (lowerText.includes(pattern)) {
        riskFactors.push({
          id: `critical-${index}`,
          category: "legal",
          severity: "critical",
          title: `Critical Risk: ${pattern.charAt(0).toUpperCase() + pattern.slice(1)}`,
          description: `Document contains "${pattern}" which poses significant legal risk.`,
          impact: "Could result in unlimited financial exposure or loss of rights.",
          recommendation: "Immediate legal review required. Consider negotiating alternative terms.",
          clauses: result.clauses.filter((c) => c.text.toLowerCase().includes(pattern)).map((c) => c.type),
        })
      }
    })

    // Analyze high-risk clauses
    result.clauses
      .filter((c) => c.riskLevel === "high")
      .forEach((clause, index) => {
        riskFactors.push({
          id: `high-risk-${index}`,
          category: this.getClauseCategoryMapping(clause.type),
          severity: "high",
          title: `High Risk ${clause.type.charAt(0).toUpperCase() + clause.type.slice(1)} Clause`,
          description: clause.explanation,
          impact: this.getImpactDescription(clause.type, "high"),
          recommendation: this.getRecommendation(clause.type, "high"),
          clauses: [clause.type],
        })
      })

    // Check for missing protective clauses
    const missingProtections = this.identifyMissingProtections(result, documentText)
    missingProtections.forEach((protection, index) => {
      riskFactors.push({
        id: `missing-${index}`,
        category: "legal",
        severity: "medium",
        title: `Missing Protection: ${protection.title}`,
        description: protection.description,
        impact: protection.impact,
        recommendation: protection.recommendation,
        clauses: [],
      })
    })

    return riskFactors.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return severityOrder[b.severity] - severityOrder[a.severity]
    })
  }

  private getClauseCategoryMapping(clauseType: string): "financial" | "legal" | "operational" | "compliance" {
    const mapping = {
      payment: "financial",
      liability: "legal",
      termination: "operational",
      nda: "compliance",
      intellectual_property: "legal",
    }
    return mapping[clauseType as keyof typeof mapping] || "legal"
  }

  private getImpactDescription(clauseType: string, riskLevel: string): string {
    const impacts = {
      termination: {
        high: "Sudden contract termination could disrupt business operations and result in lost revenue.",
        medium: "Contract termination may require advance planning and transition period.",
        low: "Termination process is well-defined with adequate protections.",
      },
      liability: {
        high: "Unlimited liability exposure could result in significant financial losses.",
        medium: "Limited liability with reasonable caps on damages.",
        low: "Well-protected with mutual liability limitations.",
      },
      payment: {
        high: "Unfavorable payment terms could impact cash flow and profitability.",
        medium: "Standard payment terms with reasonable collection procedures.",
        low: "Fair payment structure with clear terms.",
      },
    }
    return (
      impacts[clauseType as keyof typeof impacts]?.[riskLevel as keyof (typeof impacts)["termination"]] ||
      "Potential impact requires legal review."
    )
  }

  private getRecommendation(clauseType: string, riskLevel: string): string {
    const recommendations = {
      termination: {
        high: "Negotiate for reasonable notice period and cure provisions.",
        medium: "Review termination triggers and ensure mutual protections.",
        low: "Terms appear balanced and fair.",
      },
      liability: {
        high: "Negotiate liability caps and mutual indemnification clauses.",
        medium: "Review indemnification scope and consider additional protections.",
        low: "Liability terms appear reasonable.",
      },
      payment: {
        high: "Negotiate more favorable payment terms and dispute resolution.",
        medium: "Review late payment penalties and collection procedures.",
        low: "Payment terms appear fair and reasonable.",
      },
    }
    return (
      recommendations[clauseType as keyof typeof recommendations]?.[
        riskLevel as keyof (typeof recommendations)["termination"]
      ] || "Consult legal counsel for detailed review."
    )
  }

  private identifyMissingProtections(result: ClassificationResult, documentText: string) {
    const protections = []
    const lowerText = documentText.toLowerCase()

    // Check for missing force majeure clause
    if (!lowerText.includes("force majeure") && !lowerText.includes("act of god")) {
      protections.push({
        title: "Force Majeure Clause",
        description: "No force majeure protection found in the document.",
        impact: "May be liable for performance even during unforeseeable circumstances.",
        recommendation: "Add force majeure clause to protect against uncontrollable events.",
      })
    }

    // Check for missing dispute resolution
    if (
      !lowerText.includes("arbitration") &&
      !lowerText.includes("mediation") &&
      !lowerText.includes("dispute resolution")
    ) {
      protections.push({
        title: "Dispute Resolution Mechanism",
        description: "No clear dispute resolution process specified.",
        impact: "Disputes may result in costly litigation without clear resolution path.",
        recommendation: "Include arbitration or mediation clause for efficient dispute resolution.",
      })
    }

    return protections
  }

  private generateRecommendations(riskFactors: RiskFactor[], result: ClassificationResult) {
    const immediate: string[] = []
    const shortTerm: string[] = []
    const longTerm: string[] = []

    // Critical and high severity issues need immediate attention
    riskFactors
      .filter((rf) => rf.severity === "critical" || rf.severity === "high")
      .forEach((rf) => {
        immediate.push(rf.recommendation)
      })

    // Medium severity issues for short-term planning
    riskFactors
      .filter((rf) => rf.severity === "medium")
      .forEach((rf) => {
        shortTerm.push(rf.recommendation)
      })

    // General recommendations for long-term contract management
    longTerm.push("Establish regular contract review process with legal counsel.")
    longTerm.push("Create standardized contract templates with protective clauses.")
    longTerm.push("Implement contract management system for tracking key dates and obligations.")

    return {
      immediate: [...new Set(immediate)], // Remove duplicates
      shortTerm: [...new Set(shortTerm)],
      longTerm: [...new Set(longTerm)],
    }
  }

  private assessComplianceRisks(documentText: string) {
    const issues = []
    const lowerText = documentText.toLowerCase()

    Object.entries(this.COMPLIANCE_RISKS).forEach(([jurisdiction, keywords]) => {
      const foundKeywords = keywords.filter((keyword) => lowerText.includes(keyword))
      if (foundKeywords.length > 0) {
        issues.push({
          jurisdiction: jurisdiction.toUpperCase(),
          issues: foundKeywords.map(
            (keyword) =>
              `Document references ${keyword} - ensure compliance with ${jurisdiction.toUpperCase()} regulations.`,
          ),
          severity: foundKeywords.length > 2 ? "high" : ("medium" as "high" | "medium"),
        })
      }
    })

    return issues
  }

  private assessFinancialImpact(result: ClassificationResult, documentText: string) {
    const highRiskClauses = result.clauses.filter((c) => c.riskLevel === "high")
    const lowerText = documentText.toLowerCase()

    let costRisk: "low" | "medium" | "high" | "critical" = "low"
    let potentialLiability = "Limited"
    let description = "Financial risk appears manageable with current terms."

    if (lowerText.includes("unlimited liability") || lowerText.includes("personal guarantee")) {
      costRisk = "critical"
      potentialLiability = "Unlimited"
      description = "Unlimited liability exposure poses critical financial risk."
    } else if (highRiskClauses.length > 3) {
      costRisk = "high"
      potentialLiability = "Significant"
      description = "Multiple high-risk clauses create substantial financial exposure."
    } else if (highRiskClauses.length > 1) {
      costRisk = "medium"
      potentialLiability = "Moderate"
      description = "Some financial risk present but within manageable limits."
    }

    return {
      potentialLiability,
      costRisk,
      description,
    }
  }
}

export const riskAssessmentEngine = new RiskAssessmentEngine()
