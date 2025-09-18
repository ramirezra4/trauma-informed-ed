import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils'
import Home from '@/app/page'
import { useRouter } from 'next/navigation'
import { getProgressStats, getUserProfile } from '@/lib/supabase'

vi.mock('next/navigation')
vi.mock('@/lib/supabase')

describe('Home Page', () => {
  const mockPush = vi.fn()
  const mockStats = {
    checkins: 5,
    completed: 10,
    wins: 3,
    streak: 2,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as any).mockReturnValue({
      push: mockPush,
    })
    ;(getProgressStats as any).mockResolvedValue(mockStats)
    ;(getUserProfile as any).mockResolvedValue({
      display_name: 'Test User',
      full_name: 'Test User',
    })
  })

  it('renders home page with greeting', async () => {
    render(<Home />)

    await waitFor(() => {
      const greeting = screen.getByRole('heading', { level: 1 })
      expect(greeting).toBeInTheDocument()
      expect(greeting.textContent).toMatch(/Good (morning|afternoon|evening)/)
    })
  })

  it('displays user name in greeting when available', async () => {
    render(<Home />)

    await waitFor(() => {
      expect(screen.getByText(/Test User/)).toBeInTheDocument()
    })
  })

  it('displays welcome subtitle', async () => {
    render(<Home />)

    await waitFor(() => {
      expect(screen.getByText('Welcome to your support space')).toBeInTheDocument()
    })
  })

  it('redirects to auth when not logged in', async () => {
    render(<Home />, { user: null })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth')
    })
  })

  it('redirects to profile setup when needed', async () => {
    render(<Home />, { needsProfileSetup: true })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/profile-setup')
    })
  })

  it('displays loading state initially', () => {
    render(<Home />, { loading: true })
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders all main components', async () => {
    render(<Home />)

    await waitFor(() => {
      // Check for main components
      expect(screen.getByText('Assignments')).toBeInTheDocument()
      expect(screen.getByText('Your Growth')).toBeInTheDocument()
      expect(screen.getByText('Daily Check-in')).toBeInTheDocument()
    })
  })

  it('opens navigation menu when hamburger clicked', async () => {
    render(<Home />)

    await waitFor(() => {
      const hamburgerButton = screen.getByLabelText('Open navigation menu')
      fireEvent.click(hamburgerButton)
    })

    expect(screen.getByText('Menu')).toBeInTheDocument()
  })

  it('handles sign out', async () => {
    const mockSignOut = vi.fn()
    render(<Home />)

    await waitFor(() => {
      const signOutButton = screen.getByText('Sign Out')
      fireEvent.click(signOutButton)
    })

    expect(mockPush).toHaveBeenCalledWith('/auth')
  })

  it('loads user stats on mount', async () => {
    render(<Home />)

    await waitFor(() => {
      expect(getProgressStats).toHaveBeenCalledWith('test-user-id')
    })
  })

  it('loads user profile on mount', async () => {
    render(<Home />)

    await waitFor(() => {
      expect(getUserProfile).toHaveBeenCalledWith('test-user-id')
    })
  })

  it('displays footer message', async () => {
    render(<Home />)

    await waitFor(() => {
      expect(screen.getByText('Every small step forward is worth celebrating')).toBeInTheDocument()
    })
  })

  it('handles navigation to assignments page', async () => {
    render(<Home />)

    await waitFor(() => {
      const viewAllButton = screen.getByText('View All')
      fireEvent.click(viewAllButton)
    })

    expect(mockPush).toHaveBeenCalledWith('/assignments')
  })

  it('handles navigation to checkin flow', async () => {
    render(<Home />)

    await waitFor(() => {
      const fullCheckinButton = screen.getByText('Full Check-in')
      fireEvent.click(fullCheckinButton)
    })

    expect(mockPush).toHaveBeenCalledWith('/checkin')
  })

  it('displays correct time-based greeting', async () => {
    const originalDate = global.Date
    const mockDate = vi.fn(() => ({
      getHours: vi.fn(() => 9), // Morning
    }))
    global.Date = mockDate as any

    render(<Home />)

    await waitFor(() => {
      expect(screen.getByText(/Good morning/)).toBeInTheDocument()
    })

    global.Date = originalDate
  })
})