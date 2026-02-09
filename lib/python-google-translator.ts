import { exec } from "child_process"
import { promisify } from "util"
import path from "path"
import fs from "fs"

const execAsync = promisify(exec)

export interface TranslationResult {
  success: boolean
  originalText: string
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  chunksProcessed?: number
  error?: string
}

export class PythonGoogleTranslator {
  private static instance: PythonGoogleTranslator
  private scriptPath: string

  private constructor() {
    this.scriptPath = path.join(process.cwd(), "scripts", "google_translate.py")
  }

  public static getInstance(): PythonGoogleTranslator {
    if (!PythonGoogleTranslator.instance) {
      PythonGoogleTranslator.instance = new PythonGoogleTranslator()
    }
    return PythonGoogleTranslator.instance
  }

  /**
   * Language code mapping for Indian languages
   */
  private getLanguageCode(language: string): string {
    const languageMap: Record<string, string> = {
      hindi: "hi",
      tamil: "ta",
      telugu: "te",
      kannada: "kn",
      malayalam: "ml",
      gujarati: "gu",
      bengali: "bn",
      marathi: "mr",
      punjabi: "pa",
      urdu: "ur",
      english: "en",
    }

    return languageMap[language.toLowerCase()] || language.toLowerCase()
  }

  private escapeTextForCommand(text: string): string {
    try {
      const tempFile = path.join(process.cwd(), "scripts", "temp_text.txt")

      // Ensure scripts directory exists
      const scriptsDir = path.dirname(tempFile)
      if (!fs.existsSync(scriptsDir)) {
        fs.mkdirSync(scriptsDir, { recursive: true })
      }

      fs.writeFileSync(tempFile, text, "utf8")
      return tempFile
    } catch (fileError) {
      console.error("[v0] Failed to create temp file:", fileError)
      throw new Error(`File system error: ${fileError instanceof Error ? fileError.message : "Unknown error"}`)
    }
  }

  /**
   * Translate text using Python Google Translate script
   */
  async translateText(text: string, targetLanguage: string, sourceLanguage = "auto"): Promise<TranslationResult> {
    let tempFile: string | null = null

    try {
      console.log(`[v0] Starting Python Google Translate: ${sourceLanguage} -> ${targetLanguage}`)

      if (!text || text.trim().length === 0) {
        throw new Error("Empty text provided for translation")
      }

      if (text.length > 10000) {
        throw new Error("Text too long for translation (max 10,000 characters)")
      }

      const targetCode = this.getLanguageCode(targetLanguage)
      const sourceCode = sourceLanguage === "auto" ? "auto" : this.getLanguageCode(sourceLanguage)

      try {
        tempFile = this.escapeTextForCommand(text)
      } catch (fileError) {
        throw new Error(
          `Failed to prepare text for translation: ${fileError instanceof Error ? fileError.message : "File error"}`,
        )
      }

      if (!fs.existsSync(this.scriptPath)) {
        throw new Error("Python translation script not found")
      }

      const command = `python3 "${this.scriptPath}" --text "$(cat '${tempFile}')" --target "${targetCode}" --source "${sourceCode}" --output json`

      console.log(`[v0] Executing translation command for ${text.length} characters`)

      const { stdout, stderr } = await execAsync(command, {
        timeout: 25000, // Reduced timeout to 25 seconds
        maxBuffer: 1024 * 1024 * 5, // 5MB buffer
        shell: "/bin/bash",
        env: { ...process.env, PYTHONPATH: process.cwd() },
      })

      if (stderr && !stderr.includes("WARNING")) {
        console.log(`[v0] Translation stderr: ${stderr}`)
        // Don't fail on warnings, only on actual errors
        if (stderr.includes("ERROR") || stderr.includes("Exception")) {
          throw new Error(`Python script error: ${stderr}`)
        }
      }

      if (!stdout || stdout.trim().length === 0) {
        throw new Error("Empty response from Python translation script")
      }

      let result: TranslationResult
      try {
        result = JSON.parse(stdout.trim())
      } catch (parseError) {
        console.error(`[v0] Failed to parse translation result: ${stdout}`)
        throw new Error(
          `Invalid JSON response from translation script: ${parseError instanceof Error ? parseError.message : "Parse error"}`,
        )
      }

      console.log(`[v0] Translation completed: ${result.success ? "success" : "failed"}`)

      return result
    } catch (error) {
      console.error(`[v0] Python translation error:`, error)

      let errorMessage = "Unknown translation error"
      if (error instanceof Error) {
        if (error.message.includes("ENOENT")) {
          errorMessage = "Python or translation script not found"
        } else if (error.message.includes("timeout")) {
          errorMessage = "Translation request timed out"
        } else if (error.message.includes("JSON")) {
          errorMessage = "Invalid response from translation service"
        } else if (error.message.includes("File system")) {
          errorMessage = "File system error during translation"
        } else {
          errorMessage = error.message
        }
      }

      return {
        success: false,
        originalText: text,
        translatedText: text, // Fallback to original text
        sourceLanguage,
        targetLanguage,
        error: errorMessage,
      }
    } finally {
      if (tempFile) {
        try {
          if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile)
          }
        } catch (cleanupError) {
          console.warn(`[v0] Failed to cleanup temp file: ${cleanupError}`)
        }
      }
    }
  }

  /**
   * Translate multiple texts in batch
   */
  async translateBatch(texts: string[], targetLanguage: string, sourceLanguage = "auto"): Promise<TranslationResult[]> {
    const results: TranslationResult[] = []

    for (const text of texts) {
      const result = await this.translateText(text, targetLanguage, sourceLanguage)
      results.push(result)

      // Small delay between translations to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    return results
  }

  /**
   * Check if Python and required libraries are available
   */
  async checkAvailability(): Promise<boolean> {
    try {
      console.log("[v0] Checking Python Google Translate availability...")

      // Check if Python script exists
      if (!fs.existsSync(this.scriptPath)) {
        console.error("[v0] Python script not found at:", this.scriptPath)
        return false
      }

      const { stdout, stderr } = await execAsync("python3 -c \"import googletrans; print('OK')\"", {
        timeout: 5000, // Shorter timeout for availability check
      })

      if (stderr && stderr.includes("ERROR")) {
        console.error("[v0] Python availability check stderr:", stderr)
        return false
      }

      const available = stdout.trim() === "OK"
      console.log(`[v0] Python Google Translate availability: ${available}`)

      return available
    } catch (error) {
      console.error("[v0] Python Google Translate not available:", error)
      return false
    }
  }
}

export const pythonGoogleTranslator = PythonGoogleTranslator.getInstance()
