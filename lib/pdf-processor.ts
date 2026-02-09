import { extractText, getDocumentProxy } from "unpdf"

interface ExtractionResult {
  text: string
  isScanned: boolean
  pageCount: number
  processingTime: number
}

export async function extractTextFromPDF(buffer: Buffer, fileName: string): Promise<ExtractionResult> {
  const startTime = Date.now()

  try {
    console.log("[v0] Starting PDF text extraction for:", fileName)
    console.log("[v0] Extracting real text from uploaded PDF document using unpdf")

    const pdf = await getDocumentProxy(new Uint8Array(buffer))
    const result = await extractText(pdf, { mergePages: true })

    console.log("[v0] unpdf extraction result:", {
      textLength: result.text?.length || 0,
      totalPages: result.totalPages || 0,
    })

    let extractedText = result.text || ""
    const pageCount = result.totalPages || 1

    // Clean up the extracted text
    extractedText = extractedText
      .replace(/\s+/g, " ")
      .replace(/\n\s*\n/g, "\n\n")
      .trim()

    if (!extractedText || extractedText.length < 50) {
      console.log("[v0] No text found or text too short, document may be scanned")
      return {
        text: `[Scanned Document: ${fileName}]\n\nThis appears to be a scanned PDF document. Text extraction may be limited. Please ensure the document contains selectable text for accurate analysis.`,
        isScanned: true,
        pageCount,
        processingTime: Date.now() - startTime,
      }
    }

    console.log(`[v0] Successfully extracted ${extractedText.length} characters from ${pageCount} pages`)

    return {
      text: extractedText,
      isScanned: false,
      pageCount,
      processingTime: Date.now() - startTime,
    }
  } catch (error) {
    console.error("[v0] PDF processing error:", error)

    const errorMessage = error instanceof Error ? error.message : String(error)

    return {
      text: `[Error Processing: ${fileName}]\n\nPDF processing failed: ${errorMessage}\n\nThis may be due to:\n- Corrupted PDF file\n- Password-protected document\n- Unsupported PDF format\n- Server processing issues\n\nPlease try uploading the document again or use a different PDF file.`,
      isScanned: true,
      pageCount: 1,
      processingTime: Date.now() - startTime,
    }
  }
}
