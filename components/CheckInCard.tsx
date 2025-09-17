'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getLastCheckinTime } from '@/lib/supabase'

interface CheckInCardProps {
  onStartFullFlow: () => void
  onQuickCheckin?: (data: { mood: number; energy: number; focus: number }) => void
}

const quickScaleEmojis = {
  1: '😰',
  2: '😔', 
  3: '😐',
  4: '😊',
  5: '✨'
}

export default function CheckInCard({ onStartFullFlow, onQuickCheckin }: CheckInCardProps) {
  const { user } = useAuth()
  const [showQuickCheckin, setShowQuickCheckin] = useState(false)
  const [quickData, setQuickData] = useState({ mood: 3, energy: 3, focus: 3 })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastCheckinTime, setLastCheckinTime] = useState<string | null>(null)

  // Load last check-in time
  useEffect(() => {
    const loadLastCheckin = async () => {
      if (user) {
        const lastTime = await getLastCheckinTime(user.id)
        setLastCheckinTime(lastTime)
      }
    }
    loadLastCheckin()
  }, [user])

  const handleQuickSubmit = async () => {
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call
    onQuickCheckin?.(quickData)
    setShowQuickCheckin(false)
    setIsSubmitting(false)
    setQuickData({ mood: 3, energy: 3, focus: 3 }) // Reset
    
    // Refresh last check-in time after submission
    if (user) {
      const lastTime = await getLastCheckinTime(user.id)
      setLastCheckinTime(lastTime)
    }
  }


  const getLastCheckinMessage = () => {
    if (!lastCheckinTime) return "Welcome! Ready for your first check-in?"
    
    const now = new Date()
    const checkinTime = new Date(lastCheckinTime)
    const diffMs = now.getTime() - checkinTime.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    
    if (diffMinutes < 60) {
      if (diffMinutes < 1) return "You just checked in"
      return `Last check-in: ${diffMinutes}m ago`
    }
    
    if (diffHours < 24) {
      return `Last check-in: ${diffHours}h ago`
    }
    
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return "Last check-in: yesterday"
    return `Last check-in: ${diffDays} days ago`
  }

  if (showQuickCheckin) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-display text-primary-600 mb-1">
            Quick Check-in
          </h3>
          <p className="text-sm text-neutral-600">
            How are you feeling right now?
          </p>
        </div>

        <div className="space-y-4">
          {['mood', 'energy', 'focus'].map((metric) => (
            <div key={metric} className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700 capitalize">
                {metric}
              </label>
              <div className="flex justify-between items-center">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setQuickData(prev => ({ ...prev, [metric]: value }))}
                    className={`
                      w-10 h-10 rounded-full border-2 transition-all text-lg
                      focus:outline-none focus:ring-2 focus:ring-primary-500
                      ${quickData[metric as keyof typeof quickData] === value
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-neutral-200 hover:border-primary-300'
                      }
                    `}
                  >
                    {quickScaleEmojis[value as keyof typeof quickScaleEmojis]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={() => setShowQuickCheckin(false)}
            className="
              flex-1 py-2 px-4 border border-neutral-300 text-neutral-700 rounded-lg
              hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-500
              transition-colors text-sm
            "
          >
            Cancel
          </button>
          <button
            onClick={handleQuickSubmit}
            disabled={isSubmitting}
            className="
              flex-1 py-2 px-4 bg-primary-500 text-white rounded-lg font-medium
              hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors text-sm
            "
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-3 bg-gradient-to-r from-primary-50 to-secondary-50">
        <h2 className="text-lg font-display text-primary-600 mb-1">
          Check-in
        </h2>
        <p className="text-sm text-neutral-600">
          Ready for a gentle check-in?
        </p>
        <p className="text-xs text-neutral-500 mt-2">
          {getLastCheckinMessage()}
        </p>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-4">
          <p className="text-sm text-neutral-700 leading-relaxed mb-3">
            Taking a moment to check in with yourself can help you understand your needs and build momentum for the day.
          </p>
          
          {/* Benefits preview */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center p-2 bg-neutral-50 rounded-md">
              <div className="text-sm">🎯</div>
              <div className="text-xs text-neutral-600 mt-1">Get suggestions</div>
            </div>
            <div className="text-center p-2 bg-neutral-50 rounded-md">
              <div className="text-sm">⏰</div>
              <div className="text-xs text-neutral-600 mt-1">Focus time</div>
            </div>
            <div className="text-center p-2 bg-neutral-50 rounded-md">
              <div className="text-sm">🎉</div>
              <div className="text-xs text-neutral-600 mt-1">Celebrate wins</div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          <button
            onClick={onStartFullFlow}
            className="
              w-full py-3 px-4 bg-primary-500 text-white rounded-lg font-medium
              hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500
              transition-colors
            "
          >
            Start Full Check-in Flow
          </button>
          
          <button
            onClick={() => setShowQuickCheckin(true)}
            className="
              w-full py-2 px-4 border border-neutral-300 text-neutral-700 rounded-lg
              hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-500
              transition-colors text-sm
            "
          >
            Quick 30-second check-in
          </button>
        </div>

        {/* Gentle reminder */}
        <div className="mt-3 pt-3 border-t border-neutral-200">
          <p className="text-xs text-neutral-500 text-center">
            No pressure — you can check in whenever feels right
          </p>
        </div>
      </div>
    </div>
  )
}