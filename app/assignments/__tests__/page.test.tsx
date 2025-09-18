import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils'
import userEvent from '@testing-library/user-event'
import AssignmentsPage from '@/app/assignments/page'
import { getUserAssignments, saveAssignment, deleteAssignment, updateAssignment, completeAssignment } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { createMockAssignment } from '@/test/utils/test-utils'

vi.mock('next/navigation')
vi.mock('@/lib/supabase')

describe('Assignments Page', () => {
  const mockPush = vi.fn()
  const mockAssignments = [
    createMockAssignment({
      id: '1',
      course: 'Math 101',
      title: 'Homework 1',
      priority: 'high',
    }),
    createMockAssignment({
      id: '2',
      course: 'Physics 201',
      title: 'Lab Report',
      priority: 'medium',
      completed: true,
    }),
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as any).mockReturnValue({
      push: mockPush,
    })
    ;(getUserAssignments as any).mockResolvedValue(mockAssignments)
  })

  it('renders page header with title', async () => {
    render(<AssignmentsPage />)

    await waitFor(() => {
      expect(screen.getByText('Assignments')).toBeInTheDocument()
      expect(screen.getByText('Track your academic workload')).toBeInTheDocument()
    })
  })

  it('loads and displays assignments', async () => {
    render(<AssignmentsPage />)

    await waitFor(() => {
      expect(screen.getByText('Math 101')).toBeInTheDocument()
      expect(screen.getByText('Homework 1')).toBeInTheDocument()
    })
  })

  it('shows active and completed tabs', async () => {
    render(<AssignmentsPage />)

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /active/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /completed/i })).toBeInTheDocument()
    })
  })

  it('filters assignments by active status', async () => {
    render(<AssignmentsPage />)

    await waitFor(() => {
      const activeTab = screen.getByRole('tab', { name: /active/i })
      fireEvent.click(activeTab)
    })

    expect(screen.getByText('Math 101')).toBeInTheDocument()
    expect(screen.queryByText('Physics 201')).not.toBeInTheDocument() // Completed assignment
  })

  it('filters assignments by completed status', async () => {
    render(<AssignmentsPage />)

    await waitFor(() => {
      const completedTab = screen.getByRole('tab', { name: /completed/i })
      fireEvent.click(completedTab)
    })

    expect(screen.queryByText('Math 101')).not.toBeInTheDocument() // Active assignment
    expect(screen.getByText('Physics 201')).toBeInTheDocument()
  })

  it('shows add assignment form when button clicked', async () => {
    render(<AssignmentsPage />)

    await waitFor(() => {
      const addButton = screen.getByText('Add Assignment')
      fireEvent.click(addButton)
    })

    expect(screen.getByPlaceholderText('e.g., Math 101')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g., Problem Set 5')).toBeInTheDocument()
  })

  it('handles new assignment submission', async () => {
    const user = userEvent.setup()
    ;(saveAssignment as any).mockResolvedValue(undefined)

    render(<AssignmentsPage />)

    await waitFor(() => {
      const addButton = screen.getByText('Add Assignment')
      fireEvent.click(addButton)
    })

    await user.type(screen.getByPlaceholderText('e.g., Math 101'), 'CS 301')
    await user.type(screen.getByPlaceholderText('e.g., Problem Set 5'), 'Final Project')

    const saveButton = screen.getByRole('button', { name: /save assignment/i })
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

  it('validates required fields', async () => {
    render(<AssignmentsPage />)

    await waitFor(() => {
      const addButton = screen.getByText('Add Assignment')
      fireEvent.click(addButton)
    })

    const saveButton = screen.getByRole('button', { name: /save assignment/i })
    fireEvent.click(saveButton)

    // Form should not submit without required fields
    expect(saveAssignment).not.toHaveBeenCalled()
  })

  it('handles assignment deletion', async () => {
    ;(deleteAssignment as any).mockResolvedValue(undefined)
    window.confirm = vi.fn(() => true)

    render(<AssignmentsPage />)

    await waitFor(() => {
      const deleteButtons = screen.getAllByLabelText(/delete assignment/i)
      fireEvent.click(deleteButtons[0])
    })

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this assignment?')
    expect(deleteAssignment).toHaveBeenCalledWith('test-user-id', '1')
  })

  it('cancels deletion when not confirmed', async () => {
    window.confirm = vi.fn(() => false)

    render(<AssignmentsPage />)

    await waitFor(() => {
      const deleteButtons = screen.getAllByLabelText(/delete assignment/i)
      fireEvent.click(deleteButtons[0])
    })

    expect(deleteAssignment).not.toHaveBeenCalled()
  })

  it('handles assignment completion', async () => {
    ;(completeAssignment as any).mockResolvedValue(undefined)

    render(<AssignmentsPage />)

    await waitFor(() => {
      const completeButtons = screen.getAllByLabelText(/mark as complete/i)
      fireEvent.click(completeButtons[0])
    })

    expect(completeAssignment).toHaveBeenCalledWith('test-user-id', '1')
  })

  it('shows edit form when edit button clicked', async () => {
    render(<AssignmentsPage />)

    await waitFor(() => {
      const editButtons = screen.getAllByLabelText(/edit assignment/i)
      fireEvent.click(editButtons[0])
    })

    expect(screen.getByDisplayValue('Math 101')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Homework 1')).toBeInTheDocument()
  })

  it('handles edit submission', async () => {
    const user = userEvent.setup()
    ;(updateAssignment as any).mockResolvedValue(undefined)

    render(<AssignmentsPage />)

    await waitFor(() => {
      const editButtons = screen.getAllByLabelText(/edit assignment/i)
      fireEvent.click(editButtons[0])
    })

    const titleInput = screen.getByDisplayValue('Homework 1')
    await user.clear(titleInput)
    await user.type(titleInput, 'Updated Homework')

    const saveButton = screen.getByRole('button', { name: /save changes/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(updateAssignment).toHaveBeenCalledWith(
        'test-user-id',
        '1',
        expect.objectContaining({
          title: 'Updated Homework',
        })
      )
    })
  })

  it('cancels edit mode', async () => {
    render(<AssignmentsPage />)

    await waitFor(() => {
      const editButtons = screen.getAllByLabelText(/edit assignment/i)
      fireEvent.click(editButtons[0])
    })

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    expect(screen.queryByDisplayValue('Math 101')).not.toBeInTheDocument()
    expect(screen.getByText('Math 101')).toBeInTheDocument()
  })

  it('displays empty state when no assignments', async () => {
    ;(getUserAssignments as any).mockResolvedValue([])
    render(<AssignmentsPage />)

    await waitFor(() => {
      expect(screen.getByText('No active assignments')).toBeInTheDocument()
      expect(screen.getByText("Great job! You're all caught up.")).toBeInTheDocument()
    })
  })

  it('shows autocomplete suggestions', async () => {
    render(<AssignmentsPage />)

    await waitFor(() => {
      const addButton = screen.getByText('Add Assignment')
      fireEvent.click(addButton)
    })

    const courseInput = screen.getByPlaceholderText('e.g., Math 101')
    fireEvent.focus(courseInput)

    await waitFor(() => {
      expect(screen.getByText('Math 101')).toBeInTheDocument()
      expect(screen.getByText('Physics 201')).toBeInTheDocument()
    })
  })

  it('redirects to auth when not logged in', async () => {
    render(<AssignmentsPage />, { user: null })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth')
    })
  })
})