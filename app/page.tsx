'use client'

import { useState } from 'react'
import CheckInForm from '@/components/CheckInForm'
import SuggestionsDisplay from '@/components/SuggestionsDisplay'
import FocusTimer from '@/components/FocusTimer'
import LittleWins from '@/components/LittleWins'
import ProgressCard from '@/components/ProgressCard'

interface CheckInData {
  mood: number
  energy: number
  focus: number
  notes?: string
}

interface Suggestion {
  id: string
  label: string
  why: string
  est_min: number
  type: 'focus' | 'self_care' | 'micro_step'
}

interface LittleWin {
  category: 'academic' | 'self_care' | 'social' | 'personal' | 'other'
  description: string
}

type FlowStep = 'checkin' | 'suggestions' | 'timer' | 'wins' | 'complete'

export default function Home() {
  const [currentStep, setCurrentStep] = useState<FlowStep>('checkin')
  const [checkinData, setCheckinData] = useState<CheckInData | null>(null)
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null)
  const [suggestions, setSuggestions] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Mock progress stats (would come from Supabase in real app)
  const mockStats = {
    checkins: 12,
    completed: 8,
    wins: 15
  }

  const handleCheckinSubmit = async (data: CheckInData) => {
    setIsLoading(true)
    setCheckinData(data)

    try {
      // Call AI suggestions API
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error('Failed to get suggestions')
      
      const suggestionsData = await response.json()
      setSuggestions(suggestionsData)
      setCurrentStep('suggestions')
    } catch (error) {
      console.error('Error:', error)
      // Fallback to direct completion if API fails
      setCurrentStep('complete')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionSelect = (suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion)
    
    if (suggestion.type === 'focus') {
      setCurrentStep('timer')
    } else {
      // For self_care and micro_step, go directly to wins
      setCurrentStep('wins')
    }
  }

  const handleNotNow = () => {
    setCurrentStep('wins')
  }

  const handleTimerComplete = () => {
    setCurrentStep('wins')
  }

  const handleTimerSkip = () => {
    setCurrentStep('wins')
  }

  const handleWinSave = async (win: LittleWin) => {
    // In real app, save to Supabase
    console.log('Saving win:', win)
  }

  const handleFlowComplete = () => {
    setCurrentStep('complete')
  }

  const handleStartNew = () => {
    // Reset flow
    setCurrentStep('checkin')
    setCheckinData(null)
    setSelectedSuggestion(null)
    setSuggestions(null)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-neutral-50 px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display text-primary-600 mb-2">
            {getGreeting()}
          </h1>
          <p className="text-neutral-600 text-sm">
            {currentStep === 'checkin' && "Let's start with a gentle check-in"}
            {currentStep === 'suggestions' && "Here are some suggestions for you"}
            {currentStep === 'timer' && "Focus time - work at your own pace"}
            {currentStep === 'wins' && "Time to celebrate your progress"}
            {currentStep === 'complete' && "You're building something meaningful"}
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          {currentStep === 'checkin' && (
            <CheckInForm 
              onSubmit={handleCheckinSubmit}
              isSubmitting={isLoading}
            />
          )}

          {currentStep === 'suggestions' && suggestions && (
            <SuggestionsDisplay
              suggestions={suggestions}
              onSelectSuggestion={handleSuggestionSelect}
              onNotNow={handleNotNow}
              isLoading={isLoading}
            />
          )}

          {currentStep === 'timer' && selectedSuggestion && (
            <FocusTimer
              initialMinutes={selectedSuggestion.est_min}
              onComplete={handleTimerComplete}
              onSkip={handleTimerSkip}
              taskLabel={selectedSuggestion.label}
            />
          )}

          {currentStep === 'wins' && (
            <LittleWins
              onSave={handleWinSave}
              onComplete={handleFlowComplete}
            />
          )}

          {currentStep === 'complete' && (
            <ProgressCard
              stats={mockStats}
              onStartNew={handleStartNew}
            />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-neutral-500">
            Take your time. There's no pressure here.
          </p>
        </div>
      </div>
    </main>
  )
}