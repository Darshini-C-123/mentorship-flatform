export interface SummaryResult {
  language: string
  languageCode: string
  summary: string
  keyPoints: string[]
  wordCount: number
  originalLength: number
  compressionRatio: number
}

export interface MultilingualSummary {
  summaries: SummaryResult[]
  processingTime: number
  supportedLanguages: string[]
}

// Extractive summarization using sentence scoring
class ExtractiveSummarizer {
  private stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "shall",
    "can",
    "this",
    "that",
    "these",
    "those",
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "me",
    "him",
    "her",
    "us",
    "them",
  ])

  private legalKeywords = new Set([
    "contract",
    "agreement",
    "clause",
    "party",
    "parties",
    "obligation",
    "liability",
    "breach",
    "termination",
    "confidential",
    "payment",
    "damages",
    "indemnity",
    "warranty",
    "guarantee",
    "intellectual",
    "property",
    "copyright",
    "trademark",
    "patent",
    "license",
    "jurisdiction",
    "governing",
    "law",
    "dispute",
    "arbitration",
    "mediation",
    "force",
    "majeure",
    "amendment",
  ])

  scoreSentence(sentence: string, wordFreq: Map<string, number>): number {
    const words = sentence
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2 && !this.stopWords.has(word))

    let score = 0
    let legalTermBonus = 0

    for (const word of words) {
      const freq = wordFreq.get(word) || 0
      score += freq

      // Boost score for legal terminology
      if (this.legalKeywords.has(word)) {
        legalTermBonus += 2
      }
    }

    // Normalize by sentence length and add legal term bonus
    return words.length > 0 ? score / words.length + legalTermBonus : 0
  }

  extractSummary(text: string, maxSentences = 5): string {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 20)

    if (sentences.length <= maxSentences) {
      return text
    }

    // Calculate word frequency
    const wordFreq = new Map<string, number>()
    const words = text
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2 && !this.stopWords.has(word))

    for (const word of words) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1)
    }

    // Score sentences
    const scoredSentences = sentences.map((sentence, index) => ({
      sentence: sentence.trim(),
      score: this.scoreSentence(sentence, wordFreq),
      index,
    }))

    // Select top sentences maintaining original order
    const topSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSentences)
      .sort((a, b) => a.index - b.index)

    return topSentences.map((s) => s.sentence).join(". ") + "."
  }

  extractKeyPoints(text: string, maxPoints = 8): string[] {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 15)

    // Calculate word frequency for legal terms
    const legalTermFreq = new Map<string, number>()
    const words = text.toLowerCase().split(/\s+/)

    for (const word of words) {
      if (this.legalKeywords.has(word)) {
        legalTermFreq.set(word, (legalTermFreq.get(word) || 0) + 1)
      }
    }

    // Score sentences based on legal term density
    const scoredSentences = sentences.map((sentence) => {
      const sentenceWords = sentence.toLowerCase().split(/\s+/)
      let legalTermCount = 0

      for (const word of sentenceWords) {
        if (this.legalKeywords.has(word)) {
          legalTermCount++
        }
      }

      return {
        sentence: sentence.trim(),
        score: legalTermCount / sentenceWords.length,
        legalTermCount,
      }
    })

    // Select sentences with highest legal term density
    return scoredSentences
      .filter((s) => s.legalTermCount > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxPoints)
      .map((s) => s.sentence)
  }
}

import { SimpleTranslator } from "./simple-translator"

export class MultilingualSummarizer {
  private summarizer = new ExtractiveSummarizer()
  private translator = new SimpleTranslator()

  private supportedLanguages = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिंदी (Hindi)" },
    { code: "ta", name: "தமிழ் (Tamil)" },
    { code: "te", name: "తెలుగు (Telugu)" },
    { code: "kn", name: "ಕನ್ನಡ (Kannada)" },
    { code: "ml", name: "മലയാളം (Malayalam)" },
    { code: "gu", name: "ગુજરાતી (Gujarati)" },
  ]

  private async translateWithFallback(text: string, targetLanguage: string): Promise<string> {
    try {
      console.log(`[v0] Translating to: ${targetLanguage}`)

      if (!text || text.trim().length === 0) {
        console.log(`[v0] Empty text provided for translation to ${targetLanguage}`)
        return ""
      }

      if (targetLanguage === "en") {
        return text
      }

      console.log(`[v0] Using local translator for ${targetLanguage}`)
      const result = await this.translator.translateText(text, targetLanguage)
      console.log(`[v0] Translation completed for ${targetLanguage}`)
      return result
    } catch (error) {
      console.error(`[v0] Translation failed for ${targetLanguage}:`, error)
      const languageName = this.translator.getLanguageName(targetLanguage)
      return `[Translation service temporarily unavailable for ${languageName}]\n\n${text}`
    }
  }

  async generateMultilingualSummary(
    text: string,
    languages: string[] = ["en", "hi", "ta"],
  ): Promise<MultilingualSummary> {
    const startTime = Date.now()

    try {
      console.log("[v0] Starting generateMultilingualSummary")

      if (!text || text.trim().length === 0) {
        throw new Error("Text is required for summary generation")
      }

      if (text.length < 50) {
        throw new Error("Text is too short for meaningful summarization (minimum 50 characters)")
      }

      console.log(`[v0] Generating summary for ${languages.length} languages: ${languages.join(", ")}`)

      let englishSummary: string
      let keyPoints: string[]

      try {
        console.log("[v0] Extracting English summary...")
        englishSummary = this.summarizer.extractSummary(text, 6)
        console.log(`[v0] English summary extracted: ${englishSummary.length} characters`)

        console.log("[v0] Extracting key points...")
        keyPoints = this.summarizer.extractKeyPoints(text, 8)
        console.log(`[v0] Key points extracted: ${keyPoints.length} points`)
      } catch (extractionError) {
        console.error("[v0] Summary extraction failed:", extractionError)
        // Fallback to simple text truncation
        englishSummary = text.length > 1000 ? text.substring(0, 1000) + "..." : text
        keyPoints = text
          .split(/[.!?]+/)
          .filter((s) => s.trim().length > 20)
          .slice(0, 5)
        console.log("[v0] Using fallback summary and key points")
      }

      const summaries: SummaryResult[] = []

      for (const langCode of languages) {
        try {
          console.log(`[v0] Processing language: ${langCode}`)

          const summary =
            langCode === "en" ? englishSummary : await this.translateWithFallback(englishSummary, langCode)

          let translatedKeyPoints: string[]
          if (langCode === "en") {
            translatedKeyPoints = keyPoints
          } else {
            console.log(`[v0] Translating ${keyPoints.length} key points to ${langCode}`)
            translatedKeyPoints = []

            for (let i = 0; i < keyPoints.length; i++) {
              try {
                const translatedPoint = await this.translateWithFallback(keyPoints[i], langCode)
                translatedKeyPoints.push(translatedPoint)
              } catch (error) {
                console.error(`[v0] Failed to translate key point ${i} for ${langCode}:`, error)
                translatedKeyPoints.push(`[Translation failed] ${keyPoints[i]}`)
              }
            }
          }

          const wordCount = summary.split(/\s+/).filter((word) => word.length > 0).length
          const originalWordCount = text.split(/\s+/).filter((word) => word.length > 0).length

          summaries.push({
            language: this.translator.getLanguageName(langCode),
            languageCode: langCode,
            summary,
            keyPoints: translatedKeyPoints,
            wordCount,
            originalLength: originalWordCount,
            compressionRatio: originalWordCount > 0 ? Math.round((wordCount / originalWordCount) * 100) : 0,
          })

          console.log(`[v0] Successfully processed ${langCode}`)
        } catch (error) {
          console.error(`[v0] Failed to generate summary for ${langCode}:`, error)

          if (langCode !== "en") {
            const languageName = this.translator.getLanguageName(langCode)
            summaries.push({
              language: languageName,
              languageCode: langCode,
              summary: `[Translation service temporarily unavailable for ${languageName}]\n\n${englishSummary}`,
              keyPoints: keyPoints.map((point) => `[Translation unavailable] ${point}`),
              wordCount: englishSummary.split(/\s+/).filter((word) => word.length > 0).length,
              originalLength: text.split(/\s+/).filter((word) => word.length > 0).length,
              compressionRatio: Math.round((englishSummary.split(/\s+/).length / text.split(/\s+/).length) * 100),
            })
          } else {
            // If English fails, this is a critical error
            throw new Error("Failed to generate base English summary")
          }
        }
      }

      const processingTime = Date.now() - startTime

      if (summaries.length === 0) {
        throw new Error("Failed to generate any summaries")
      }

      console.log(`[v0] Summary generation completed in ${processingTime}ms for ${summaries.length} languages`)

      return {
        summaries,
        processingTime,
        supportedLanguages: this.supportedLanguages.map((lang) => lang.name),
      }
    } catch (error) {
      console.error("[v0] Critical error in generateMultilingualSummary:", error)
      throw error
    }
  }

  getSupportedLanguages() {
    return this.supportedLanguages
  }
}
