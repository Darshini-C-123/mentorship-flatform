'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, MessageSquare, UserPlus, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface NotificationItem {
  id: string
  type: 'message' | 'request' | 'approval' | 'rejection'
  senderName: string
  text: string
  timestamp: string
  link: string
}

function formatTimeAgo(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const sec = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (sec < 60) return 'Just now'
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
  if (sec < 604800) return `${Math.floor(sec / 86400)}d ago`
  return d.toLocaleDateString()
}

function typeLabel(type: NotificationItem['type']) {
  switch (type) {
    case 'message': return 'New message'
    case 'request': return 'Mentorship request'
    case 'approval': return 'Request accepted'
    case 'rejection': return 'Request declined'
    default: return type
  }
}

function typeIcon(type: NotificationItem['type']) {
  switch (type) {
    case 'message': return <MessageSquare className="h-4 w-4 shrink-0" />
    case 'request': return <UserPlus className="h-4 w-4 shrink-0" />
    case 'approval': return <Check className="h-4 w-4 shrink-0 text-green-600" />
    case 'rejection': return <X className="h-4 w-4 shrink-0 text-destructive" />
    default: return <Bell className="h-4 w-4 shrink-0" />
  }
}

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [totalUnread, setTotalUnread] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications ?? [])
        setTotalUnread(data.totalUnread ?? 0)
      }
    } catch {
      setNotifications([])
      setTotalUnread(0)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (open) {
      setIsLoading(true)
      fetchNotifications().finally(() => setIsLoading(false))
    }
  }, [open])

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {totalUnread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
              {totalUnread > 99 ? '99+' : totalUnread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[320px] max-h-[400px] overflow-y-auto">
        <div className="px-2 py-2 font-semibold text-sm">Notifications</div>
        {isLoading && notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          <div className="space-y-0.5">
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={n.link}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <div className="flex gap-2">
                  <div className="mt-0.5 text-muted-foreground">
                    {typeIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{n.senderName}</p>
                    <p className="text-xs text-muted-foreground">{typeLabel(n.type)}</p>
                    <p className="truncate text-muted-foreground mt-0.5">{n.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatTimeAgo(n.timestamp)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
