interface TranslationMapping {
  [key: string]: {
    [key: string]: string
  }
}

export class SimpleTranslator {
  private languageNames = {
    en: "English",
    hi: "हिंदी (Hindi)",
    ta: "தமிழ் (Tamil)",
    te: "తెలుగు (Telugu)",
    kn: "ಕನ್ನಡ (Kannada)",
    ml: "മലയാളം (Malayalam)",
    gu: "ગુજરાતી (Gujarati)",
  }

  private legalTranslations: TranslationMapping = {
    hi: {
      "legal document": "कानूनी दस्तावेज़",
      contract: "अनुबंध",
      agreement: "समझौता",
      party: "पक्ष",
      parties: "पक्षकार",
      obligation: "दायित्व",
      payment: "भुगतान",
      termination: "समाप्ति",
      confidential: "गोपनीय",
      liability: "देयता",
      breach: "उल्लंघन",
      damages: "हर्जाना",
      indemnity: "क्षतिपूर्ति",
      warranty: "वारंटी",
      "intellectual property": "बौद्धिक संपदा",
      jurisdiction: "न्यायाधिकार",
      "governing law": "शासी कानून",
      dispute: "विवाद",
      arbitration: "मध्यस्थता",
      "force majeure": "अप्रत्याशित परिस्थिति",
      summary: "सारांश",
      document: "दस्तावेज़",
      analysis: "विश्लेषण",
      "key points": "मुख्य बिंदु",
      important: "महत्वपूर्ण",
      section: "धारा",
      clause: "खंड",
      terms: "शर्तें",
      conditions: "स्थितियां",
    },
    ta: {
      "legal document": "சட்ட ஆவணம்",
      contract: "ஒப்பந்தம்",
      agreement: "உடன்படிக்கை",
      party: "தரப்பு",
      parties: "தரப்பினர்",
      obligation: "கடமை",
      payment: "பணம்",
      termination: "முடிவு",
      confidential: "ரகசியம்",
      liability: "பொறுப்பு",
      breach: "மீறல்",
      damages: "சேதம்",
      indemnity: "இழப்பீடு",
      warranty: "உத்தரவாதம்",
      "intellectual property": "அறிவுசார் சொத்து",
      jurisdiction: "அதிகார வரம்பு",
      "governing law": "ஆளும் சட்டம்",
      dispute: "தகராறு",
      arbitration: "நடுவர்",
      "force majeure": "இயற்கை பேரிடர்",
      summary: "சுருக்கம்",
      document: "ஆவணம்",
      analysis: "பகுப்பாய்வு",
      "key points": "முக்கிய புள்ளிகள்",
      important: "முக்கியமான",
      section: "பிரிவு",
      clause: "விதி",
      terms: "நிபந்தனைகள்",
      conditions: "நிலைமைகள்",
    },
    te: {
      "legal document": "చట్టపరమైన పత్రం",
      contract: "ఒప్పందం",
      agreement: "ఒప్పందం",
      party: "పార్టీ",
      parties: "పార్టీలు",
      obligation: "బాధ్యత",
      payment: "చెల్లింపు",
      termination: "ముగింపు",
      confidential: "రహస్యం",
      liability: "బాధ్యత",
      breach: "ఉల్లంఘన",
      damages: "నష్టం",
      indemnity: "నష్టపరిహారం",
      warranty: "వారంటీ",
      "intellectual property": "మేధో సంపత్తి",
      jurisdiction: "అధికార పరిధి",
      "governing law": "పాలక చట్టం",
      dispute: "వివాదం",
      arbitration: "మధ్యవర్తిత్వం",
      "force majeure": "అనివార్య పరిస్థితి",
      summary: "సారాంశం",
      document: "పత్రం",
      analysis: "విశ్లేషణ",
      "key points": "ముఖ్య అంశాలు",
      important: "ముఖ్యమైన",
      section: "విభాగం",
      clause: "నిబంధన",
      terms: "నిబంధనలు",
      conditions: "పరిస్థితులు",
    },
    kn: {
      "legal document": "ಕಾನೂನು ದಾಖಲೆ",
      contract: "ಒಪ್ಪಂದ",
      agreement: "ಒಪ್ಪಂದ",
      party: "ಪಕ್ಷ",
      parties: "ಪಕ್ಷಗಳು",
      obligation: "ಬಾധ್ಯತೆ",
      payment: "ಪಾವತಿ",
      termination: "ಅಂತ್ಯ",
      confidential: "ಗೌಪ್ಯ",
      liability: "ಹೊಣೆಗಾರಿಕೆ",
      breach: "ಉಲ್ಲಂಘನೆ",
      damages: "ಹಾನಿ",
      indemnity: "ಪರಿಹಾರ",
      warranty: "ವಾರಂಟಿ",
      "intellectual property": "ಬೌದ್ಧಿಕ ಆಸ್ತಿ",
      jurisdiction: "ನ್ಯಾಯಾಧಿಕಾರ",
      "governing law": "ಆಡಳಿತ ಕಾನೂನು",
      dispute: "ವಿವಾದ",
      arbitration: "ಮಧ್ಯಸ್ಥಿಕೆ",
      "force majeure": "ಅನಿವಾರ್ಯ ಸ್ಥಿತಿ",
      summary: "ಸಾರಾಂಶ",
      document: "ದಾಖಲೆ",
      analysis: "ವಿಶ್ಲೇಷಣೆ",
      "key points": "ಮುಖ್ಯ ಅಂಶಗಳು",
      important: "ಮುಖ್ಯ",
      section: "ವಿಭಾಗ",
      clause: "ಷರತ್ತು",
      terms: "ನಿಯಮಗಳು",
      conditions: "ಪರಿಸ್ಥಿತಿಗಳು",
    },
    ml: {
      "legal document": "നിയമ രേഖ",
      contract: "കരാർ",
      agreement: "കരാർ",
      party: "കക്ഷി",
      parties: "കക്ഷികൾ",
      obligation: "ബാധ്യത",
      payment: "പേയ്‌മെന്റ്",
      termination: "അവസാനം",
      confidential: "രഹസ്യം",
      liability: "ബാധ്യത",
      breach: "ലംനം",
      damages: "നാശനഷ്ടം",
      indemnity: "നഷ്ടപരിഹാരം",
      warranty: "വാറന്റി",
      "intellectual property": "ബൗദ്ധിക സ്വത്ത്",
      jurisdiction: "അധികാരപരിധി",
      "governing law": "ഭരണ നിയമം",
      dispute: "തർക്കം",
      arbitration: "മധ്യസ്ഥത",
      "force majeure": "അനിവാര്യ സാഹചര്യം",
      summary: "സംഗ്രഹം",
      document: "രേഖ",
      analysis: "വിശകലനം",
      "key points": "പ്രധാന പോയിന്റുകൾ",
      important: "പ്രധ��നപ്പെട്ട",
      section: "വിഭാഗം",
      clause: "വ്യവസ്ഥ",
      terms: "നിബന്ധനകൾ",
      conditions: "വ്യവസ്ഥകൾ",
    },
    gu: {
      "legal document": "કાનૂની દસ્તાવેજ",
      contract: "કરાર",
      agreement: "કરાર",
      party: "પક્ષ",
      parties: "પક્ષો",
      obligation: "જવાબદારી",
      payment: "ચુકવણી",
      termination: "સમાપ્તિ",
      confidential: "ગુપ્ત",
      liability: "જવાબદારી",
      breach: "ભંગ",
      damages: "નુકસાન",
      indemnity: "નુકસાની",
      warranty: "વોરંટી",
      "intellectual property": "બૌદ્ધિક સંપત્તિ",
      jurisdiction: "અધિકારક્ષેત્ર",
      "governing law": "શાસક કાયદો",
      dispute: "વિવાદ",
      arbitration: "લવાદ",
      "force majeure": "અનિવાર્ય પરિસ્થિતિ",
      summary: "સારાંશ",
      document: "દસ્તાવેજ",
      analysis: "વિશ્લેષણ",
      "key points": "મુખ્ય મુદ્દાઓ",
      important: "મહત્વપૂર્ણ",
      section: "વિભાગ",
      clause: "કલમ",
      terms: "શરતો",
      conditions: "પરિસ્થિતિઓ",
    },
  }

  async translateText(text: string, targetLang: string): Promise<string> {
    try {
      console.log(`[v0] SimpleTranslator: translating to ${targetLang}`)

      if (targetLang === "en") return text
      if (!text || text.trim().length === 0) return ""

      const translations = this.legalTranslations[targetLang]
      if (!translations) {
        console.log(`[v0] No translations available for ${targetLang}`)
        return text
      }

      // Create a safe copy of the text for processing
      let translatedText = text

      // Apply translations with word boundaries to avoid partial matches
      for (const [english, translated] of Object.entries(translations)) {
        try {
          const regex = new RegExp(`\\b${english.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi")
          translatedText = translatedText.replace(regex, translated)
        } catch (regexError) {
          console.error(`[v0] Regex error for term "${english}":`, regexError)
          // Skip this translation if regex fails
          continue
        }
      }

      // Add language-specific legal summary templates
      const templates = {
        hi: `कानूनी दस्तावेज़ सारांश:\n\n${translatedText}`,
        ta: `சட்ட ஆவண சுருக்கம்:\n\n${translatedText}`,
        te: `చట్టపరమైన పత్రం సారాంశం:\n\n${translatedText}`,
        kn: `ಕಾನೂನು ದಾಖಲೆ ಸಾರಾಂಶ:\n\n${translatedText}`,
        ml: `നിയമ രേഖ സംഗ്രഹം:\n\n${translatedText}`,
        gu: `કાનૂની દસ્તાવેજ સારાંશ:\n\n${translatedText}`,
      }

      const result = templates[targetLang as keyof typeof templates] || translatedText
      console.log(`[v0] Translation completed for ${targetLang}`)
      return result
    } catch (error) {
      console.error(`[v0] Translation error for ${targetLang}:`, error)
      throw error
    }
  }

  getLanguageName(code: string): string {
    return this.languageNames[code as keyof typeof this.languageNames] || code
  }

  getSupportedLanguages() {
    return Object.entries(this.languageNames).map(([code, name]) => ({
      code,
      name,
    }))
  }
}
