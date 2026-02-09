'use client'

import React from "react"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { X } from 'lucide-react'

interface MentorshipRequestModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  mentorId: string
  mentorName: string
  mentorSkills: string[]
}

export function MentorshipRequestModal({
  isOpen,
  onOpenChange,
  mentorId,
  mentorName,
  mentorSkills,
}: MentorshipRequestModalProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedSkills.length === 0) {
      setError('Please select at least one skill to learn')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/mentorship-requests/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorId,
          message: `Skills I want to learn: ${selectedSkills.join(', ')}. Additional message: ${message}`,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send request')
      }

      setSuccess(true)
      setTimeout(() => {
        onOpenChange(false)
        setSelectedSkills([])
        setMessage('')
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('[v0] Error sending mentorship request:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Mentorship</DialogTitle>
          <DialogDescription>
            Connect with {mentorName} and start your learning journey
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="text-center py-8">
            <p className="text-green-600 font-semibold mb-2">Success!</p>
            <p className="text-muted-foreground">
              Your mentorship request has been sent to {mentorName}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Skills Selection */}
            <div>
              <label className="text-sm font-semibold text-foreground mb-3 block">
                What skills do you want to learn? *
              </label>
              <div className="flex flex-wrap gap-2">
                {mentorSkills.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`transition-all ${
                      selectedSkills.includes(skill)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    } px-3 py-1 rounded-full text-sm font-medium`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              {error && error.includes('skill') && (
                <p className="text-red-500 text-xs mt-2">{error}</p>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Additional Message (Optional)
              </label>
              <Textarea
                placeholder="Tell the mentor about your goals or background..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="min-h-24"
              />
            </div>

            {/* Selected Skills Summary */}
            {selectedSkills.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  Selected Skills:
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map(skill => (
                    <Badge key={skill} variant="default">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && !error.includes('skill') && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || selectedSkills.length === 0}
                className="flex-1"
              >
                {isLoading ? 'Sending...' : 'Send Request'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
