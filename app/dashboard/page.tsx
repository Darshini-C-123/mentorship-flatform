'use client'

import { useEffect, useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, X, Clock } from 'lucide-react'

interface MentorshipRequest {
  _id: string
  menteeId: {
    name: string
    email: string
    profilePictureUrl: string
  }
  status: 'pending' | 'accepted' | 'rejected'
  message: string
  createdAt: string
}

export default function DashboardPage() {
  const [requests, setRequests] = useState<MentorshipRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
  }, [])

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
                        <Button variant="outline" className="w-full bg-transparent">
                          Send Message
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
      </main>
    </div>
  )
}
