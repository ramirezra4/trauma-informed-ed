import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils'
import userEvent from '@testing-library/user-event'
import AssignmentCard from '@/components/AssignmentCard'
import { getUserAssignments, saveAssignment, deleteAssignment, updateAssignment, completeAssignment } from '@/lib/supabase'
import { createMockAssignment } from '@/test/utils/test-utils'

vi.mock('@/lib/supabase')

describe('AssignmentCard', () => {
  const mockOnViewAll = vi.fn()
  const mockAssignments = [
    createMockAssignment({
      id: '1',
      course: 'Math 101',
      title: 'Homework 1',
      priority: 'high',
      due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    }),
    createMockAssignment({
      id: '2',
      course: 'Physics 201',
      title: 'Lab Report',
      priority: 'medium',
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
    }),
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    ;(getUserAssignments as any).mockResolvedValue(mockAssignments)
  })

  it('renders assignment card with title', async () => {
    render(<AssignmentCard onViewAll={mockOnViewAll} />)

    await waitFor(() => {
      expect(screen.getByText('Assignments')).toBeInTheDocument()
    })
  })

  it('loads and displays assignments', async () => {
    render(<AssignmentCard onViewAll={mockOnViewAll} />)

    await waitFor(() => {
      expect(screen.getByText('Math 101')).toBeInTheDocument()
      expect(screen.getByText('Homework 1')).toBeInTheDocument()
      expect(screen.getByText('Physics 201')).toBeInTheDocument()
      expect(screen.getByText('Lab Report')).toBeInTheDocument()
    })
  })

  it('displays loading state initially', () => {
    render(<AssignmentCard onViewAll={mockOnViewAll} />)
    expect(screen.getByText('Loading assignments...')).toBeInTheDocument()
  })

  it('displays empty state when no assignments', async () => {
    ;(getUserAssignments as any).mockResolvedValue([])
    render(<AssignmentCard onViewAll={mockOnViewAll} />)

    await waitFor(() => {
      expect(screen.getByText('No assignments yet')).toBeInTheDocument()
      expect(screen.getByText('Add your first assignment to get started')).toBeInTheDocument()
    })
  })

  it('shows quick add form when Add Assignment clicked', async () => {
    render(<AssignmentCard onViewAll={mockOnViewAll} />)

    await waitFor(() => {
      const addButton = screen.getByText('Add Assignment')
      fireEvent.click(addButton)
    })

    expect(screen.getByPlaceholderText('Course name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Assignment title')).toBeInTheDocument()
  })

  it('handles quick add assignment submission', async () => {
    const user = userEvent.setup()
    ;(saveAssignment as any).mockResolvedValue(undefined)

    render(<AssignmentCard onViewAll={mockOnViewAll} />)

    await waitFor(() => {
      const addButton = screen.getByText('Add Assignment')
      fireEvent.click(addButton)
    })

    const courseInput = screen.getByPlaceholderText('Course name')
    const titleInput = screen.getByPlaceholderText('Assignment title')

    await user.type(courseInput, 'CS 301')
    await user.type(titleInput, 'Final Project')

    const saveButton = screen.getByRole('button', { name: /add/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(saveAssignment).toHaveBeenCalledWith(
        'test-user-id',
        expect.objectContaining({
          course: 'CS 301',
          title: 'Final Project',
        })
      )
    })
  })

  it('handles assignment completion', async () => {
    ;(completeAssignment as any).mockResolvedValue(undefined)

    render(<AssignmentCard onViewAll={mockOnViewAll} />)

    await waitFor(() => {
      const completeButtons = screen.getAllByLabelText(/mark.*complete/i)
      fireEvent.click(completeButtons[0])
    })

    expect(completeAssignment).toHaveBeenCalledWith('test-user-id', '1')
  })

  it('handles assignment deletion', async () => {
    ;(deleteAssignment as any).mockResolvedValue(undefined)
    window.confirm = vi.fn(() => true)

    render(<AssignmentCard onViewAll={mockOnViewAll} />)

    await waitFor(() => {
      const deleteButtons = screen.getAllByLabelText(/delete/i)
      fireEvent.click(deleteButtons[0])
    })

    expect(deleteAssignment).toHaveBeenCalledWith('test-user-id', '1')
  })

  it('shows edit form when edit button clicked', async () => {
    render(<AssignmentCard onViewAll={mockOnViewAll} />)

    await waitFor(() => {
      const editButtons = screen.getAllByLabelText(/edit/i)
      fireEvent.click(editButtons[0])
    })

    const courseInput = screen.getByDisplayValue('Math 101')
    expect(courseInput).toBeInTheDocument()
  })

  it('handles edit cancellation', async () => {
    render(<AssignmentCard onViewAll={mockOnViewAll} />)

    await waitFor(() => {
      const editButtons = screen.getAllByLabelText(/edit/i)
      fireEvent.click(editButtons[0])
    })

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    await waitFor(() => {
      expect(screen.getByText('Math 101')).toBeInTheDocument()
    })
  })

  it('calls onViewAll when View All clicked', async () => {
    render(<AssignmentCard onViewAll={mockOnViewAll} />)

    await waitFor(() => {
      const viewAllButton = screen.getByText('View All')
      fireEvent.click(viewAllButton)
    })

    expect(mockOnViewAll).toHaveBeenCalled()
  })

  it('displays priority with correct styling', async () => {
    render(<AssignmentCard onViewAll={mockOnViewAll} />)

    await waitFor(() => {
      const highPriority = screen.getByText('⭐⭐⭐')
      const mediumPriority = screen.getByText('⭐⭐')

      expect(highPriority).toBeInTheDocument()
      expect(mediumPriority).toBeInTheDocument()
    })
  })

  it('shows autocomplete suggestions for course names', async () => {
    render(<AssignmentCard onViewAll={mockOnViewAll} />)

    await waitFor(() => {
      const addButton = screen.getByText('Add Assignment')
      fireEvent.click(addButton)
    })

    const courseInput = screen.getByPlaceholderText('Course name')
    fireEvent.focus(courseInput)

    await waitFor(() => {
      expect(screen.getByText('Math 101')).toBeInTheDocument()
      expect(screen.getByText('Physics 201')).toBeInTheDocument()
    })
  })
})