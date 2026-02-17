'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, AlertTriangle, Trash2 } from 'lucide-react'

export function DangerZone() {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will remove all your data, including mentorship requests and messages.'
    )
    if (!confirmed) return
    setIsDeleting(true)
    setDeleteError('')
    try {
      const res = await fetch('/api/user/delete', { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setDeleteError(data?.error || 'Failed to delete account')
        setIsDeleting(false)
        return
      }
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
      router.refresh()
    } catch (err) {
      setDeleteError('Something went wrong. Please try again.')
      setIsDeleting(false)
    }
  }

  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Danger Zone
        </CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data. This cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {deleteError && (
          <p className="text-sm text-destructive">{deleteError}</p>
        )}
        <Button
          variant="destructive"
          onClick={handleDeleteAccount}
          disabled={isDeleting}
        >
          {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Trash2 className="mr-2 h-4 w-4" />
          {isDeleting ? 'Deleting...' : 'Delete Account'}
        </Button>
      </CardContent>
    </Card>
  )
}
