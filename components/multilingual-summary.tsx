"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Globe, Clock, FileText, Languages, Shield, Zap } from "lucide-react"
import { TTSControls } from "@/components/tts-controls"

interface SummaryResult {
  language: string
  languageCode: string
  summary: string
  keyPoints: string[]
  wordCount: number
  originalLength: number
  compressionRatio: number
}

interface MultilingualSummary {
  summaries: SummaryResult[]
  processingTime: number
  supportedLanguages: string[]
  apiInfo?: {
    translationService: string
    processedLanguages: number
    timestamp: string
  }
}

interface MultilingualSummaryProps {
  summary: MultilingualSummary
}

export function MultilingualSummary({ summary }: MultilingualSummaryProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(summary.summaries[0]?.languageCode || "en")

  const currentSummary = summary.summaries.find((s) => s.languageCode === selectedLanguage) || summary.summaries[0]

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5 text-primary" />
              Multilingual Document Summary
            </CardTitle>
            <div className="flex items-center gap-4">
              {summary.apiInfo && (
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">Local Translation</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {summary.processingTime}ms
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{summary.summaries.length} Languages</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{currentSummary.wordCount} Words</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{currentSummary.compressionRatio}% Compression</Badge>
            </div>
            {summary.apiInfo && (
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Local Engine</span>
              </div>
            )}
          </div>

          {summary.apiInfo && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800 dark:text-blue-200">
                  Powered by {summary.apiInfo.translationService}
                </span>
                <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                  Fast & Offline
                </Badge>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Local legal terminology translation for enhanced privacy and speed
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Language Tabs */}
      <Tabs value={selectedLanguage} onValueChange={setSelectedLanguage}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
          {summary.summaries.map((s) => (
            <TabsTrigger key={s.languageCode} value={s.languageCode} className="text-xs">
              {s.languageCode.toUpperCase()}
            </TabsTrigger>
          ))}
        </TabsList>

        {summary.summaries.map((summaryResult) => (
          <TabsContent key={summaryResult.languageCode} value={summaryResult.languageCode}>
            <div className="space-y-4">
              <TTSControls
                text={summaryResult.summary}
                language={summaryResult.languageCode}
                languageName={summaryResult.language}
              />

              {/* Language Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{summaryResult.language}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="text-foreground leading-relaxed">{summaryResult.summary}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Key Points */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Legal Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {summaryResult.keyPoints.map((point, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Badge variant="outline" className="mt-1 text-xs">
                          {index + 1}
                        </Badge>
                        <p className="text-sm text-foreground leading-relaxed flex-1">{point}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Summary Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Summary Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{summaryResult.wordCount}</div>
                      <div className="text-xs text-muted-foreground">Summary Words</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{summaryResult.originalLength}</div>
                      <div className="text-xs text-muted-foreground">Original Words</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{summaryResult.compressionRatio}%</div>
                      <div className="text-xs text-muted-foreground">Compression</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{summaryResult.keyPoints.length}</div>
                      <div className="text-xs text-muted-foreground">Key Points</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
