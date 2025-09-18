import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils'
import CheckInCard from '@/components/CheckInCard'

describe('CheckInCard', () => {
  const mockOnStartFullFlow = vi.fn()
  const mockOnQuickCheckin = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders check-in card with title', () => {
    render(
      <CheckInCard
        onStartFullFlow={mockOnStartFullFlow}
        onQuickCheckin={mockOnQuickCheckin}
      />
    )

    expect(screen.getByText('Check-in')).toBeInTheDocument()
  })

  it('shows check-in prompt by default', () => {
    render(
      <CheckInCard
        onStartFullFlow={mockOnStartFullFlow}
        onQuickCheckin={mockOnQuickCheckin}
      />
    )

    // Check for the actual content rendered
    expect(screen.getByText(/Taking a moment to check in/)).toBeInTheDocument()
    expect(screen.getByText('Start Full Check-in Flow')).toBeInTheDocument()
  })

  it('calls onStartFullFlow when Full Check-in clicked', () => {
    render(
      <CheckInCard
        onStartFullFlow={mockOnStartFullFlow}
        onQuickCheckin={mockOnQuickCheckin}
      />
    )

    const fullCheckInButton = screen.getByText('Start Full Check-in Flow')
    fireEvent.click(fullCheckInButton)

    expect(mockOnStartFullFlow).toHaveBeenCalled()
  })

  it('shows quick check-in button', () => {
    render(
      <CheckInCard
        onStartFullFlow={mockOnStartFullFlow}
        onQuickCheckin={mockOnQuickCheckin}
      />
    )

    expect(screen.getByText('Quick 30-second check-in')).toBeInTheDocument()
  })

  it('shows quick check-in form when button clicked', () => {
    render(
      <CheckInCard
        onStartFullFlow={mockOnStartFullFlow}
        onQuickCheckin={mockOnQuickCheckin}
      />
    )

    const quickCheckinButton = screen.getByText('Quick 30-second check-in')
    fireEvent.click(quickCheckinButton)

    // Now the form should be visible
    expect(screen.getByText('How are you feeling?')).toBeInTheDocument()
    expect(screen.getByLabelText('Mood')).toBeInTheDocument()
    expect(screen.getByLabelText('Energy')).toBeInTheDocument()
    expect(screen.getByLabelText('Focus')).toBeInTheDocument()
  })

  it('updates mood slider value in quick check-in form', () => {
    render(
      <CheckInCard
        onStartFullFlow={mockOnStartFullFlow}
        onQuickCheckin={mockOnQuickCheckin}
      />
    )

    // First open the quick check-in form
    const quickCheckinButton = screen.getByText('Quick 30-second check-in')
    fireEvent.click(quickCheckinButton)

    const moodSlider = screen.getByLabelText('Mood') as HTMLInputElement
    fireEvent.change(moodSlider, { target: { value: '4' } })

    expect(moodSlider.value).toBe('4')
  })

  it('calls onQuickCheckin with correct values when saved', async () => {
    render(
      <CheckInCard
        onStartFullFlow={mockOnStartFullFlow}
        onQuickCheckin={mockOnQuickCheckin}
      />
    )

    // Open quick check-in form
    const quickCheckinButton = screen.getByText('Quick 30-second check-in')
    fireEvent.click(quickCheckinButton)

    // Update values
    const moodSlider = screen.getByLabelText('Mood')
    const energySlider = screen.getByLabelText('Energy')
    const focusSlider = screen.getByLabelText('Focus')

    fireEvent.change(moodSlider, { target: { value: '4' } })
    fireEvent.change(energySlider, { target: { value: '3' } })
    fireEvent.change(focusSlider, { target: { value: '5' } })

    // Save
    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)

    // Wait for the async operation
    await waitFor(() => {
      expect(mockOnQuickCheckin).toHaveBeenCalledWith({
        mood: 4,
        energy: 3,
        focus: 5,
      })
    })
  })

  it('displays last check-in time message', () => {
    render(
      <CheckInCard
        onStartFullFlow={mockOnStartFullFlow}
        onQuickCheckin={mockOnQuickCheckin}
      />
    )

    // Should show welcome message when no last check-in
    expect(screen.getByText(/Welcome! Ready for your first check-in?/)).toBeInTheDocument()
  })
})