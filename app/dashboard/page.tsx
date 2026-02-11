'use client'

import { useEffect, useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Check, X, Clock, Send, MessageSquare, Loader2 } from 'lucide-react'

interface MenteeInfo {
  name: string
  email: string
  profilePictureUrl: string
}

interface MentorshipRequest {
  _id: string
  menteeId: MenteeInfo
  status: 'pending' | 'accepted' | 'rejected'
  message: string
  createdAt: string
}

interface Message {
  _id: string
  content: string
  senderName: string
  senderRole: 'Mentor' | 'Mentee'
  createdAt: string
  isRead: boolean
}

export default function DashboardPage() {
  const [requests, setRequests] = useState<MentorshipRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<MentorshipRequest | null>(null)
  const [showChatModal, setShowChatModal] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [isSendingMessage, setIsSendingMessage] = useState(false)

  // Fetch requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/mentorship-requests')
        if (response.ok) {
          const data = await response.json()
          setRequests(data.requests || [])
        }
      } catch (error) {
        console.error('[v0] Error fetching requests:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequests()
    // Poll every 3 seconds for new requests
    const interval = setInterval(fetchRequests, 3000)
    return () => clearInterval(interval)
  }, [])

  // Fetch messages when chat modal is open
  useEffect(() => {
    if (!showChatModal || !selectedRequest) return

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
    // Poll every 1.5 seconds for new messages
    const interval = setInterval(fetchMessages, 1500)
    return () => clearInterval(interval)
  }, [showChatModal, selectedRequest])

  const handleAccept = async (requestId: string) => {
    try {
      const response = await fetch('/api/mentorship-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status: 'accepted' }),
      })

      if (response.ok) {
        setRequests(requests.map(r => (r._id === requestId ? { ...r, status: 'accepted' } : r)))
      }
    } catch (error) {
      console.error('[v0] Error accepting request:', error)
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      const response = await fetch('/api/mentorship-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status: 'rejected' }),
      })

      if (response.ok) {
        setRequests(requests.map(r => (r._id === requestId ? { ...r, status: 'rejected' } : r)))
      }
    } catch (error) {
      console.error('[v0] Error rejecting request:', error)
    }
  }

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

  const openChat = (request: MentorshipRequest) => {
    setSelectedRequest(request)
    setShowChatModal(true)
  }

  const pendingRequests = requests.filter(r => r.status === 'pending')
  const acceptedRequests = requests.filter(r => r.status === 'accepted')
  const rejectedRequests = requests.filter(r => r.status === 'rejected')

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Your Dashboard</h1>
          <p className="text-muted-foreground">Manage your mentorship requests and connections</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        ) : (
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">
                Pending ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="accepted">
                Accepted ({acceptedRequests.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({rejectedRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              {pendingRequests.length === 0 ? (
                <Card>
                  <CardContent className="pt-12 text-center">
                    <p className="text-muted-foreground">No pending requests</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map(request => (
                    <Card key={request._id}>
                      <CardHeader className="flex flex-row items-start justify-between space-y-0">
                        <div className="flex items-start gap-4">
                          <img
                            src={request.menteeId.profilePictureUrl || "/placeholder.svg"}
                            alt={request.menteeId.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <CardTitle className="text-lg">{request.menteeId.name}</CardTitle>
                            <CardDescription>{request.menteeId.email}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Pending
                        </Badge>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {request.message && <p className="text-sm text-foreground">{request.message}</p>}
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleAccept(request._id)}
                            className="flex-1 gap-2"
                          >
                            <Check className="h-4 w-4" />
                            Accept
                          </Button>
                          <Button
                            onClick={() => handleReject(request._id)}
                            variant="outline"
                            className="flex-1 gap-2"
                          >
                            <X className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="accepted" className="mt-6">
              {acceptedRequests.length === 0 ? (
                <Card>
                  <CardContent className="pt-12 text-center">
                    <p className="text-muted-foreground">No accepted requests</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {acceptedRequests.map(request => (
                    <Card key={request._id}>
                      <CardHeader className="flex flex-row items-start justify-between space-y-0">
                        <div className="flex items-start gap-4">
                          <img
                            src={request.menteeId.profilePictureUrl || "/placeholder.svg"}
                            alt={request.menteeId.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <CardTitle className="text-lg">{request.menteeId.name}</CardTitle>
                            <CardDescription>{request.menteeId.email}</CardDescription>
                          </div>
                        </div>
                        <Badge className="flex items-center gap-1 bg-green-600">
                          <Check className="h-3 w-3" />
                          Accepted
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          onClick={() => openChat(request)} 
                          className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Chat with {request.menteeId.name}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="rejected" className="mt-6">
              {rejectedRequests.length === 0 ? (
                <Card>
                  <CardContent className="pt-12 text-center">
                    <p className="text-muted-foreground">No rejected requests</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {rejectedRequests.map(request => (
                    <Card key={request._id}>
                      <CardHeader className="flex flex-row items-start justify-between space-y-0">
                        <div className="flex items-start gap-4">
                          <img
                            src={request.menteeId.profilePictureUrl || "/placeholder.svg"}
                            alt={request.menteeId.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <CardTitle className="text-lg">{request.menteeId.name}</CardTitle>
                            <CardDescription>{request.menteeId.email}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <X className="h-3 w-3" />
                          Rejected
                        </Badge>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Chat Modal */}
        <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
          <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0">
            <DialogHeader className="border-b p-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedRequest?.menteeId.profilePictureUrl}
                  alt={selectedRequest?.menteeId.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <DialogTitle>{selectedRequest?.menteeId.name}</DialogTitle>
                  <p className="text-xs text-muted-foreground mt-1">{selectedRequest?.menteeId.email}</p>
                </div>
              </div>
            </DialogHeader>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map(message => (
                  <div
                    key={message._id}
                    className={`flex ${message.senderRole === 'Mentor' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.senderRole === 'Mentor'
                          ? 'bg-blue-600 text-white'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {message.senderRole === 'Mentee' && (
                        <div className="text-xs font-medium mb-1 opacity-90">{message.senderName}</div>
                      )}
                      <p className="text-sm break-words">{message.content}</p>
                      <div
                        className={`text-xs mt-1 ${
                          message.senderRole === 'Mentor' ? 'text-blue-100' : 'text-muted-foreground'
                        }`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="border-t p-4 flex gap-2">
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
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSendingMessage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
