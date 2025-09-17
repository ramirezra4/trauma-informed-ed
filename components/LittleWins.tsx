'use client'

import { useState } from 'react'

interface LittleWin {
  category: 'academic' | 'self_care' | 'social' | 'personal' | 'other'
  description: string
}

interface LittleWinsProps {
  onSave: (win: LittleWin) => void
  onComplete: () => void
  isSaving?: boolean
}

const winCategories = {
  academic: {
    emoji: '📚',
    label: 'Academic',
    examples: ['Read 5 pages', 'Finished an assignment', 'Organized notes', 'Asked a question in class']
  },
  self_care: {
    emoji: '🌱',
    label: 'Self Care',
    examples: ['Took a shower', 'Went for a walk', 'Ate a healthy meal', 'Got enough sleep']
  },
  social: {
    emoji: '💬',
    label: 'Social',
    examples: ['Called a friend', 'Attended study group', 'Asked for help', 'Checked in with family']
  },
  personal: {
    emoji: '✨',
    label: 'Personal',
    examples: ['Cleaned my room', 'Did laundry', 'Paid a bill', 'Planned my week']
  },
  other: {
    emoji: '🎯',
    label: 'Other',
    examples: ['Something else I\'m proud of']
  }
}

export default function LittleWins({ onSave, onComplete, isSaving = false }: LittleWinsProps) {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof winCategories | null>(null)
  const [customDescription, setCustomDescription] = useState('')
  const [savedWins, setSavedWins] = useState<LittleWin[]>([])

  const handleQuickWin = (category: keyof typeof winCategories, description: string) => {
    const win = { category, description }
    onSave(win)
    setSavedWins(prev => [...prev, win])
    setSelectedCategory(null)
  }

  const handleCustomWin = () => {
    if (selectedCategory && customDescription.trim()) {
      const win = { 
        category: selectedCategory, 
        description: customDescription.trim() 
      }
      onSave(win)
      setSavedWins(prev => [...prev, win])
      setSelectedCategory(null)
      setCustomDescription('')
    }
  }

  const totalWins = savedWins.length

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-display text-primary-600 mb-2">
          Let's celebrate your progress
        </h2>
        <p className="text-sm text-neutral-600">
          Every small step forward matters
        </p>
      </div>

      {/* Show saved wins */}
      {savedWins.length > 0 && (
        <div className="bg-success-50 border border-success-200 rounded-lg p-4">
          <h3 className="font-medium text-success-800 mb-2 flex items-center gap-2">
            🎉 Your wins today:
          </h3>
          <ul className="space-y-1">
            {savedWins.map((win, index) => (
              <li key={index} className="text-sm text-success-700 flex items-center gap-2">
                <span>{winCategories[win.category].emoji}</span>
                <span>{win.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Category selection */}
      {!selectedCategory ? (
        <div className="space-y-4">
          <p className="text-sm font-medium text-neutral-700 text-center">
            What kind of win would you like to celebrate?
          </p>
          
          <div className="grid grid-cols-1 gap-3">
            {Object.entries(winCategories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key as keyof typeof winCategories)}
                className="
                  p-4 border-2 border-neutral-200 rounded-lg text-left
                  hover:border-primary-300 hover:bg-primary-50
                  focus:outline-none focus:ring-2 focus:ring-primary-500
                  transition-all
                "
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">{category.emoji}</span>
                  <span className="font-medium text-neutral-800">{category.label}</span>
                </div>
                <div className="text-xs text-neutral-500 ml-8">
                  {category.examples.slice(0, 2).join(' • ')}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Quick options for selected category */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-neutral-800 flex items-center gap-2">
              <span>{winCategories[selectedCategory].emoji}</span>
              {winCategories[selectedCategory].label}
            </h3>
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-sm text-neutral-500 hover:text-neutral-700"
            >
              ← Back
            </button>
          </div>

          {/* Quick select options */}
          <div className="space-y-2">
            <p className="text-sm text-neutral-600">Choose one or write your own:</p>
            
            {winCategories[selectedCategory].examples.map((example, index) => (
              <button
                key={index}
                onClick={() => handleQuickWin(selectedCategory, example)}
                disabled={isSaving}
                className="
                  w-full p-3 text-left border border-neutral-200 rounded-lg
                  hover:border-primary-300 hover:bg-primary-50
                  focus:outline-none focus:ring-2 focus:ring-primary-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all
                "
              >
                <span className="text-sm text-neutral-700">{example}</span>
              </button>
            ))}
          </div>

          {/* Custom input */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-neutral-700">
              Or describe your own win:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="What did you accomplish?"
                className="
                  flex-1 px-3 py-2 border border-neutral-200 rounded-md
                  focus:outline-none focus:ring-2 focus:ring-primary-500
                  placeholder-neutral-400 text-sm
                "
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customDescription.trim()) {
                    handleCustomWin()
                  }
                }}
              />
              <button
                onClick={handleCustomWin}
                disabled={!customDescription.trim() || isSaving}
                className="
                  px-4 py-2 bg-primary-500 text-white rounded-md font-medium
                  hover:bg-primary-600 disabled:bg-neutral-300 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-2 focus:ring-primary-500
                  transition-colors
                "
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete button */}
      {totalWins > 0 && (
        <div className="pt-4 border-t border-neutral-200">
          <button
            onClick={onComplete}
            className="
              w-full py-3 px-4 bg-primary-500 text-white rounded-lg font-medium
              hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500
              transition-colors
            "
          >
            Continue to see my progress
          </button>
          
          <p className="text-xs text-neutral-500 text-center mt-2">
            You can always add more wins later
          </p>
        </div>
      )}

      {/* Skip option */}
      <div className="text-center">
        <button
          onClick={onComplete}
          className="
            text-sm text-neutral-500 hover:text-neutral-700
            focus:outline-none focus:underline
            transition-colors
          "
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}