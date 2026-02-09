import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { extractedText, fileName } = await request.json()

    if (!extractedText) {
      return NextResponse.json({ error: "No text provided for processing" }, { status: 400 })
    }

    // Simulate text preprocessing steps
    const preprocessingSteps = [
      "Tokenizing text...",
      "Removing stop words...",
      "Normalizing text...",
      "Applying stemming...",
      "Preparing for classification...",
    ]

    // Call ML classification API
    const classificationResponse = await fetch(`${request.nextUrl.origin}/api/classify-clauses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: extractedText,
        documentId: fileName,
      }),
    })

    let classificationResult = null
    if (classificationResponse.ok) {
      const classificationData = await classificationResponse.json()
      classificationResult = classificationData.result
    }

    // Return preprocessing and classification results
    const processedData = {
      fileName,
      originalLength: extractedText.length,
      processedText: extractedText.toLowerCase().trim(),
      wordCount: extractedText.split(/\s+/).length,
      preprocessingSteps,
      readyForClassification: true,
      processingTime: Math.floor(Math.random() * 3000) + 1000, // Simulate processing time
      classificationResult,
    }

    return NextResponse.json({
      success: true,
      ...processedData,
    })
  } catch (error) {
    console.error("Document processing error:", error)
    return NextResponse.json({ error: "Failed to process document" }, { status: 500 })
  }
}
