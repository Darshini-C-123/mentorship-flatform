'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Navigation() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState(null)

  const handleLogout = () => {
    // Clear auth state
    setUser(null)
    router.push('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-border">
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
            <Link href="/" className="text-foreground hover:text-primary transition-colors text-sm font-medium">
              Home
            </Link>
            <Link href="/browse" className="text-foreground hover:text-primary transition-colors text-sm font-medium">
              Browse
            </Link>
            <Link href="/chat" className="text-foreground hover:text-primary transition-colors text-sm font-medium">
              Chat
            </Link>
            <Link href="/dashboard" className="text-foreground hover:text-primary transition-colors text-sm font-medium">
              Dashboard
            </Link>
            <Link href="/profile" className="text-foreground hover:text-primary transition-colors text-sm font-medium">
              My Profile
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Log In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Sign Up</Button>
            </Link>
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
            <Link href="/" className="block px-4 py-2 hover:bg-secondary rounded-lg text-sm">
              Home
            </Link>
            <Link href="/browse" className="block px-4 py-2 hover:bg-secondary rounded-lg text-sm">
              Browse
            </Link>
            <Link href="/chat" className="block px-4 py-2 hover:bg-secondary rounded-lg text-sm">
              Chat
            </Link>
            <Link href="/dashboard" className="block px-4 py-2 hover:bg-secondary rounded-lg text-sm">
              Dashboard
            </Link>
            <Link href="/profile" className="block px-4 py-2 hover:bg-secondary rounded-lg text-sm">
              My Profile
            </Link>
            <div className="pt-2 space-y-2 px-4">
              <Link href="/login" className="block">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  Log In
                </Button>
              </Link>
              <Link href="/register" className="block">
                <Button size="sm" className="w-full">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
