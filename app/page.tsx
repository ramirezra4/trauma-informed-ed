'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getProgressStats, saveCheckin } from '@/lib/supabase'
import SmartSuggestionBox from '@/components/SmartSuggestionBox'
import GrowthVisual from '@/components/GrowthVisual'
import CheckInCard from '@/components/CheckInCard'

interface LittleWin {
  category: 'academic' | 'self_care' | 'social' | 'personal' | 'other'
  description: string
}

export default function Home() {
  const router = useRouter()
  const { user, loading, signOut } = useAuth()
  const [stats, setStats] = useState({
    checkins: 0,
    completed: 0,
    wins: 0,
    streak: 0
  })
  const [statsLoading, setStatsLoading] = useState(true)

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  // Load user's real stats
  useEffect(() => {
    if (user) {
      loadUserStats()
    }
  }, [user])

  const loadUserStats = async () => {
    if (!user) return
    
    try {
      setStatsLoading(true)
      const userStats = await getProgressStats(user.id)
      setStats({
        checkins: userStats.checkins,
        completed: userStats.completed,
        wins: userStats.wins,
        streak: 0 // We'll implement streak calculation later
      })
    } catch (error) {
      console.error('Error loading stats:', error)
      // Keep default zeros on error
    } finally {
      setStatsLoading(false)
    }
  }

  const handleStartFullFlow = () => {
    router.push('/checkin')
  }

  const handleQuickCheckin = async (data: { mood: number; energy: number; focus: number }) => {
    if (!user) return
    
    try {
      // Save check-in to Supabase
      await saveCheckin(user.id, {
        mood: data.mood,
        energy: data.energy,
        focus: data.focus,
        notes: 'Quick check-in'
      })
      
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
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 relative">
          <h1 className="text-2xl font-display text-primary-600 mb-1">
            {getGreeting()}{getUserName() ? `, ${getUserName()}` : ''}
          </h1>
          <p className="text-sm text-neutral-600">
            Welcome to your support space
          </p>
          
          {/* Sign Out Button */}
          <button 
            onClick={handleSignOut}
            className="absolute top-0 right-0 text-sm text-neutral-500 hover:text-neutral-700 underline focus:outline-none"
          >
            Sign Out
          </button>
        </div>

        {/* Main Dashboard Grid */}
        <div className="space-y-4">
          {/* Smart Suggestion Box - Full width, unobtrusive */}
          <div>
            <SmartSuggestionBox />
          </div>

          {/* Two Column Layout for Growth Visual and Check-in Card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Growth Visual */}
            <div>
              <GrowthVisual stats={stats} loading={statsLoading} />
            </div>

            {/* Check-in Card */}
            <div>
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
    </main>
  )
}