export function TrustedBySection() {
  const companies = [
    "Supreme Court of India",
    "Delhi High Court",
    "Legal Associates",
    "Corporate Law Firm",
    "Government Legal Dept",
    "Law University",
  ]

  return (
    <section className="py-16 bg-background border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground mb-8">TRUSTED BY LEGAL PROFESSIONALS AT</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {companies.map((company, index) => (
              <div key={index} className="text-center">
                <div className="text-sm font-medium text-muted-foreground/80 hover:text-foreground transition-colors">
                  {company}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
