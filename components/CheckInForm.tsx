'use client'

import { useState } from 'react'

interface CheckInData {
  mood: number
  energy: number
  focus: number
  notes?: string
}

interface CheckInFormProps {
  onSubmit: (data: CheckInData) => void
  isSubmitting?: boolean
  initialValues?: Partial<CheckInData>  // Accept initial values
}

const scaleLabels = {
  1: { emoji: '😰', label: 'Very Low' },
  2: { emoji: '😔', label: 'Low' },
  3: { emoji: '😐', label: 'Okay' },
  4: { emoji: '😊', label: 'Good' },
  5: { emoji: '✨', label: 'Great' },
}

function ScaleInput({ 
  label, 
  value, 
  onChange, 
  name 
}: { 
  label: string
  value: number
  onChange: (value: number) => void
  name: string
}) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-neutral-700">
        {label}
      </label>
      <div className="flex justify-between items-center gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={`
              flex flex-col items-center p-3 rounded-lg border-2 transition-all
              hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500
              ${value === rating 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-neutral-200 bg-white hover:bg-neutral-50'
              }
            `}
            aria-label={`${label}: ${scaleLabels[rating as keyof typeof scaleLabels].label}`}
          >
            <span className="text-2xl mb-1">
              {scaleLabels[rating as keyof typeof scaleLabels].emoji}
            </span>
            <span className="text-xs text-neutral-600 text-center">
              {scaleLabels[rating as keyof typeof scaleLabels].label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function CheckInForm({ onSubmit, isSubmitting = false, initialValues }: CheckInFormProps) {
  const [formData, setFormData] = useState<CheckInData>({
    mood: initialValues?.mood ?? 3,
    energy: initialValues?.energy ?? 3,
    focus: initialValues?.focus ?? 3,
    notes: initialValues?.notes ?? ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const isComplete = formData.mood > 0 && formData.energy > 0 && formData.focus > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-display text-primary-600 mb-2">
          How are you feeling right now?
        </h2>
        <p className="text-sm text-neutral-600">
          Take a moment to check in with yourself
        </p>
      </div>

      <ScaleInput
        label="Mood"
        name="mood"
        value={formData.mood}
        onChange={(value) => setFormData(prev => ({ ...prev, mood: value }))}
      />

      <ScaleInput
        label="Energy"
        name="energy"
        value={formData.energy}
        onChange={(value) => setFormData(prev => ({ ...prev, energy: value }))}
      />

      <ScaleInput
        label="Focus"
        name="focus"
        value={formData.focus}
        onChange={(value) => setFormData(prev => ({ ...prev, focus: value }))}
      />

      <div className="space-y-3">
        <label 
          htmlFor="notes" 
          className="block text-sm font-medium text-neutral-700"
        >
          Anything you'd like to share? 
          <span className="text-neutral-500 font-normal ml-1">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="How are you feeling about today? Any specific concerns or hopes?"
          className="
            w-full px-3 py-2 border border-neutral-200 rounded-md
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            placeholder-neutral-400 text-sm
          "
        />
        <p className="text-xs text-neutral-500">
          This is completely optional and only you will see it
        </p>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={!isComplete || isSubmitting}
          className="
            w-full py-3 px-4 rounded-lg font-medium text-white
            bg-primary-500 hover:bg-primary-600 
            disabled:bg-neutral-300 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
            transition-colors
          "
        >
          {isSubmitting ? 'Saving...' : 'Continue'}
        </button>
        
        <p className="text-xs text-neutral-500 text-center mt-2">
          This takes about 30 seconds
        </p>
      </div>
    </form>
  )
}