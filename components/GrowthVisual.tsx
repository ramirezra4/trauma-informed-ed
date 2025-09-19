'use client'

import { useState } from 'react'

interface GrowthStats {
  checkins: number
  completed: number
  wins: number
  streak: number
}

interface GrowthVisualProps {
  stats?: GrowthStats
  loading?: boolean
  onAddWin?: () => void  // Callback for adding a little win
}

export default function GrowthVisual({
  stats = { checkins: 0, completed: 0, wins: 0, streak: 0 },
  loading = false,
  onAddWin
}: GrowthVisualProps) {
  const [activeMetric, setActiveMetric] = useState<keyof GrowthStats>('checkins')

  const metrics = {
    checkins: {
      label: 'Check-ins',
      value: stats.checkins,
      color: 'primary',
      emoji: '🌱',
      description: 'Times you\'ve checked in with yourself'
    },
    completed: {
      label: 'Completed',
      value: stats.completed,
      color: 'secondary',
      emoji: '✅',
      description: 'Tasks and assignments finished'
    },
    wins: {
      label: 'Little Wins',
      value: stats.wins,
      color: 'success',
      emoji: '🎉',
      description: 'Small victories celebrated'
    },
    streak: {
      label: 'Current Streak',
      value: stats.streak,
      color: 'primary',
      emoji: '🔥',
      description: 'Days of consistent progress'
    }
  } as const

  const totalActions = stats.checkins + stats.completed + stats.wins
  const maxValue = Math.max(...Object.values(stats))

  const getColorClasses = (colorName: string, isActive: boolean) => {
    const colors = {
      primary: {
        bg: isActive ? 'bg-primary-500' : 'bg-primary-100',
        text: isActive ? 'text-white' : 'text-primary-600',
        border: 'border-primary-200',
        hover: 'hover:bg-primary-200'
      },
      secondary: {
        bg: isActive ? 'bg-secondary-500' : 'bg-secondary-100', 
        text: isActive ? 'text-white' : 'text-secondary-600',
        border: 'border-secondary-200',
        hover: 'hover:bg-secondary-200'
      },
      success: {
        bg: isActive ? 'bg-success-500' : 'bg-success-100',
        text: isActive ? 'text-white' : 'text-success-600', 
        border: 'border-success-200',
        hover: 'hover:bg-success-200'
      }
    }
    return colors[colorName as keyof typeof colors] || colors.primary
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-display text-neutral-800">Your Growth</h2>
            <div className="w-20 h-8 bg-neutral-100 rounded-lg animate-pulse"></div>
          </div>
          <div className="text-xs text-neutral-500 mb-3">This month</div>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto mb-2"></div>
            <p className="text-sm text-neutral-600">Loading your progress...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-display text-neutral-800">
            Your Growth
          </h2>
          {/* Add Little Win button */}
          {onAddWin && (
            <button
              onClick={onAddWin}
              className="
                flex items-center gap-1 px-3 py-1.5
                bg-success-50 hover:bg-success-100
                border border-success-200 rounded-lg
                text-success-600 text-sm font-medium
                transition-colors focus:outline-none
                focus:ring-2 focus:ring-success-500 focus:ring-offset-1
              "
              aria-label="Add a little win"
            >
              <span className="text-base">✨</span>
              <span>Add Win</span>
            </button>
          )}
        </div>
        {/* Time frame indicator moved below */}
        <div className="text-xs text-neutral-500 mb-3">
          This month
        </div>

        {/* Active metric display */}
        <div className="text-center py-2">
          <div className="text-3xl mb-1">
            {metrics[activeMetric].emoji}
          </div>
          <div className="text-2xl font-bold text-neutral-800">
            {metrics[activeMetric].value}
          </div>
          <div className="text-sm text-neutral-600">
            {metrics[activeMetric].label}
          </div>
        </div>
      </div>

      {/* Interactive metric buttons */}
      <div className="grid grid-cols-4 gap-1 p-2 bg-neutral-50">
        {Object.entries(metrics).map(([key, metric]) => {
          const isActive = activeMetric === key
          const colorClasses = getColorClasses(metric.color, isActive)
          const heightPercentage = maxValue > 0 ? (metric.value / maxValue) * 100 : 0

          return (
            <button
              key={key}
              onClick={() => setActiveMetric(key as keyof GrowthStats)}
              className={`
                relative p-1.5 rounded-lg border transition-all
                focus:outline-none focus:ring-2 focus:ring-primary-500
                ${colorClasses.bg} ${colorClasses.text} ${colorClasses.border}
                ${!isActive ? colorClasses.hover : ''}
              `}
            >
              {/* Visual bar */}
              <div className="mb-1">
                <div className="h-4 bg-black/10 rounded-sm overflow-hidden">
                  <div
                    className="bg-current rounded-sm transition-all duration-500"
                    style={{
                      height: `${Math.max(heightPercentage, 10)}%`,
                      opacity: isActive ? 1 : 0.7
                    }}
                  />
                </div>
              </div>

              {/* Value */}
              <div className={`text-sm font-bold ${colorClasses.text}`}>
                {metric.value}
              </div>

              {/* Label */}
              <div className={`text-xs leading-tight ${colorClasses.text}`}>
                {metric.label}
              </div>
            </button>
          )
        })}
      </div>

      {/* Growth message */}
      <div className="p-3 bg-neutral-50 border-t border-neutral-200">
        {totalActions === 0 ? (
          <p className="text-xs text-neutral-600 text-center">
            Your growth journey starts here
          </p>
        ) : totalActions < 10 ? (
          <p className="text-xs text-neutral-600 text-center">
            <span className="text-primary-600 font-medium">Building momentum</span> — 
            you're creating positive habits
          </p>
        ) : totalActions < 30 ? (
          <p className="text-xs text-neutral-600 text-center">
            <span className="text-primary-600 font-medium">Great progress!</span> — 
            consistency is key to growth
          </p>
        ) : (
          <p className="text-xs text-neutral-600 text-center">
            <span className="text-primary-600 font-medium">Amazing dedication!</span> — 
            you're truly investing in yourself
          </p>
        )}
      </div>
    </div>
  )
}