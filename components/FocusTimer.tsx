'use client'

import { useState, useEffect, useRef } from 'react'

interface FocusTimerProps {
  initialMinutes?: number
  onComplete: () => void
  onSkip: () => void
  taskLabel?: string
}

export default function FocusTimer({ 
  initialMinutes = 15, 
  onComplete, 
  onSkip,
  taskLabel 
}: FocusTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60) // Convert to seconds
  const [isRunning, setIsRunning] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false)
            setIsCompleted(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  useEffect(() => {
    if (isCompleted) {
      onComplete()
    }
  }, [isCompleted, onComplete])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const startTimer = () => {
    setIsRunning(true)
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(initialMinutes * 60)
    setIsCompleted(false)
  }

  const progress = ((initialMinutes * 60 - timeLeft) / (initialMinutes * 60)) * 100

  if (isCompleted) {
    return (
      <div className="text-center space-y-4">
        <div className="text-6xl">🎉</div>
        <h3 className="text-xl font-display text-primary-600">
          Wonderful work!
        </h3>
        <p className="text-neutral-600">
          You completed your {initialMinutes}-minute focus session.
        </p>
        {taskLabel && (
          <p className="text-sm text-neutral-500 italic">
            "{taskLabel}"
          </p>
        )}
        <button
          onClick={onComplete}
          className="
            px-6 py-3 bg-primary-500 text-white rounded-lg font-medium
            hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500
            transition-colors
          "
        >
          Continue to log your win
        </button>
      </div>
    )
  }

  return (
    <div className="text-center space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-display text-primary-600">
          Focus Time
        </h3>
        {taskLabel && (
          <p className="text-sm text-neutral-600">
            {taskLabel}
          </p>
        )}
        <p className="text-xs text-neutral-500">
          Work at your own pace. This is just a gentle structure.
        </p>
      </div>

      {/* Timer Display */}
      <div className="relative w-32 h-32 mx-auto">
        {/* Progress Ring */}
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="52"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="60"
            cy="60"
            r="52"
            stroke="#dc8850"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 52}`}
            strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        
        {/* Time Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-mono font-bold text-primary-600">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        {!isRunning ? (
          <button
            onClick={startTimer}
            className="
              px-6 py-3 bg-primary-500 text-white rounded-lg font-medium
              hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500
              transition-colors
            "
          >
            {timeLeft === initialMinutes * 60 ? 'Start' : 'Resume'}
          </button>
        ) : (
          <button
            onClick={pauseTimer}
            className="
              px-6 py-3 bg-secondary-500 text-white rounded-lg font-medium
              hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-secondary-500
              transition-colors
            "
          >
            Pause
          </button>
        )}

        <button
          onClick={resetTimer}
          className="
            px-4 py-3 border border-neutral-300 text-neutral-700 rounded-lg font-medium
            hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-500
            transition-colors
          "
        >
          Reset
        </button>
      </div>

      {/* Gentle Exit */}
      <div className="pt-4 border-t border-neutral-200">
        <p className="text-sm text-neutral-600 mb-3">
          Not feeling focused right now? That's completely okay.
        </p>
        <button
          onClick={onSkip}
          className="
            text-sm text-neutral-500 hover:text-neutral-700
            focus:outline-none focus:underline
            transition-colors
          "
        >
          Skip to celebrating what you've already done
        </button>
      </div>
    </div>
  )
}