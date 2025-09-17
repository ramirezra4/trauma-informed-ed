'use client'

import { useState, useEffect } from 'react'

const inspiringQuotes = [
  {
    text: "Progress is not about perfection, it's about direction.",
    author: "Anonymous"
  },
  {
    text: "Small steps in the right direction can turn out to be the biggest step of your life.",
    author: "Naeem Callaway"
  },
  {
    text: "You are braver than you believe, stronger than you seem, and smarter than you think.",
    author: "A.A. Milne"
  },
  {
    text: "The only way to make sense out of change is to plunge into it, move with it, and join the dance.",
    author: "Alan Watts"
  },
  {
    text: "Be patient with yourself. Nothing in nature blooms all year.",
    author: "Anonymous"
  },
  {
    text: "Your current situation is not your final destination. The best is yet to come.",
    author: "Anonymous"
  },
  {
    text: "Growth begins at the end of your comfort zone.",
    author: "Neale Donald Walsch"
  }
]

export default function SmartSuggestionBox() {
  const [currentQuote, setCurrentQuote] = useState(inspiringQuotes[0])
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Rotate quote daily based on date
    const today = new Date()
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 
      (1000 * 60 * 60 * 24)
    )
    const quoteIndex = dayOfYear % inspiringQuotes.length
    setCurrentQuote(inspiringQuotes[quoteIndex])
  }, [])

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="
          w-full p-2 text-xs text-neutral-500 hover:text-neutral-700
          border border-dashed border-neutral-200 rounded-lg
          hover:border-neutral-300 transition-colors
        "
      >
        Show daily inspiration
      </button>
    )
  }

  return (
    <div className="
      relative bg-gradient-to-br from-primary-50 to-secondary-50 
      rounded-lg p-4 border border-primary-100
    ">
      {/* Close button */}
      <button
        onClick={() => setIsVisible(false)}
        className="
          absolute top-2 right-2 w-6 h-6 
          text-neutral-400 hover:text-neutral-600
          focus:outline-none focus:ring-1 focus:ring-primary-500 rounded
          transition-colors
        "
        aria-label="Hide suggestion box"
      >
        ×
      </button>

      <div className="pr-6">
        {/* Quote */}
        <blockquote className="text-sm text-neutral-700 mb-3 leading-relaxed">
          "{currentQuote.text}"
        </blockquote>

        {/* Author */}
        <cite className="text-xs text-neutral-500 not-italic">
          — {currentQuote.author}
        </cite>

        {/* Subtle indicator this will be smart suggestions later */}
        <div className="mt-3 pt-3 border-t border-primary-100">
          <p className="text-xs text-neutral-400 italic">
            Daily inspiration • Smart suggestions coming soon
          </p>
        </div>
      </div>
    </div>
  )
}