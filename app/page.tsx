'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SmartSuggestionBox from '@/components/SmartSuggestionBox'
import GrowthVisual from '@/components/GrowthVisual'
import CheckInCard from '@/components/CheckInCard'

interface LittleWin {
  category: 'academic' | 'self_care' | 'social' | 'personal' | 'other'
  description: string
}

export default function Home() {
  const router = useRouter()
  
  // Mock progress stats (would come from Supabase in real app)
  const mockStats = {
    checkins: 12,
    completed: 8,
    wins: 15,
    streak: 5
  }

  const handleStartFullFlow = () => {
    router.push('/checkin')
  }

  const handleQuickCheckin = async (data: { mood: number; energy: number; focus: number }) => {
    // In real app, save to Supabase
    console.log('Quick check-in:', data)
    // Could show a toast or brief confirmation
    
    // Optionally update mock stats to reflect the check-in
    // This would trigger a re-render of the GrowthVisual
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getUserName = () => {
    // In real app, would come from auth/Supabase
    return null // Will show generic greeting
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-neutral-50 px-4 py-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-display text-primary-600 mb-1">
            {getGreeting()}{getUserName() ? `, ${getUserName()}` : ''}
          </h1>
          <p className="text-sm text-neutral-600">
            Welcome to your support space
          </p>
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
              <GrowthVisual stats={mockStats} />
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