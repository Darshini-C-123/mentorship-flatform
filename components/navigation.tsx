'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, LogOut, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Navigation() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [userName, setUserName] = useState<string>('')
  const [unreadCount, setUnreadCount] = useState(0)

  // Check auth and load user
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/user/profile')
        if (res.ok) {
          let data: { user?: { name?: string } } = {}
          try {
            data = await res.json()
          } catch {
            setIsLoggedIn(false)
            return
          }
          setIsLoggedIn(true)
          setUserName(data.user?.name || '')
        } else {
          setIsLoggedIn(false)
        }
      } catch {
        setIsLoggedIn(false)
      }
    }
    checkAuth()
  }, [])

  // Update tab title when there are unread messages
  useEffect(() => {
    const base = 'MentorHub'
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) ${base}`
    } else {
      document.title = base
    }
    return () => {
      document.title = base
    }
  }, [unreadCount])

  // Fetch unread message count when logged in, and poll
  useEffect(() => {
    if (!isLoggedIn) {
      setUnreadCount(0)
      return
    }
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/chat/unread-count')
        if (res.ok) {
          try {
            const data = await res.json()
            setUnreadCount(data.unreadCount ?? 0)
          } catch {
            // ignore
          }
        }
      } catch {
        // ignore
      }
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 15000) // every 15s
    return () => clearInterval(interval)
  }, [isLoggedIn])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // continue to redirect
    }
    setIsLoggedIn(false)
    setUserName('')
    setUnreadCount(0)
    setIsMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  const navLinkClass = 'text-foreground hover:text-primary transition-colors text-sm font-medium'
  const unreadBadge = unreadCount > 0 && (
    <span className="ml-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-xs font-medium">
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  )

  return (
    <nav className="sticky top-0 z-50 bg-background shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="font-bold text-lg text-foreground hidden sm:inline">MentorHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className={navLinkClass}>
              Home
            </Link>
            <Link href="/browse" className={navLinkClass}>
              Browse
            </Link>
            <Link href="/chat" className={`${navLinkClass} flex items-center`}>
              <MessageSquare className="h-4 w-4 mr-1" />
              Chat
              {unreadBadge}
            </Link>
            <Link href="/dashboard" className={navLinkClass}>
              Dashboard
            </Link>
            <Link href="/profile" className={navLinkClass}>
              My Profile
            </Link>
          </div>

          {/* Auth / User */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn === null ? (
              <span className="text-muted-foreground text-sm">...</span>
            ) : isLoggedIn ? (
              <>
                {userName && (
                  <span className="text-sm text-muted-foreground max-w-[120px] truncate" title={userName}>
                    {userName}
                  </span>
                )}
                <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5">
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/" className="block px-4 py-2 hover:bg-secondary rounded-lg text-sm" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            <Link href="/browse" className="block px-4 py-2 hover:bg-secondary rounded-lg text-sm" onClick={() => setIsMenuOpen(false)}>
              Browse
            </Link>
            <Link href="/chat" className="flex items-center px-4 py-2 hover:bg-secondary rounded-lg text-sm" onClick={() => setIsMenuOpen(false)}>
              Chat
              {unreadBadge}
            </Link>
            <Link href="/dashboard" className="block px-4 py-2 hover:bg-secondary rounded-lg text-sm" onClick={() => setIsMenuOpen(false)}>
              Dashboard
            </Link>
            <Link href="/profile" className="block px-4 py-2 hover:bg-secondary rounded-lg text-sm" onClick={() => setIsMenuOpen(false)}>
              My Profile
            </Link>
            <div className="pt-2 space-y-2 px-4">
              {isLoggedIn === null ? (
                <span className="text-muted-foreground text-sm">...</span>
              ) : isLoggedIn ? (
                <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => { handleLogout(); setIsMenuOpen(false); }}>
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </Button>
              ) : (
                <>
                  <Link href="/login" className="block" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/register" className="block" onClick={() => setIsMenuOpen(false)}>
                    <Button size="sm" className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
