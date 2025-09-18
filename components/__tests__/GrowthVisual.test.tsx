import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils/test-utils'
import GrowthVisual from '@/components/GrowthVisual'

describe('GrowthVisual', () => {
  const mockStats = {
    checkins: 5,
    completed: 12,
    wins: 8,
    streak: 3,
  }

  it('renders growth visual with title', () => {
    render(<GrowthVisual stats={mockStats} loading={false} />)
    expect(screen.getByText('Your Growth')).toBeInTheDocument()
  })

  it('displays loading state', () => {
    render(<GrowthVisual stats={mockStats} loading={true} />)
    expect(screen.getByText('Loading stats...')).toBeInTheDocument()
  })

  it('displays all stat values correctly', () => {
    render(<GrowthVisual stats={mockStats} loading={false} />)

    expect(screen.getByText('5')).toBeInTheDocument() // checkins
    expect(screen.getByText('12')).toBeInTheDocument() // completed
    expect(screen.getByText('8')).toBeInTheDocument() // wins
    expect(screen.getByText('3')).toBeInTheDocument() // streak
  })

  it('displays stat labels', () => {
    render(<GrowthVisual stats={mockStats} loading={false} />)

    expect(screen.getByText('Check-ins')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Little Wins')).toBeInTheDocument()
    expect(screen.getByText('Day Streak')).toBeInTheDocument()
  })

  it('displays icons for each stat', () => {
    render(<GrowthVisual stats={mockStats} loading={false} />)

    expect(screen.getByText('🌱')).toBeInTheDocument() // Check-ins
    expect(screen.getByText('✅')).toBeInTheDocument() // Completed
    expect(screen.getByText('🌟')).toBeInTheDocument() // Wins
    expect(screen.getByText('🔥')).toBeInTheDocument() // Streak
  })

  it('handles zero values correctly', () => {
    const zeroStats = {
      checkins: 0,
      completed: 0,
      wins: 0,
      streak: 0,
    }

    render(<GrowthVisual stats={zeroStats} loading={false} />)

    const zeros = screen.getAllByText('0')
    expect(zeros).toHaveLength(4)
  })

  it('displays motivational text', () => {
    render(<GrowthVisual stats={mockStats} loading={false} />)
    expect(screen.getByText("You're making progress! 🌈")).toBeInTheDocument()
  })

  it('does not show loading spinner when not loading', () => {
    const { container } = render(<GrowthVisual stats={mockStats} loading={false} />)
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).not.toBeInTheDocument()
  })

  it('shows loading spinner when loading', () => {
    const { container } = render(<GrowthVisual stats={mockStats} loading={true} />)
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('applies correct styling to stat values', () => {
    render(<GrowthVisual stats={mockStats} loading={false} />)

    const statValues = screen.getAllByText(/^\d+$/)
    statValues.forEach(value => {
      expect(value.className).toContain('text-2xl')
      expect(value.className).toContain('font-bold')
    })
  })

  it('renders in a card layout', () => {
    const { container } = render(<GrowthVisual stats={mockStats} loading={false} />)
    const card = container.querySelector('.bg-white.rounded-lg.shadow-sm')
    expect(card).toBeInTheDocument()
  })

  it('displays stats in a grid layout', () => {
    const { container } = render(<GrowthVisual stats={mockStats} loading={false} />)
    const grid = container.querySelector('.grid.grid-cols-2')
    expect(grid).toBeInTheDocument()
  })
})