import { Card, CardContent } from "@/components/ui/card"

const FileTextIcon = () => (
  <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
)

const BrainIcon = () => (
  <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
    />
  </svg>
)

const ShieldIcon = () => (
  <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
)

const GlobeIcon = () => (
  <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
    />
  </svg>
)

const VolumeIcon = () => (
  <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 12H4l3-3v6l-3-3h5zm0 0v6a2 2 0 002 2h2"
    />
  </svg>
)

const SearchIcon = () => (
  <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
)

const BarChartIcon = () => (
  <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
)

const ZapIcon = () => (
  <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const features = [
  {
    icon: FileTextIcon,
    title: "Smart OCR Processing",
    description:
      "Advanced optical character recognition extracts text from both digital and scanned PDF documents with high accuracy.",
  },
  {
    icon: BrainIcon,
    title: "AI Clause Classification",
    description:
      "Machine learning models identify and classify legal clauses including termination, NDAs, and payment obligations.",
  },
  {
    icon: ShieldIcon,
    title: "Risk Assessment",
    description:
      "Automatically highlight clauses containing legally sensitive or risky language to focus your attention.",
  },
  {
    icon: GlobeIcon,
    title: "Multilingual Summaries",
    description:
      "Generate comprehensive summaries in multiple Indian languages for improved accessibility and comprehension.",
  },
  {
    icon: VolumeIcon,
    title: "Text-to-Speech Output",
    description: "Convert legal summaries to audio format, making documents accessible for visually impaired users.",
  },
  {
    icon: SearchIcon,
    title: "Advanced Text Processing",
    description:
      "Sophisticated preprocessing with tokenization, normalization, and stemming for enhanced analysis quality.",
  },
  {
    icon: BarChartIcon,
    title: "Detailed Analytics",
    description: "Comprehensive reports and visualizations of document structure, risks, and key legal points.",
  },
  {
    icon: ZapIcon,
    title: "Fast Processing",
    description: "Rapid document analysis powered by optimized AI models for quick turnaround times.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-accent/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">Comprehensive Legal AI Features</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our advanced AI system provides end-to-end legal document analysis with industry-leading accuracy and
            accessibility features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                  <feature.icon />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
