'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Clock, Send, Star, MessageSquare, AlertCircle } from 'lucide-react'
import { Loader2 } from 'lucide-react'

interface MentorInfo {
  _id: string
  name: string
  email: string
  profilePictureUrl: string
  role: string
}

interface MentorshipRequest {
  _id: string
  mentorId: MentorInfo
  status: 'pending' | 'accepted' | 'rejected'
  message: string
  createdAt: string
  updatedAt: string
}

interface Message {
  _id: string
  content: string
  senderName: string
  senderRole: 'Mentor' | 'Mentee'
  createdAt: string
  isRead: boolean
}

interface FeedbackData {
  rating: number
  comment: string
}

export default function ChatPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<MentorshipRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<MentorshipRequest | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  
  // Feedback modal states
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackData>({ rating: 5, comment: '' })
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [feedbackError, setFeedbackError] = useState('')
  const [feedbackSuccess, setFeedbackSuccess] = useState('')

  // Fetch sent requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/mentorship-requests/sent')
        if (response.ok) {
          const data = await response.json()
          setRequests(data.requests || [])
        } else if (response.status === 401) {
          router.push('/login')
        }
      } catch (error) {
        console.error('[v0] Error fetching requests:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequests()

    // Poll for updates every 3 seconds
    const interval = setInterval(fetchRequests, 3000)
    return () => clearInterval(interval)
  }, [router])

  // Fetch messages when request is selected
  useEffect(() => {
    if (!selectedRequest) return

    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/chat?requestId=${selectedRequest._id}`)
        if (response.ok) {
          const data = await response.json()
          setMessages(data.messages || [])
        }
      } catch (error) {
        console.error('[v0] Error fetching messages:', error)
      }
    }

    fetchMessages()

    // Poll for new messages every 1.5 seconds for faster updates
    const interval = setInterval(fetchMessages, 1500)
    return () => clearInterval(interval)
  }, [selectedRequest])

  const handleSendMessage = async () => {
    if (!selectedRequest || !messageInput.trim()) return

    setIsSendingMessage(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorshipRequestId: selectedRequest._id,
          content: messageInput,
        }),
      })

      if (response.ok) {
        setMessageInput('')
        // Fetch updated messages
        const messagesResponse = await fetch(`/api/chat?requestId=${selectedRequest._id}`)
        if (messagesResponse.ok) {
          const data = await messagesResponse.json()
          setMessages(data.messages || [])
        }
      }
    } catch (error) {
      console.error('[v0] Error sending message:', error)
    } finally {
      setIsSendingMessage(false)
    }
  }

  const handleSubmitFeedback = async () => {
    if (!selectedRequest || feedback.rating < 1 || feedback.rating > 5) {
      setFeedbackError('Please select a valid rating')
      return
    }

    setIsSubmittingFeedback(true)
    setFeedbackError('')
    setFeedbackSuccess('')

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorshipRequestId: selectedRequest._id,
          mentorId: selectedRequest.mentorId._id,
          rating: feedback.rating,
          comment: feedback.comment,
        }),
      })

      if (response.ok) {
        setFeedbackSuccess('Thank you! Your feedback has been submitted.')
        setFeedback({ rating: 5, comment: '' })
        setTimeout(() => {
          setShowFeedbackModal(false)
          setFeedbackSuccess('')
        }, 2000)
      } else {
        const data = await response.json()
        setFeedbackError(data.error || 'Failed to submit feedback')
      }
    } catch (error) {
      console.error('[v0] Error submitting feedback:', error)
      setFeedbackError('An error occurred. Please try again.')
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading your mentorship connections...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Mentorship Connections</h1>
          <p className="text-muted-foreground">View your requests, chat with mentors, and leave feedback</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Requests List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">My Requests</CardTitle>
                <CardDescription>
                  {requests.length} {requests.length === 1 ? 'request' : 'requests'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {requests.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">
                    No mentorship requests yet. Head to browse to find a mentor!
                  </p>
                ) : (
                  requests.map(request => (
                    <Button
                      key={request._id}
                      variant={selectedRequest?._id === request._id ? 'default' : 'outline'}
                      className="w-full justify-start text-left h-auto py-3"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{request.mentorId.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          {request.status === 'pending' && (
                            <>
                              <Clock className="h-3 w-3" />
                              <span className="text-xs text-amber-600">Pending</span>
                            </>
                          )}
                          {request.status === 'accepted' && (
                            <>
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              <span className="text-xs text-green-600">Accepted</span>
                            </>
                          )}
                          {request.status === 'rejected' && (
                            <>
                              <XCircle className="h-3 w-3 text-red-600" />
                              <span className="text-xs text-red-600">Rejected</span>
                            </>
                          )}
                        </div>
                      </div>
                    </Button>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {selectedRequest ? (
              <Card className="flex flex-col h-[600px]">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedRequest.mentorId.profilePictureUrl}
                        alt={selectedRequest.mentorId.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <CardTitle className="text-base">{selectedRequest.mentorId.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {selectedRequest.status === 'pending' && 'Awaiting response'}
                          {selectedRequest.status === 'accepted' && 'Connection accepted ✓'}
                          {selectedRequest.status === 'rejected' && 'Request rejected'}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {selectedRequest.status === 'pending'
                          ? 'Awaiting mentor response...'
                          : 'No messages yet. Start the conversation!'}
                      </p>
                    </div>
                  ) : (
                    messages.map(message => (
                      <div
                        key={message._id}
                        className={`flex ${
                          message.senderRole === 'Mentee' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.senderRole === 'Mentee'
                              ? 'bg-blue-600 text-white'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          {message.senderRole === 'Mentor' && (
                            <div className="text-xs font-medium mb-1 opacity-90">{message.senderName}</div>
                          )}
                          <p className="text-sm">{message.content}</p>
                          <div
                            className={`text-xs mt-1 ${
                              message.senderRole === 'Mentee' ? 'text-blue-100' : 'text-muted-foreground'
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>

                {/* Message Input */}
                {selectedRequest.status === 'accepted' && (
                  <>
                    <div className="border-t p-4 space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type your message..."
                          value={messageInput}
                          onChange={e => setMessageInput(e.target.value)}
                          onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                          disabled={isSendingMessage}
                        />
                        <Button
                          size="icon"
                          onClick={handleSendMessage}
                          disabled={!messageInput.trim() || isSendingMessage}
                        >
                          {isSendingMessage ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {/* Feedback Button */}
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => setShowFeedbackModal(true)}
                      >
                        <Star className="h-4 w-4" />
                        Leave Feedback
                      </Button>
                    </div>
                  </>
                )}

                {selectedRequest.status === 'pending' && (
                  <div className="border-t p-4 bg-amber-50 dark:bg-amber-950">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        Waiting for mentor to respond to your request. You'll be able to chat once they accept.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Select a request to start chatting with your mentor
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Feedback Modal */}
      <Dialog open={showFeedbackModal} onOpenChange={setShowFeedbackModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Feedback for {selectedRequest?.mentorId.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {feedbackError && (
              <Alert variant="destructive">
                <AlertDescription>{feedbackError}</AlertDescription>
              </Alert>
            )}

            {feedbackSuccess && (
              <Alert>
                <AlertDescription className="text-green-600">{feedbackSuccess}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setFeedback({ ...feedback, rating: star })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 cursor-pointer transition ${
                        star <= feedback.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Comment (Optional)</Label>
              <Textarea
                id="comment"
                placeholder="Share your experience working with this mentor..."
                value={feedback.comment}
                onChange={e => setFeedback({ ...feedback, comment: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFeedbackModal(false)}
                disabled={isSubmittingFeedback}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitFeedback} disabled={isSubmittingFeedback}>
                {isSubmittingFeedback ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Feedback'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
