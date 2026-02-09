"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, Square, Volume2, Settings, Headphones } from "lucide-react"
import { TextToSpeechService, type TTSState, type TTSOptions } from "@/lib/text-to-speech"

interface TTSControlsProps {
  text: string
  language: string
  languageName: string
  className?: string
}

export function TTSControls({ text, language, languageName, className }: TTSControlsProps) {
  const [ttsState, setTtsState] = useState<TTSState>({
    isPlaying: false,
    isPaused: false,
    currentText: "",
    progress: 0,
    duration: 0,
  })

  const [ttsOptions, setTtsOptions] = useState<TTSOptions>({
    language,
    rate: 0.9,
    pitch: 1.0,
    volume: 1.0,
  })

  const [showSettings, setShowSettings] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>("")

  const ttsService = useRef<TextToSpeechService | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      ttsService.current = new TextToSpeechService()
      setIsSupported(ttsService.current.isSupported)

      if (ttsService.current.isSupported) {
        ttsService.current.setCallbacks({
          onStateChange: setTtsState,
          onError: (error) => {
            if (!error.includes("interrupted") && !error.includes("canceled")) {
              console.error("TTS Error:", error)
              // Show user-friendly error message
              setTtsState((prev) => ({ ...prev, isPlaying: false, isPaused: false }))
            }
          },
        })

        // Load available voices
        const voices = ttsService.current.getAvailableVoices(language)
        setAvailableVoices(voices)
        if (voices.length > 0) {
          setSelectedVoice(voices[0].name)
        }
      }
    }

    return () => {
      if (ttsService.current) {
        ttsService.current.stop()
      }
    }
  }, [language])

  const handlePlay = () => {
    if (!ttsService.current || !text.trim()) return

    if (ttsState.isPaused) {
      ttsService.current.resume()
    } else {
      ttsService.current.speak(text, ttsOptions)
    }
  }

  const handlePause = () => {
    if (ttsService.current) {
      ttsService.current.pause()
    }
  }

  const handleStop = () => {
    if (ttsService.current) {
      ttsService.current.stop()
    }
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (!isSupported) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Headphones className="h-4 w-4" />
            <span className="text-sm">Text-to-speech is not supported in this browser</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Headphones className="h-5 w-5 text-primary" />
            Audio Playback
          </CardTitle>
          <Badge variant="secondary">{languageName}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Controls */}
        <div className="flex items-center gap-2">
          {!ttsState.isPlaying ? (
            <Button onClick={handlePlay} size="sm" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              {ttsState.isPaused ? "Resume" : "Play"}
            </Button>
          ) : (
            <Button onClick={handlePause} size="sm" variant="secondary" className="flex items-center gap-2">
              <Pause className="h-4 w-4" />
              Pause
            </Button>
          )}

          <Button onClick={handleStop} size="sm" variant="outline" className="flex items-center gap-2 bg-transparent">
            <Square className="h-4 w-4" />
            Stop
          </Button>

          <Button
            onClick={() => setShowSettings(!showSettings)}
            size="sm"
            variant="ghost"
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>

        {/* Progress Bar */}
        {ttsState.isPlaying && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Playing...</span>
              {ttsState.duration > 0 && <span>~{formatDuration(ttsState.duration)}</span>}
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${ttsState.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Voice Selection */}
              {availableVoices.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Voice</label>
                  <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVoices.map((voice) => (
                        <SelectItem key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Speed Control */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Speed: {ttsOptions.rate.toFixed(1)}x</label>
                <Slider
                  value={[ttsOptions.rate]}
                  onValueChange={([value]) => setTtsOptions((prev) => ({ ...prev, rate: value }))}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Pitch Control */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Pitch: {ttsOptions.pitch.toFixed(1)}</label>
                <Slider
                  value={[ttsOptions.pitch]}
                  onValueChange={([value]) => setTtsOptions((prev) => ({ ...prev, pitch: value }))}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Volume Control */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Volume: {Math.round(ttsOptions.volume * 100)}%
                </label>
                <Slider
                  value={[ttsOptions.volume]}
                  onValueChange={([value]) => setTtsOptions((prev) => ({ ...prev, volume: value }))}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Text Preview */}
        <div className="text-xs text-muted-foreground">
          <p className="line-clamp-2">{text.substring(0, 150)}...</p>
        </div>
      </CardContent>
    </Card>
  )
}
