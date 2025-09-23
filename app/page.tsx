'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import LandingPage from '@/components/LandingPage'

export default function Home() {
  const router = useRouter()
  const { user, loading, needsProfileSetup } = useAuth()

  // Redirect authenticated users to dashboard or profile setup
  useEffect(() => {
    if (!loading && user) {
      if (needsProfileSetup) {
        router.push('/profile-setup')
      } else {
        router.push('/dashboard')
      }
    }
  }, [user, loading, needsProfileSetup, router])

  // Show loading while checking auth
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

  // Show landing page for unauthenticated users
  if (!user) {
    return <LandingPage />
  }

  // Show nothing while redirecting authenticated users
  return null
}