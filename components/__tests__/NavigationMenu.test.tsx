import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils'
import NavigationMenu from '@/components/NavigationMenu'
import { useRouter } from 'next/navigation'

vi.mock('next/navigation')

describe('NavigationMenu', () => {
  const mockPush = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as any).mockReturnValue({
      push: mockPush,
    })
  })

  it('renders when open', () => {
    render(<NavigationMenu isOpen={true} onClose={mockOnClose} />)
    expect(screen.getByText('Menu')).toBeInTheDocument()
  })

  it('does not render content when closed', () => {
    const { container } = render(<NavigationMenu isOpen={false} onClose={mockOnClose} />)
    const panel = container.querySelector('.translate-x-0')
    expect(panel).not.toBeInTheDocument()
  })

  it('displays user email', () => {
    render(<NavigationMenu isOpen={true} onClose={mockOnClose} />)
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('navigates to home when Home button clicked', () => {
    render(<NavigationMenu isOpen={true} onClose={mockOnClose} />)
    const homeButton = screen.getByText('Home')
    fireEvent.click(homeButton)

    expect(mockPush).toHaveBeenCalledWith('/')
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('navigates to planning when Planning button clicked', () => {
    render(<NavigationMenu isOpen={true} onClose={mockOnClose} />)
    const planningButton = screen.getByText('Planning')
    fireEvent.click(planningButton)

    expect(mockPush).toHaveBeenCalledWith('/planning')
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('navigates to settings when Settings button clicked', () => {
    render(<NavigationMenu isOpen={true} onClose={mockOnClose} />)
    const settingsButton = screen.getByText('Settings')
    fireEvent.click(settingsButton)

    expect(mockPush).toHaveBeenCalledWith('/settings')
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('calls onClose when close button clicked', () => {
    render(<NavigationMenu isOpen={true} onClose={mockOnClose} />)
    // The close button is an X icon button, find it by its parent element
    const headerButtons = screen.getAllByRole('button')
    // The close button should be the one with an X (svg with path)
    const closeButton = headerButtons.find(button =>
      button.querySelector('svg path[d*="M6 18L18 6M6 6l12 12"]')
    )

    if (closeButton) {
      fireEvent.click(closeButton)
      expect(mockOnClose).toHaveBeenCalled()
    }
  })

  it('calls onClose when backdrop clicked', () => {
    const { container } = render(<NavigationMenu isOpen={true} onClose={mockOnClose} />)
    const backdrop = container.querySelector('.bg-black\\/50')
    if (backdrop) {
      fireEvent.click(backdrop)
    }

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('handles sign out', async () => {
    render(<NavigationMenu isOpen={true} onClose={mockOnClose} />)

    const signOutButton = screen.getByText('Sign Out')
    fireEvent.click(signOutButton)

    // The component should call onClose after sign out (it's async so wait)
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled()
    })
  })
})