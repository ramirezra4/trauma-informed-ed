'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/typed-supabase'
import CheckInForm from '@/components/CheckInForm'
import SuggestionsDisplay from '@/components/SuggestionsDisplay'
import FocusTimer from '@/components/FocusTimer'
import LittleWins from '@/components/LittleWins'
import ProgressCard from '@/components/ProgressCard'
import PageHeader from '@/components/PageHeader'

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

export default function CheckInFlow() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [currentStep, setCurrentStep] = useState<FlowStep>('checkin')
  const [checkinData, setCheckinData] = useState<CheckInData | null>(null)
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null)
  const [suggestions, setSuggestions] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  // Mock progress stats (would come from Supabase in real app)
  const mockStats = {
    checkins: 12,
    completed: 8,
    wins: 15
  }

  const handleCheckinSubmit = async (data: CheckInData) => {
    if (!user) return

    setIsLoading(true)
    setCheckinData(data)  // Store the check-in data in state

    try {
      // Call AI suggestions API (without saving to database yet)
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
      alert('There was an error processing your check-in. Please try again.')
      setCurrentStep('checkin')
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
    if (!user) return
    
    try {
      const savedWin = await db.littleWins.create(user.id, {
        category: win.category,
        description: win.description
      })

      if (!savedWin) {
        throw new Error('Failed to save little win')
      }
      console.log('Little win saved:', win)
    } catch (error) {
      console.error('Error saving little win:', error)
      alert('There was an error saving your little win.')
    }
  }

  const handleFlowComplete = async () => {
    // Save the check-in to database when flow is complete
    if (!user || !checkinData) return

    try {
      const checkin = await db.checkins.create(user.id, {
        mood: checkinData.mood,
        energy: checkinData.energy,
        focus: checkinData.focus,
        notes: checkinData.notes || null
      })

      if (!checkin) {
        throw new Error('Failed to save checkin')
      }

      console.log('Check-in saved successfully:', checkin)
    } catch (error) {
      console.error('Error saving check-in:', error)
      // We don't show an alert here since the user is at the end of the flow
      // The check-in experience was still valuable even if save failed
    }

    setCurrentStep('complete')
  }

  const handleBackToHome = () => {
    router.push('/')
  }

  const handleGoBack = () => {
    // Navigate back through the flow steps
    switch (currentStep) {
      case 'suggestions':
        // Clear suggestions when going back to checkin so they regenerate
        setSuggestions(null)
        setSelectedSuggestion(null)
        setCurrentStep('checkin')
        break
      case 'timer':
        setCurrentStep('suggestions')
        break
      case 'wins':
        // If they came from timer, go back to timer; otherwise to suggestions
        if (selectedSuggestion?.type === 'focus') {
          setCurrentStep('timer')
        } else {
          setCurrentStep('suggestions')
        }
        break
      case 'complete':
        setCurrentStep('wins')
        break
      default:
        router.push('/')
    }
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
    <main className="min-h-screen bg-gradient-to-br from-background to-neutral-50 px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* Navigation Header */}
        <PageHeader
          showBack={true}
          backPath={currentStep === 'checkin' ? '/' : undefined}
          onBack={currentStep !== 'checkin' ? handleGoBack : undefined}
          backLabel={currentStep === 'checkin' ? 'Home' : 'Back'}
        />

        {/* Page Header */}
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
              initialValues={checkinData || undefined}  // Pass previous values if they exist
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
            <div className="text-center space-y-4">
              <div className="text-4xl">🌟</div>
              <h2 className="text-xl font-display text-primary-600">
                Wonderful work!
              </h2>
              <p className="text-neutral-600">
                You've completed your check-in flow. You're building meaningful momentum.
              </p>
              <button
                onClick={handleBackToHome}
                className="
                  px-6 py-3 bg-primary-500 text-white rounded-lg font-medium
                  hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500
                  transition-colors
                "
              >
                Return to home
              </button>
            </div>
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