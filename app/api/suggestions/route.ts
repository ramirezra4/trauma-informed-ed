import { NextRequest, NextResponse } from 'next/server'

// Mock AI suggestions for development
// In production, this would call OpenAI API with trauma-informed prompts

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

// Trauma-informed suggestion templates
const suggestionTemplates = {
  low_mood_low_energy: [
    {
      id: 'gentle-start',
      label: 'Take 5 minutes to organize your space',
      why: 'Small actions can help you feel more in control',
      est_min: 5,
      type: 'micro_step' as const
    },
    {
      id: 'self-care',
      label: 'Try a brief breathing exercise',
      why: 'This can help ground you in the present moment',
      est_min: 3,
      type: 'self_care' as const
    }
  ],
  low_focus: [
    {
      id: 'micro-focus',
      label: 'Set a 10-minute timer for one small task',
      why: 'Short bursts can be easier when focus is challenging',
      est_min: 10,
      type: 'focus' as const
    },
    {
      id: 'break-first',
      label: 'Take a short walk, then try 15 minutes of work',
      why: 'Movement can help improve focus and energy',
      est_min: 20,
      type: 'self_care' as const
    }
  ],
  good_energy: [
    {
      id: 'momentum',
      label: 'Pick your most important task and work for 25 minutes',
      why: 'You have good energy right now - use it wisely',
      est_min: 25,
      type: 'focus' as const
    },
    {
      id: 'prep-tomorrow',
      label: 'Spend 10 minutes planning tomorrow',
      why: 'Set yourself up for success when energy is available',
      est_min: 10,
      type: 'micro_step' as const
    }
  ],
  balanced: [
    {
      id: 'focused-work',
      label: 'Work on your top priority for 20 minutes',
      why: 'You seem centered - a good time for focused work',
      est_min: 20,
      type: 'focus' as const
    },
    {
      id: 'maintain-momentum',
      label: 'Complete one small task to build momentum',
      why: 'Small wins can carry you through the day',
      est_min: 15,
      type: 'micro_step' as const
    }
  ]
}

function selectSuggestions(checkin: CheckInData): Suggestion[] {
  const { mood, energy, focus } = checkin
  const avgScore = (mood + energy + focus) / 3

  // Crisis detection (though this would be more sophisticated in production)
  if (mood === 1 && energy === 1) {
    return [
      {
        id: 'crisis-support',
        label: 'Consider reaching out for support',
        why: 'You don\'t have to handle everything alone',
        est_min: 0,
        type: 'self_care'
      }
    ]
  }

  // Low mood/energy
  if (mood <= 2 && energy <= 2) {
    return suggestionTemplates.low_mood_low_energy
  }

  // Focus issues
  if (focus <= 2) {
    return suggestionTemplates.low_focus
  }

  // Good energy day
  if (energy >= 4) {
    return suggestionTemplates.good_energy
  }

  // Balanced day
  return suggestionTemplates.balanced
}

export async function POST(request: NextRequest) {
  try {
    const checkin: CheckInData = await request.json()

    // Validate input
    if (!checkin.mood || !checkin.energy || !checkin.focus) {
      return NextResponse.json(
        { error: 'Missing required check-in data' }, 
        { status: 400 }
      )
    }

    if ([checkin.mood, checkin.energy, checkin.focus].some(val => val < 1 || val > 5)) {
      return NextResponse.json(
        { error: 'Ratings must be between 1 and 5' }, 
        { status: 400 }
      )
    }

    // Generate suggestions based on check-in
    const suggestions = selectSuggestions(checkin)

    // Always include "not now" option (trauma-informed)
    const response = {
      suggestions: suggestions.slice(0, 2), // Max 2 to prevent overwhelm
      not_now: {
        message: "That's okay too. You can come back when you're ready.",
        alternative: "Would you like to just set a gentle reminder for later?"
      },
      context: {
        greeting: getGreeting(checkin),
        encouragement: getEncouragement(checkin)
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error generating suggestions:', error)
    return NextResponse.json(
      { error: 'Unable to generate suggestions right now' }, 
      { status: 500 }
    )
  }
}

function getGreeting(checkin: CheckInData): string {
  const avgScore = (checkin.mood + checkin.energy + checkin.focus) / 3

  if (avgScore <= 2) {
    return "Thank you for checking in, especially when things feel hard."
  } else if (avgScore <= 3.5) {
    return "I see where you're at right now. Let's find something that feels manageable."
  } else {
    return "You're feeling pretty good today. Let's make the most of it."
  }
}

function getEncouragement(checkin: CheckInData): string {
  const { mood, energy, focus } = checkin

  if (mood <= 2) {
    return "Remember, small steps count. You don't need to do everything today."
  } else if (focus <= 2) {
    return "When focus is challenging, shorter sessions often work better."
  } else if (energy >= 4) {
    return "Your energy is strong today. Use it in a way that feels sustainable."
  } else {
    return "You're building momentum one small action at a time."
  }
}