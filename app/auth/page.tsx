'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AuthForm from '@/components/AuthForm'
import Link from 'next/link'

function AuthPageContent() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const { user, loading, needsProfileSetup } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  useEffect(() => {
    if (user && !loading) {
      if (needsProfileSetup) {
        router.push('/profile-setup')
      } else {
        router.push('/')
      }
    }
  }, [user, loading, needsProfileSetup, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto mb-2"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-neutral-50">
      {/* Header with clickable logo */}
      <header className="p-6">
        <Link
          href="/about"
          className="inline-block hover:opacity-80 transition-opacity"
        >
          <h1 className="text-2xl font-display text-primary-600 font-bold">Base</h1>
        </Link>
      </header>

      {/* Auth form centered in remaining space */}
      <div className="flex items-center justify-center px-4" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <div className="w-full max-w-md">
          {message && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{message}</p>
            </div>
          )}
          <AuthForm
            mode={mode}
            onToggleMode={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          />
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background to-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto mb-2"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  )
}