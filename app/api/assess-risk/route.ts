import { type NextRequest, NextResponse } from "next/server"
import { riskAssessmentEngine } from "@/lib/risk-assessment-engine"

export async function POST(request: NextRequest) {
  try {
    const { classificationResult, documentText, documentId } = await request.json()

    if (!classificationResult || !documentText) {
      return NextResponse.json({ error: "Classification result and document text are required" }, { status: 400 })
    }

    console.log("[v0] Starting risk assessment for document:", documentId)

    // Run comprehensive risk assessment
    const riskAssessment = await riskAssessmentEngine.assessRisk(classificationResult, documentText)

    console.log("[v0] Risk assessment complete:", {
      overallScore: riskAssessment.overallRiskScore,
      grade: riskAssessment.riskGrade,
      criticalFactors: riskAssessment.riskFactors.filter((rf) => rf.severity === "critical").length,
    })

    return NextResponse.json({
      success: true,
      riskAssessment,
      processedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Risk assessment error:", error)
    return NextResponse.json({ error: "Failed to assess risk" }, { status: 500 })
  }
}
