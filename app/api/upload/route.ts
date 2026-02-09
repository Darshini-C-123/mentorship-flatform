import { type NextRequest, NextResponse } from "next/server"
import { extractTextFromPDF } from "@/lib/pdf-processor"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Extract text from PDF
    const extractionResult = await extractTextFromPDF(buffer, file.name)

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: file.size,
      extractedText: extractionResult.text,
      isScanned: extractionResult.isScanned,
      pageCount: extractionResult.pageCount,
      processingTime: extractionResult.processingTime,
    })
  } catch (error) {
    console.error("PDF processing error:", error)
    return NextResponse.json({ error: "Failed to process PDF file" }, { status: 500 })
  }
}
