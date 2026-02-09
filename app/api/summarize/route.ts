import { type NextRequest, NextResponse } from "next/server"
import { MultilingualSummarizer } from "@/lib/multilingual-summarizer"

export async function POST(request: NextRequest) {
  const globalErrorHandler = (error: any, context = "unknown") => {
    console.error(`[v0] Global error handler caught in ${context}:`, error)
    console.error(`[v0] Error stack:`, error?.stack)
    console.error(`[v0] Error message:`, error?.message)
    console.error(`[v0] Error type:`, typeof error)

    return NextResponse.json(
      {
        error: "Server error (HTTP 500)",
        details: "The server encountered an internal error. Please try again in a few moments.",
        context,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }

  try {
    console.log("[v0] Summarize API called")

    let requestBody
    try {
      requestBody = await request.json()
      console.log("[v0] Request body parsed successfully")
    } catch (parseError) {
      console.error("[v0] Failed to parse request body:", parseError)
      return NextResponse.json(
        {
          error: "Invalid JSON in request body",
          details: "Please ensure the request contains valid JSON",
        },
        { status: 400 },
      )
    }

    const { text, languages = ["en", "hi", "ta"] } = requestBody
    console.log(`[v0] Processing text of length: ${text?.length}, languages: ${languages}`)

    if (!text) {
      return NextResponse.json({ error: "Text is required for summarization" }, { status: 400 })
    }

    if (text.trim().length === 0) {
      return NextResponse.json({ error: "Text cannot be empty" }, { status: 400 })
    }

    if (text.length > 50000) {
      return NextResponse.json({ error: "Text is too long for processing (max 50,000 characters)" }, { status: 400 })
    }

    const supportedLangCodes = ["en", "hi", "ta", "te", "kn", "ml", "gu"]
    const validLanguages = languages.filter((lang: string) => supportedLangCodes.includes(lang))

    if (validLanguages.length === 0) {
      return NextResponse.json(
        {
          error: "At least one supported language is required",
          supportedLanguages: supportedLangCodes,
        },
        { status: 400 },
      )
    }

    console.log(`[v0] Starting summarization for ${validLanguages.length} languages: ${validLanguages.join(", ")}`)

    let summarizer
    try {
      console.log("[v0] Initializing MultilingualSummarizer...")
      summarizer = new MultilingualSummarizer()
      console.log("[v0] MultilingualSummarizer initialized successfully")
    } catch (initError) {
      console.error("[v0] Failed to initialize summarizer:", initError)
      return globalErrorHandler(initError, "summarizer_initialization")
    }

    try {
      console.log("[v0] Starting summary generation...")
      const result = await Promise.race([
        summarizer.generateMultilingualSummary(text, validLanguages),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error("TIMEOUT: Summary generation timed out after 30 seconds")), 30000)
        }),
      ])

      console.log(`[v0] Summarization completed successfully`)

      return NextResponse.json({
        ...(result as any),
        apiInfo: {
          translationService: "Simple Local Translator",
          processedLanguages: validLanguages.length,
          timestamp: new Date().toISOString(),
          textLength: text.length,
        },
      })
    } catch (summaryError) {
      console.error("[v0] Summary generation failed:", summaryError)
      return globalErrorHandler(summaryError, "summary_generation")
    }
  } catch (error) {
    console.error("[v0] Top-level API error:", error)
    return globalErrorHandler(error, "top_level")
  }
}
