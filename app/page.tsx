'use client'

import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Lightbulb, Award, MessageSquare } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Connect with Mentors
            <br />
            <span className="text-primary">Grow Together</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            MentorHub is a peer-to-peer mentorship platform where mentors and mentees connect, learn, and grow together. Find experienced mentors or become one and make a difference.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/browse">
              <Button size="lg">Browse Mentors</Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Create Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Sign up and tell us about your skills, expertise, and interests
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Browse & Connect</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Discover mentors with the skills you want to learn or find mentees to teach
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Request Mentorship</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Send requests to mentors and respond to mentee applications on your dashboard
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Share Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Rate your mentors and leave feedback to help the community grow
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center bg-primary/5 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Start?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of mentors and mentees building meaningful relationships and advancing their careers.
          </p>
          <Link href="/register">
            <Button size="lg">Create Your Account</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2024 MentorHub. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
