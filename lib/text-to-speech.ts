export interface TTSOptions {
  language: string
  rate: number
  pitch: number
  volume: number
}

export interface TTSState {
  isPlaying: boolean
  isPaused: boolean
  currentText: string
  progress: number
  duration: number
}

export class TextToSpeechService {
  private synthesis: SpeechSynthesis
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private voices: SpeechSynthesisVoice[] = []
  private callbacks: {
    onStateChange?: (state: TTSState) => void
    onProgress?: (progress: number) => void
    onEnd?: () => void
    onError?: (error: string) => void
  } = {}

  constructor() {
    this.synthesis = window.speechSynthesis
    this.loadVoices()

    // Load voices when they become available
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => this.loadVoices()
    }
  }

  private loadVoices() {
    this.voices = this.synthesis.getVoices()
  }

  private getVoiceForLanguage(languageCode: string): SpeechSynthesisVoice | null {
    // Language code mapping for Indian languages
    const languageMap: { [key: string]: string[] } = {
      en: ["en-US", "en-GB", "en-IN"],
      hi: ["hi-IN", "hi"],
      ta: ["ta-IN", "ta"],
      te: ["te-IN", "te"],
      kn: ["kn-IN", "kn"],
      ml: ["ml-IN", "ml"],
      gu: ["gu-IN", "gu"],
    }

    const possibleLangs = languageMap[languageCode] || [languageCode]

    for (const lang of possibleLangs) {
      const voice = this.voices.find((v) => v.lang.startsWith(lang))
      if (voice) return voice
    }

    // Fallback to English
    return this.voices.find((v) => v.lang.startsWith("en")) || this.voices[0] || null
  }

  speak(text: string, options: Partial<TTSOptions> = {}) {
    if (!text.trim()) return

    // Stop any current speech
    this.stop()

    const utterance = new SpeechSynthesisUtterance(text)
    const voice = this.getVoiceForLanguage(options.language || "en")

    if (voice) {
      utterance.voice = voice
    }

    utterance.rate = options.rate || 0.9
    utterance.pitch = options.pitch || 1.0
    utterance.volume = options.volume || 1.0

    // Set up event listeners
    utterance.onstart = () => {
      this.callbacks.onStateChange?.({
        isPlaying: true,
        isPaused: false,
        currentText: text,
        progress: 0,
        duration: this.estimateDuration(text),
      })
    }

    utterance.onend = () => {
      this.callbacks.onStateChange?.({
        isPlaying: false,
        isPaused: false,
        currentText: "",
        progress: 100,
        duration: 0,
      })
      this.callbacks.onEnd?.()
      this.currentUtterance = null
    }

    utterance.onerror = (event) => {
      const errorMessage = event.error

      // Don't treat interruptions as fatal errors - they're normal user behavior
      if (errorMessage === "interrupted" || errorMessage === "canceled") {
        console.log("[v0] TTS was interrupted by user or system")
        this.callbacks.onStateChange?.({
          isPlaying: false,
          isPaused: false,
          currentText: "",
          progress: 0,
          duration: 0,
        })
      } else {
        // Only report actual errors, not interruptions
        console.warn("[v0] TTS Error:", errorMessage)
        this.callbacks.onError?.(`Speech synthesis error: ${errorMessage}`)
      }

      this.currentUtterance = null
    }

    utterance.onboundary = (event) => {
      if (event.name === "word") {
        const progress = (event.charIndex / text.length) * 100
        this.callbacks.onProgress?.(progress)
      }
    }

    this.currentUtterance = utterance
    this.synthesis.speak(utterance)
  }

  pause() {
    if (this.synthesis.speaking && !this.synthesis.paused) {
      this.synthesis.pause()
      this.callbacks.onStateChange?.({
        isPlaying: false,
        isPaused: true,
        currentText: this.currentUtterance?.text || "",
        progress: 0,
        duration: 0,
      })
    }
  }

  resume() {
    if (this.synthesis.paused) {
      this.synthesis.resume()
      this.callbacks.onStateChange?.({
        isPlaying: true,
        isPaused: false,
        currentText: this.currentUtterance?.text || "",
        progress: 0,
        duration: 0,
      })
    }
  }

  stop() {
    if (this.synthesis.speaking || this.synthesis.paused) {
      this.synthesis.cancel()
      this.callbacks.onStateChange?.({
        isPlaying: false,
        isPaused: false,
        currentText: "",
        progress: 0,
        duration: 0,
      })
      this.currentUtterance = null
    }
  }

  setCallbacks(callbacks: typeof this.callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  getAvailableVoices(languageCode?: string): SpeechSynthesisVoice[] {
    if (!languageCode) return this.voices

    const languageMap: { [key: string]: string[] } = {
      en: ["en-US", "en-GB", "en-IN"],
      hi: ["hi-IN", "hi"],
      ta: ["ta-IN", "ta"],
      te: ["te-IN", "te"],
      kn: ["kn-IN", "kn"],
      ml: ["ml-IN", "ml"],
      gu: ["gu-IN", "gu"],
    }

    const possibleLangs = languageMap[languageCode] || [languageCode]
    return this.voices.filter((voice) => possibleLangs.some((lang) => voice.lang.startsWith(lang)))
  }

  private estimateDuration(text: string): number {
    // Rough estimation: average reading speed is 200 words per minute
    const wordCount = text.split(/\s+/).length
    return Math.ceil((wordCount / 200) * 60) // seconds
  }

  get isSupported(): boolean {
    return "speechSynthesis" in window
  }

  get isPlaying(): boolean {
    return this.synthesis.speaking && !this.synthesis.paused
  }

  get isPaused(): boolean {
    return this.synthesis.paused
  }
}
