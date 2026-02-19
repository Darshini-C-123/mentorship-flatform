import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "MentorHub - Peer-to-Peer Mentorship Platform",
  description:
    "Connect with mentors and mentees in your field. Learn and grow through meaningful mentorship relationships.",
  generator: "v0.app",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-background text-foreground">
        <Suspense fallback={null}>{children}</Suspense>
      </body>
    </html>
  )
}
