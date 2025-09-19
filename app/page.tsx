'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/typed-supabase'
import { getProgressStats, getUserProfile } from '@/lib/supabase'
import SmartSuggestionBox from '@/components/SmartSuggestionBox'
import GrowthVisual from '@/components/GrowthVisual'
import CheckInCard from '@/components/CheckInCard'
import AssignmentCard from '@/components/AssignmentCard'
import NavigationMenu from '@/components/NavigationMenu'

interface LittleWin {
  category: 'academic' | 'self_care' | 'social' | 'personal' | 'other'
  description: string
}

export default function Home() {
  const router = useRouter()
  const { user, loading, signOut, needsProfileSetup } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [stats, setStats] = useState({
    checkins: 0,
    completed: 0,
    wins: 0,
    streak: 0
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)

  // Redirect to auth if not logged in, or profile setup if needed
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    } else if (!loading && user && needsProfileSetup) {
      router.push('/profile-setup')
    }
  }, [user, loading, needsProfileSetup, router])

  const loadUserData = useCallback(async () => {
    if (!user) return
    
    try {
      setStatsLoading(true)
      
      // Load both stats and profile in parallel
      const [userStats, profile] = await Promise.all([
        getProgressStats(user.id),
        getUserProfile(user.id).catch(() => null) // Don't fail if profile doesn't exist yet
      ])
      
      setStats({
        checkins: userStats.checkins,
        completed: userStats.completed,
        wins: userStats.wins,
        streak: 0 // We'll implement streak calculation later
      })
      
      setUserProfile(profile)
    } catch (error) {
      console.error('Error loading user data:', error)
      // Keep default zeros on error
    } finally {
      setStatsLoading(false)
    }
  }, [user])

  // Load user's real stats and profile
  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user, loadUserData])

  const loadUserStats = async () => {
    await loadUserData()
  }

  const handleStartFullFlow = () => {
    router.push('/checkin')
  }

  const handleViewAllAssignments = () => {
    router.push('/assignments')
  }

  const handleQuickCheckin = async (data: { mood: number; energy: number; focus: number }) => {
    if (!user) return
    
    try {
      // Save check-in to Supabase
      const checkin = await db.checkins.create(user.id, {
        mood: data.mood,
        energy: data.energy,
        focus: data.focus,
        notes: 'Quick check-in'
      })

      if (!checkin) {
        throw new Error('Failed to save checkin')
      }
      
      // Reload stats to reflect the new check-in
      await loadUserStats()
      
      // Show success feedback
      alert('Check-in saved! 🌱')
    } catch (error) {
      console.error('Error saving check-in:', error)
      alert('Sorry, there was an error saving your check-in. Please try again.')
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getUserName = () => {
    // Try to get name from profile first, then fall back to email
    if (userProfile?.display_name) {
      return userProfile.display_name
    }
    if (userProfile?.full_name) {
      return userProfile.full_name.split(' ')[0] // First name
    }
    return user?.email?.split('@')[0] || null
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth')
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
              {getGreeting()}{getUserName() ? `, ${getUserName()}` : ''}
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
            Welcome to your support space
          </p>
        </div>

        {/* Main Dashboard Grid */}
        <div className="space-y-4">
          {/* Smart Suggestion Box - Full width, unobtrusive */}
          <div>
            <SmartSuggestionBox />
          </div>

          {/* Optimized Layout - Assignment left, Growth/Check-in right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Assignment Card - Left side, tall for multiple items */}
            <div>
              <AssignmentCard onViewAll={handleViewAllAssignments} />
            </div>

            {/* Right Column - Growth Visual and Check-in stacked */}
            <div className="space-y-4">
              <GrowthVisual stats={stats} loading={statsLoading} />
              <CheckInCard
                onStartFullFlow={handleStartFullFlow}
                onQuickCheckin={handleQuickCheckin}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-neutral-500">
            Every small step forward is worth celebrating
          </p>
        </div>
      </div>

      {/* Navigation menu */}
      <NavigationMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </main>
  )
}