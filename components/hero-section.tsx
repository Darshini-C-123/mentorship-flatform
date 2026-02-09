import { Button } from "@/components/ui/button"

const ArrowRightIcon = () => (
  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

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

export function HeroSection() {
  return (
    <section className="gradient-bg py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl text-balance">
            AI-Powered Legal Document Analysis
            <span className="text-primary"> That Works</span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-muted-foreground text-pretty max-w-2xl mx-auto">
            Transform complex legal documents into actionable insights with advanced AI. Extract clauses, assess risks,
            and generate multilingual summaries with unprecedented accuracy.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" className="text-base">
              Start Analysis
              <ArrowRightIcon />
            </Button>
            <Button variant="outline" size="lg" className="text-base bg-transparent">
              View Demo
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <FileTextIcon />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Smart OCR</h3>
              <p className="text-sm text-muted-foreground text-center">
                Extract text from both digital and scanned PDFs
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <BrainIcon />
              </div>
              <h3 className="text-sm font-semibold text-foreground">AI Classification</h3>
              <p className="text-sm text-muted-foreground text-center">
                Identify clauses with machine learning precision
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <ShieldIcon />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Risk Assessment</h3>
              <p className="text-sm text-muted-foreground text-center">Highlight sensitive language and legal risks</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
