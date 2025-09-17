'use client'

import { useState } from 'react'

interface Suggestion {
  id: string
  label: string
  why: string
  est_min: number
  type: 'focus' | 'self_care' | 'micro_step'
}

interface SuggestionsResponse {
  suggestions: Suggestion[]
  not_now: {
    message: string
    alternative: string
  }
  context: {
    greeting: string
    encouragement: string
  }
}

interface SuggestionsDisplayProps {
  suggestions: SuggestionsResponse
  onSelectSuggestion: (suggestion: Suggestion) => void
  onNotNow: () => void
  isLoading?: boolean
}

const typeIcons = {
  focus: '🎯',
  self_care: '🌱',
  micro_step: '✨'
}

const typeColors = {
  focus: 'border-primary-200 bg-primary-50',
  self_care: 'border-secondary-200 bg-secondary-50',
  micro_step: 'border-neutral-200 bg-neutral-50'
}

export default function SuggestionsDisplay({
  suggestions,
  onSelectSuggestion,
  onNotNow,
  isLoading = false
}: SuggestionsDisplayProps) {
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-neutral-200 rounded w-3/4 mx-auto"></div>
        <div className="h-4 bg-neutral-200 rounded w-1/2 mx-auto"></div>
        <div className="space-y-3">
          <div className="h-20 bg-neutral-200 rounded"></div>
          <div className="h-20 bg-neutral-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="text-center">
        <h2 className="text-xl font-display text-primary-600 mb-2">
          {suggestions.context.greeting}
        </h2>
        <p className="text-sm text-neutral-600">
          {suggestions.context.encouragement}
        </p>
      </div>

      {/* Suggestions */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-neutral-700 text-center">
          Here are some gentle suggestions:
        </p>
        
        {suggestions.suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => {
              setSelectedSuggestion(suggestion.id)
              onSelectSuggestion(suggestion)
            }}
            disabled={selectedSuggestion !== null}
            className={`
              w-full p-4 rounded-lg border-2 text-left transition-all
              hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500
              ${selectedSuggestion === suggestion.id 
                ? 'border-primary-500 bg-primary-100' 
                : selectedSuggestion 
                  ? 'border-neutral-200 bg-neutral-50 opacity-50' 
                  : `${typeColors[suggestion.type]} hover:border-primary-300`
              }
              disabled:cursor-not-allowed
            `}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0 mt-1">
                {typeIcons[suggestion.type]}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-neutral-800 mb-1">
                  {suggestion.label}
                </h3>
                <p className="text-sm text-neutral-600 mb-2">
                  {suggestion.why}
                </p>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <span>~{suggestion.est_min} min</span>
                  <span>•</span>
                  <span className="capitalize">{suggestion.type.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
            
            {selectedSuggestion === suggestion.id && (
              <div className="mt-3 pt-3 border-t border-primary-200">
                <p className="text-sm text-primary-700 font-medium">
                  ✓ Selected - Let's do this together
                </p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Not Now Option */}
      <div className="pt-4 border-t border-neutral-200">
        <button
          onClick={onNotNow}
          disabled={selectedSuggestion !== null}
          className="
            w-full p-3 rounded-lg border border-neutral-300 bg-white
            hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-500
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
        >
          <p className="text-sm text-neutral-600 mb-1">
            {suggestions.not_now.message}
          </p>
          <p className="text-xs text-neutral-500">
            {suggestions.not_now.alternative}
          </p>
        </button>
      </div>

      {selectedSuggestion && (
        <div className="text-center">
          <p className="text-xs text-neutral-500">
            Great choice! Let's start when you're ready.
          </p>
        </div>
      )}
    </div>
  )
}