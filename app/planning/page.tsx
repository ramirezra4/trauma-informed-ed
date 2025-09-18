'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import NavigationMenu from '@/components/NavigationMenu'

export default function PlanningPage() {
  const router = useRouter()
  const { user, loading, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth')
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

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

  // Don't render if no user (will redirect)
  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-neutral-50 px-4 py-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with hamburger, greeting, and sign out all aligned */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {/* Hamburger menu button */}
            <button
              onClick={() => setMenuOpen(true)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              aria-label="Open navigation menu"
            >
              <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Centered greeting */}
            <h1 className="text-2xl font-display text-primary-600 text-center flex-1">
              Planning & Goals
            </h1>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="text-sm text-neutral-500 hover:text-neutral-700 underline focus:outline-none"
            >
              Sign Out
            </button>
          </div>

          {/* Subtitle */}
          <p className="text-sm text-neutral-600 text-center">
            Set intentions and track your progress
          </p>
        </div>

        {/* Main Content Area */}
        <div className="space-y-4">
          {/* Placeholder for future content */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <p className="text-neutral-500 text-center">Planning features coming soon...</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-neutral-500">
            Plan your path, celebrate your progress
          </p>
        </div>
      </div>

      {/* Navigation menu */}
      <NavigationMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </main>
  )
}