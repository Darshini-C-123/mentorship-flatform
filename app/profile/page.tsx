'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, Upload } from 'lucide-react'

interface UserProfile {
  _id: string
  name: string
  email: string
  bio: string
  role: string
  skills: string[]
  interests: string[]
  profilePictureUrl: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [newSkill, setNewSkill] = useState('')
  const [newInterest, setNewInterest] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    profilePictureUrl: '',
    skills: [],
    interests: [],
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          setFormData({
            name: data.user.name,
            bio: data.user.bio,
            profilePictureUrl: data.user.profilePictureUrl,
            skills: data.user.skills,
            interests: data.user.interests,
          })
        } else if (response.status === 401) {
          router.push('/login')
        }
      } catch (error) {
        console.error('[v0] Error fetching profile:', error)
        setError('Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }))
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill),
    }))
  }

  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()],
      }))
      setNewInterest('')
    }
  }

  const handleRemoveInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest),
    }))
  }

  const handleSave = async () => {
    setError('')
    setIsSaving(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to save profile')
        return
      }

      setUser(data.user)
      alert('Profile updated successfully!')
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('[v0] Error saving profile:', err)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-muted-foreground">Update your profile information and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Profile Picture */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6">
                <img
                  src={formData.profilePictureUrl || "/placeholder.svg"}
                  alt={formData.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
                <div className="flex-1">
                  <Label htmlFor="profilePictureUrl" className="block mb-2">
                    Profile Picture URL
                  </Label>
                  <Input
                    id="profilePictureUrl"
                    name="profilePictureUrl"
                    value={formData.profilePictureUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input disabled value={user.email} />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Input disabled value={user.role === 'Both' ? 'Mentor & Mentee' : user.role} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <CardDescription>Add skills you can teach or learn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  placeholder="Add a skill (e.g., Python, React)"
                  onKeyPress={e => e.key === 'Enter' && handleAddSkill()}
                />
                <Button onClick={handleAddSkill} variant="outline" size="sm">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map(skill => (
                  <Badge key={skill} variant="secondary" className="gap-2 px-3 py-1">
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Interests */}
          <Card>
            <CardHeader>
              <CardTitle>Interests</CardTitle>
              <CardDescription>What areas are you interested in?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newInterest}
                  onChange={e => setNewInterest(e.target.value)}
                  placeholder="Add an interest (e.g., Web Development)"
                  onKeyPress={e => e.key === 'Enter' && handleAddInterest()}
                />
                <Button onClick={handleAddInterest} variant="outline" size="sm">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.interests.map(interest => (
                  <Badge key={interest} variant="outline" className="gap-2 px-3 py-1">
                    {interest}
                    <button
                      onClick={() => handleRemoveInterest(interest)}
                      className="hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {error && <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>}

          {/* Save Button */}
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={isSaving} className="flex-1">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
