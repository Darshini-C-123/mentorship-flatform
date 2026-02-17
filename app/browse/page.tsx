'use client'

import { useState, useEffect, useMemo } from 'react'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, MessageSquare, Star } from 'lucide-react'
import { MentorshipRequestModal } from '@/components/mentorship-request-modal'

interface MentorProfile {
  _id: string
  name: string
  bio: string
  role: string
  skills: string[]
  interests: string[]
  profilePictureUrl: string
  rating?: number
}

export default function BrowsePage() {
  const [mentors, setMentors] = useState<MentorProfile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile')
        if (res.ok) {
          const data = await res.json().catch(() => ({}))
          if (data?.user?._id) setCurrentUserId(data.user._id)
        }
      } catch {
        // ignore
      }
    }
    fetchProfile()
  }, [])

  useEffect(() => {
    // Fetch mentors from API
    const fetchMentors = async () => {
      try {
        const response = await fetch('/api/mentors')
        let data: any = null
        try {
          data = await response.json()
        } catch (parseError) {
          console.error('[v0] Failed to parse mentors response as JSON:', parseError)
        }
        if (data?.mentors) {
          setMentors(data.mentors)
        } else {
          setMentors([])
        }
      } catch (error) {
        console.error('[v0] Error fetching mentors:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMentors()
  }, [])

  // Reactive search filter
  const filteredMentors = useMemo(() => {
    if (!searchQuery.trim()) {
      return mentors
    }

    const query = searchQuery.toLowerCase()

    return mentors.filter(mentor => {
      const nameMatch = mentor.name.toLowerCase().includes(query)
      const bioMatch = mentor.bio.toLowerCase().includes(query)
      const skillsMatch = mentor.skills.some(skill => skill.toLowerCase().includes(query))

      return nameMatch || bioMatch || skillsMatch
    })
  }, [mentors, searchQuery])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Browse Mentors</h1>
          <p className="text-muted-foreground text-lg">
            Find experienced mentors or connect with mentees in your field
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by name or skill (e.g., Java, Python, Web Development)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 py-6 text-base"
            />
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-muted-foreground">
              Found {filteredMentors.length} {filteredMentors.length === 1 ? 'mentor' : 'mentors'} matching "{searchQuery}"
            </p>
          )}
        </div>

        {/* Mentors Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading mentors...</p>
          </div>
        ) : filteredMentors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery ? `No mentors found matching "${searchQuery}"` : 'No mentors available yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map(mentor => (
              <Card key={mentor._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <img
                        src={mentor.profilePictureUrl || "/placeholder.svg"}
                        alt={mentor.name}
                        className="w-12 h-12 rounded-full mb-3 object-cover"
                      />
                      <CardTitle className="text-xl">{mentor.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {mentor.role === 'Both' ? 'Mentor & Mentee' : mentor.role}
                      </CardDescription>
                    </div>
                    {mentor.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{mentor.rating}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-foreground">{mentor.bio}</p>

                  {mentor.skills.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {mentor.skills.map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {mentor.interests.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2">Interests</h4>
                      <div className="flex flex-wrap gap-1">
                        {mentor.interests.map((interest, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentUserId && mentor._id === currentUserId ? (
                    <Button variant="secondary" className="w-full" disabled>
                      This is you
                    </Button>
                  ) : (
                    <Button 
                      className="w-full gap-2"
                      onClick={() => {
                        setSelectedMentor(mentor)
                        setIsModalOpen(true)
                      }}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Request Mentorship
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {selectedMentor && (
        <MentorshipRequestModal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          mentorId={selectedMentor._id}
          mentorName={selectedMentor.name}
          mentorSkills={selectedMentor.skills}
        />
      )}
    </div>
  )
}
