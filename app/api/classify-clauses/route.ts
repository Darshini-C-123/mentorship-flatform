import { type NextRequest, NextResponse } from "next/server"
import { mlClassifier } from "@/lib/ml-classifier"

export async function POST(request: NextRequest) {
  try {
    const { text, documentId } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text content is required" }, { status: 400 })
    }

    const result = await mlClassifier.classifyDocument(text, documentId)

    return NextResponse.json({
      success: true,
      result,
      processedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Clause classification error:", error)
    return NextResponse.json({ error: "Failed to classify clauses" }, { status: 500 })
  }
}
