'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/typed-supabase'
import PageHeader from '@/components/PageHeader'
import { Assignment } from '@/types/supabase'

const impactEmojis = {
  1: '⭐',
  2: '⭐⭐',
  3: '⭐⭐⭐',
  4: '⭐⭐⭐⭐',
  5: '🔥'
}

const statusColors = {
  not_started: 'bg-neutral-100 text-neutral-700 border-neutral-300',
  in_progress: 'bg-blue-100 text-blue-700 border-blue-300',
  completed: 'bg-green-100 text-green-700 border-green-300',
  dropped: 'bg-red-100 text-red-700 border-red-300'
}

export default function AssignmentsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [assignmentsLoading, setAssignmentsLoading] = useState(true)
  const [assignmentProgress, setAssignmentProgress] = useState<Record<string, { completed: number; total: number; percentage: number }>>({})
  const [progressLoading, setProgressLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [sortBy, setSortBy] = useState<'due_date' | 'priority' | 'course'>('due_date')
  const [showCompleted, setShowCompleted] = useState(false)
  const [showDropped, setShowDropped] = useState(false)
  const [formData, setFormData] = useState({
    course: '',
    title: '',
    description: '',
    due_date: '',
    due_time: '23:59',
    impact: 3,
    est_minutes: 60
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Autocomplete states
  const [courseSuggestions, setCourseSuggestions] = useState<string[]>([])
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([])
  const [showCourseSuggestions, setShowCourseSuggestions] = useState(false)
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false)

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  // Load assignments
  useEffect(() => {
    const loadAssignments = async () => {
      if (user) {
        setAssignmentsLoading(true)
        try {
          const data = await db.assignments.getAll(user.id)
          setAssignments(data)

          // Extract unique course names and titles for suggestions
          const uniqueCourses = [...new Set(data.map(a => a.course))].sort()
          const uniqueTitles = [...new Set(data.map(a => a.title))].sort()
          setCourseSuggestions(uniqueCourses)
          setTitleSuggestions(uniqueTitles)

          // Load progress for all assignments
          await loadAssignmentsProgress(data)
        } catch (error) {
          console.error('Error loading assignments:', error)
          setAssignments([])
        } finally {
          setAssignmentsLoading(false)
        }
      }
    }
    loadAssignments()
  }, [user])

  // Load progress for all assignments
  const loadAssignmentsProgress = async (assignmentList: Assignment[]) => {
    setProgressLoading(true)
    try {
      const progressData: Record<string, { completed: number; total: number; percentage: number }> = {}

      // Load progress for each assignment in parallel
      await Promise.all(
        assignmentList.map(async (assignment) => {
          try {
            const progress = await db.subtasks.getProgress(assignment.id)
            progressData[assignment.id] = progress
          } catch (error) {
            console.error(`Error loading progress for assignment ${assignment.id}:`, error)
            progressData[assignment.id] = { completed: 0, total: 0, percentage: 0 }
          }
        })
      )

      setAssignmentProgress(progressData)
    } catch (error) {
      console.error('Error loading assignments progress:', error)
    } finally {
      setProgressLoading(false)
    }
  }

  // Sort assignments and separate by status
  const sortAssignments = (assignmentList: Assignment[]) => {
    return [...assignmentList].sort((a, b) => {
      switch (sortBy) {
        case 'due_date':
          return new Date(a.due_at).getTime() - new Date(b.due_at).getTime()
        case 'priority':
          return b.impact - a.impact
        case 'course':
          return a.course.localeCompare(b.course)
        default:
          return 0
      }
    })
  }

  // Separate assignments by status
  const activeAssignments = sortAssignments(
    assignments.filter(a => a.status === 'not_started' || a.status === 'in_progress')
  )
  const completedAssignments = sortAssignments(
    assignments.filter(a => a.status === 'completed')
  )
  const droppedAssignments = sortAssignments(
    assignments.filter(a => a.status === 'dropped')
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    try {
      const dueDateTime = new Date(`${formData.due_date}T${formData.due_time}`)

      if (editingAssignment) {
        // Update existing assignment
        const updated = await db.assignments.update(editingAssignment.id, {
          course: formData.course,
          title: formData.title,
          description: formData.description || null,
          due_at: dueDateTime.toISOString(),
          impact: formData.impact,
          est_minutes: formData.est_minutes
        })

        if (updated) {
          setAssignments(prev => prev.map(a => a.id === updated.id ? updated : a))
        } else {
          throw new Error('Failed to update assignment')
        }
      } else {
        // Create new assignment
        const newAssignment = await db.assignments.create(user.id, {
          course: formData.course,
          title: formData.title,
          description: formData.description || null,
          due_at: dueDateTime.toISOString(),
          impact: formData.impact,
          est_minutes: formData.est_minutes,
          status: 'not_started'
        })

        if (newAssignment) {
          setAssignments(prev => [...prev, newAssignment])
        } else {
          throw new Error('Failed to create assignment')
        }
      }

      // Reset form
      setFormData({ course: '', title: '', description: '', due_date: '', due_time: '23:59', impact: 3, est_minutes: 60 })
      setShowAddForm(false)
      setEditingAssignment(null)

      // Refresh progress data
      await loadAssignmentsProgress(assignments)
    } catch (error) {
      console.error('Error saving assignment:', error)
      alert('Sorry, there was an error saving your assignment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusUpdate = async (assignmentId: string, status: Assignment['status']) => {
    try {
      const updated = await db.assignments.update(assignmentId, { status })
      if (updated) {
        setAssignments(prev => prev.map(a => a.id === updated.id ? updated : a))
      } else {
        throw new Error('Failed to update status')
      }
    } catch (error) {
      console.error('Error updating assignment status:', error)
      alert('Sorry, there was an error updating the assignment.')
    }
  }

  const handleDelete = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return

    try {
      const success = await db.assignments.delete(assignmentId)
      if (success) {
        const updatedAssignments = assignments.filter(a => a.id !== assignmentId)
        setAssignments(updatedAssignments)
        // Update progress data by removing the deleted assignment
        setAssignmentProgress(prev => {
          const { [assignmentId]: removed, ...rest } = prev
          return rest
        })
      } else {
        throw new Error('Failed to delete assignment')
      }
    } catch (error) {
      console.error('Error deleting assignment:', error)
      alert('Sorry, there was an error deleting the assignment.')
    }
  }

  const startEdit = (assignment: Assignment) => {
    const dueDate = new Date(assignment.due_at)
    setEditingAssignment(assignment)
    setFormData({
      course: assignment.course,
      title: assignment.title,
      description: assignment.description || '',
      due_date: dueDate.toISOString().split('T')[0], // Format for date input
      due_time: dueDate.toTimeString().slice(0, 5), // Format for time input (HH:MM)
      impact: assignment.impact,
      est_minutes: assignment.est_minutes
    })
    // Don't show the top form - we'll show inline editing instead
  }

  const cancelEdit = () => {
    setEditingAssignment(null)
    setFormData({ course: '', title: '', description: '', due_date: '', due_time: '23:59', impact: 3, est_minutes: 60 })
  }

  const formatDueDate = (due_at: string) => {
    const date = new Date(due_at)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    const formattedDate = date.toLocaleDateString()
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })

    if (diffDays < 0) return `${formattedDate} at ${formattedTime} (Overdue)`
    if (diffDays === 0) return `${formattedDate} at ${formattedTime} (Due today)`
    if (diffDays === 1) return `${formattedDate} at ${formattedTime} (Due tomorrow)`
    return `${formattedDate} at ${formattedTime} (${diffDays} days)`
  }

  const formatEstTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMin = minutes % 60
    return remainingMin > 0 ? `${hours}h ${remainingMin}m` : `${hours}h`
  }

  // Render progress indicator for an assignment
  const renderProgressIndicator = (assignmentId: string) => {
    const progress = assignmentProgress[assignmentId]
    if (!progress || progress.total === 0) return null

    return (
      <div className="mt-2 space-y-1">
        <div className="flex justify-between text-xs text-neutral-600">
          <span>{progress.completed}/{progress.total} subtasks</span>
          <span>{progress.percentage}%</span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-1.5">
          <div
            className="bg-green-500 h-1.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>
    )
  }

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto mb-2"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if no user (will redirect)
  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-neutral-50 px-4 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Header */}
        <PageHeader
          showBack={true}
          backPath="/"
          backLabel="Home"
        />

        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display text-orange-600 mb-1">
              Assignments
            </h1>
            <p className="text-sm text-neutral-600">
              Manage your assignments and stay organized
            </p>
          </div>
          <button
            onClick={() => {
              setFormData({ course: '', title: '', description: '', due_date: '', due_time: '23:59', impact: 3, est_minutes: 60 })
              setEditingAssignment(null)
              setShowAddForm(true)
            }}
            className="
              px-4 py-2 bg-orange-500 text-white rounded-lg font-medium
              hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500
              transition-colors
            "
          >
            Add Assignment
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">
              {editingAssignment ? 'Edit Assignment' : 'Add New Assignment'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Course
                  </label>
                  <input
                    type="text"
                    value={formData.course}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, course: e.target.value }))
                      setShowCourseSuggestions(true)
                    }}
                    onFocus={() => setShowCourseSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowCourseSuggestions(false), 200)}
                    placeholder="e.g., PSYC 101"
                    required
                    className="
                      w-full px-3 py-2 border border-neutral-300 rounded-md
                      focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                    "
                  />
                  {showCourseSuggestions && courseSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-300 rounded-md shadow-lg max-h-48 overflow-auto">
                      {courseSuggestions
                        .filter(course =>
                          formData.course ? course.toLowerCase().includes(formData.course.toLowerCase()) : true
                        )
                        .map((course, index) => (
                          <button
                            key={index}
                            type="button"
                            onMouseDown={() => {
                              setFormData(prev => ({ ...prev, course }))
                              setShowCourseSuggestions(false)
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-neutral-100 focus:bg-neutral-100 focus:outline-none"
                          >
                            {course}
                          </button>
                        ))
                      }
                      {formData.course && courseSuggestions.filter(course => course.toLowerCase().includes(formData.course.toLowerCase())).length === 0 && (
                        <p className="px-3 py-2 text-sm text-neutral-500">No matches - this will be a new course</p>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                    required
                    className="
                      w-full px-3 py-2 border border-neutral-300 rounded-md
                      focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                    "
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Due Time
                </label>
                <input
                  type="time"
                  value={formData.due_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_time: e.target.value }))}
                  required
                  className="
                    w-full px-3 py-2 border border-neutral-300 rounded-md
                    focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                  "
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, title: e.target.value }))
                    setShowTitleSuggestions(true)
                  }}
                  onFocus={() => setShowTitleSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowTitleSuggestions(false), 200)}
                  placeholder="e.g., Final Research Paper"
                  required
                  className="
                    w-full px-3 py-2 border border-neutral-300 rounded-md
                    focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                  "
                />
                {showTitleSuggestions && titleSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-300 rounded-md shadow-lg max-h-48 overflow-auto">
                    {titleSuggestions
                      .filter(title =>
                        formData.title ? title.toLowerCase().includes(formData.title.toLowerCase()) : true
                      )
                      .map((title, index) => (
                        <button
                          key={index}
                          type="button"
                          onMouseDown={() => {
                            setFormData(prev => ({ ...prev, title }))
                            setShowTitleSuggestions(false)
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-neutral-100 focus:bg-neutral-100 focus:outline-none"
                        >
                          {title}
                        </button>
                      ))
                    }
                    {formData.title && titleSuggestions.filter(title => title.toLowerCase().includes(formData.title.toLowerCase())).length === 0 && (
                      <p className="px-3 py-2 text-sm text-neutral-500">No matches - this will be a new assignment title</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Description <span className="text-neutral-500">(optional)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add any additional details, requirements, or notes..."
                  rows={3}
                  className="
                    w-full px-3 py-2 border border-neutral-300 rounded-md resize-none
                    focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                  "
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Priority Level
                  </label>
                  <div className="flex justify-between items-center gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, impact: value }))}
                        className={`
                          min-w-12 h-12 px-2 rounded-full border-2 transition-all flex items-center justify-center
                          focus:outline-none focus:ring-2 focus:ring-orange-500
                          ${formData.impact === value
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-neutral-200 hover:border-orange-300'
                          }
                        `}
                      >
                        {impactEmojis[value as keyof typeof impactEmojis]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Estimated Time
                  </label>
                  <select
                    value={formData.est_minutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, est_minutes: parseInt(e.target.value) }))}
                    className="
                      w-full px-3 py-2 border border-neutral-300 rounded-md
                      focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                    "
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                    <option value={180}>3 hours</option>
                    <option value={240}>4+ hours</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingAssignment(null)
                  }}
                  className="
                    flex-1 py-2 px-4 border border-neutral-300 text-neutral-700 rounded-lg
                    hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-500
                    transition-colors
                  "
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="
                    flex-1 py-2 px-4 bg-orange-500 text-white rounded-lg font-medium
                    hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors
                  "
                >
                  {isSubmitting ? 'Saving...' : editingAssignment ? 'Update Assignment' : 'Add Assignment'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Sort Options */}
        <div className="bg-white rounded-lg border border-neutral-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-neutral-700">
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'due_date' | 'priority' | 'course')}
              className="
                px-3 py-2 border border-neutral-300 rounded-md text-sm
                focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
              "
            >
              <option value="due_date">Due Date</option>
              <option value="priority">Priority</option>
              <option value="course">Course</option>
            </select>
          </div>
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          {assignmentsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-600 border-t-transparent mx-auto mb-2"></div>
              <p className="text-neutral-600">Loading assignments...</p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg border border-neutral-200">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-lg font-medium text-neutral-800 mb-2">
                No assignments yet
              </h3>
              <p className="text-neutral-600 mb-4">
                Get started by adding your first assignment!
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="
                  px-4 py-2 bg-orange-500 text-white rounded-lg font-medium
                  hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500
                  transition-colors
                "
              >
                Add Your First Assignment
              </button>
            </div>
          ) : (
            <>
              {/* Active Assignments */}
              {activeAssignments.length > 0 ? (
                activeAssignments.map((assignment) => (
              <div key={assignment.id} className="bg-white rounded-lg border border-neutral-200 p-4 sm:p-6">
                {editingAssignment?.id === assignment.id ? (
                  // Inline Edit Form
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                      Edit Assignment
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Course
                        </label>
                        <input
                          type="text"
                          value={formData.course}
                          onChange={(e) => setFormData(prev => ({ ...prev, course: e.target.value }))}
                          placeholder="e.g., PSYC 101"
                          required
                          className="
                            w-full px-3 py-2 border border-neutral-300 rounded-md
                            focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                          "
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Due Date
                        </label>
                        <input
                          type="date"
                          value={formData.due_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                          required
                          className="
                            w-full px-3 py-2 border border-neutral-300 rounded-md
                            focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                          "
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Due Time
                      </label>
                      <input
                        type="time"
                        value={formData.due_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, due_time: e.target.value }))}
                        required
                        className="
                          w-full px-3 py-2 border border-neutral-300 rounded-md
                          focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                        "
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Final Research Paper"
                        required
                        className="
                          w-full px-3 py-2 border border-neutral-300 rounded-md
                          focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                        "
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Description <span className="text-neutral-500">(optional)</span>
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Add any additional details, requirements, or notes..."
                        rows={3}
                        className="
                          w-full px-3 py-2 border border-neutral-300 rounded-md resize-none
                          focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                        "
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Priority Level
                        </label>
                        <div className="flex justify-between items-center gap-1">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, impact: value }))}
                              className={`
                                min-w-12 h-12 px-2 rounded-full border-2 transition-all flex items-center justify-center
                                focus:outline-none focus:ring-2 focus:ring-orange-500
                                ${formData.impact === value
                                  ? 'border-orange-500 bg-orange-50'
                                  : 'border-neutral-200 hover:border-orange-300'
                                }
                              `}
                            >
                              {impactEmojis[value as keyof typeof impactEmojis]}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Estimated Time
                        </label>
                        <select
                          value={formData.est_minutes}
                          onChange={(e) => setFormData(prev => ({ ...prev, est_minutes: parseInt(e.target.value) }))}
                          className="
                            w-full px-3 py-2 border border-neutral-300 rounded-md
                            focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                          "
                        >
                          <option value={30}>30 minutes</option>
                          <option value={60}>1 hour</option>
                          <option value={120}>2 hours</option>
                          <option value={180}>3 hours</option>
                          <option value={240}>4+ hours</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="
                          flex-1 py-2 px-4 border border-neutral-300 text-neutral-700 rounded-lg
                          hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-500
                          transition-colors
                        "
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="
                          flex-1 py-2 px-4 bg-orange-500 text-white rounded-lg font-medium
                          hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500
                          disabled:opacity-50 disabled:cursor-not-allowed
                          transition-colors
                        "
                      >
                        {isSubmitting ? 'Saving...' : 'Update Assignment'}
                      </button>
                    </div>
                  </form>
                ) : (
                  // Normal Assignment Card View
                  <>
                    <div className="mb-4">
                      {/* Course and priority */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
                          {assignment.course}
                        </span>
                        <span className="text-lg">
                          {impactEmojis[assignment.impact as keyof typeof impactEmojis]}
                        </span>
                      </div>

                      {/* Title aligned with action buttons */}
                      <div className="flex items-start gap-2 mb-3">
                        <h3
                          onClick={() => router.push(`/assignments/${assignment.id}`)}
                          className="text-lg font-semibold text-neutral-800 cursor-pointer hover:text-orange-600 transition-colors flex-1 min-w-0"
                        >
                          {assignment.title}
                        </h3>
                        {/* Action buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => startEdit(assignment)}
                            className="
                              px-2 sm:px-3 py-1 text-xs sm:text-sm text-neutral-600 hover:text-neutral-800
                              border border-neutral-300 rounded-md hover:bg-neutral-50
                              transition-colors
                            "
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(assignment.id)}
                            className="
                              px-2 sm:px-3 py-1 text-xs sm:text-sm text-red-600 hover:text-red-800
                              border border-red-300 rounded-md hover:bg-red-50
                              transition-colors
                            "
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      {assignment.description && (
                        <p className="text-sm text-neutral-600 mb-3 leading-relaxed">
                          {assignment.description}
                        </p>
                      )}

                      {/* Due date and time estimate - stack on very small screens */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-neutral-600">
                        <span>{formatDueDate(assignment.due_at)}</span>
                        <span>Est. {formatEstTime(assignment.est_minutes)}</span>
                      </div>

                      {/* Progress indicator */}
                      {renderProgressIndicator(assignment.id)}
                    </div>

                    {/* Status Update Buttons */}
                    <div className="flex gap-2 flex-wrap">
                      {['not_started', 'in_progress', 'completed', 'dropped'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusUpdate(assignment.id, status as Assignment['status'])}
                          disabled={assignment.status === status}
                          className={`
                            px-2 sm:px-3 py-1 text-xs rounded-md border transition-colors flex-shrink-0
                            ${assignment.status === status
                              ? `${statusColors[status as keyof typeof statusColors]} opacity-75 cursor-not-allowed`
                              : 'border-neutral-300 text-neutral-600 hover:bg-neutral-50'
                            }
                          `}
                        >
                          <span className="hidden sm:inline">Mark as </span>{status.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
                ))
              ) : (
                <div className="text-center py-6 bg-white rounded-lg border border-neutral-200">
                  <p className="text-neutral-600">No active assignments</p>
                </div>
              )}

              {/* Completed Assignments - Collapsible */}
              {completedAssignments.length > 0 && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="w-full flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                  >
                    <span className="font-medium text-green-700">
                      Completed ({completedAssignments.length})
                    </span>
                    <svg
                      className={`w-5 h-5 text-green-600 transition-transform ${showCompleted ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showCompleted && (
                    <div className="mt-4 space-y-4">
                      {completedAssignments.map((assignment) => (
                        <div key={assignment.id} className="bg-white rounded-lg border border-neutral-200 p-4 sm:p-6">
                          {editingAssignment?.id === assignment.id ? (
                            // Inline Edit Form (reuse existing edit form code)
                            <form onSubmit={handleSubmit} className="space-y-4">
                              {/* Edit form content - same as above */}
                            </form>
                          ) : (
                            // Normal Assignment Card View
                            <>
                              <div className="mb-4 opacity-75">
                                {/* Course and priority */}
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
                                    {assignment.course}
                                  </span>
                                  <span className="text-lg">
                                    {impactEmojis[assignment.impact as keyof typeof impactEmojis]}
                                  </span>
                                </div>

                                {/* Title aligned with action buttons */}
                                <div className="flex items-start gap-2 mb-3">
                                  <h3
                                    onClick={() => router.push(`/assignments/${assignment.id}`)}
                                    className="text-lg font-semibold text-neutral-800 cursor-pointer hover:text-orange-600 transition-colors flex-1 min-w-0 line-through"
                                  >
                                    {assignment.title}
                                  </h3>
                                  {/* Action buttons */}
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                      onClick={() => startEdit(assignment)}
                                      className="
                                        px-2 sm:px-3 py-1 text-xs sm:text-sm text-neutral-600 hover:text-neutral-800
                                        border border-neutral-300 rounded-md hover:bg-neutral-50
                                        transition-colors
                                      "
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDelete(assignment.id)}
                                      className="
                                        px-2 sm:px-3 py-1 text-xs sm:text-sm text-red-600 hover:text-red-800
                                        border border-red-300 rounded-md hover:bg-red-50
                                        transition-colors
                                      "
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                                {assignment.description && (
                                  <p className="text-sm text-neutral-600 mb-3 leading-relaxed">
                                    {assignment.description}
                                  </p>
                                )}

                                {/* Due date and time estimate - stack on very small screens */}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-neutral-600">
                                  <span>{formatDueDate(assignment.due_at)}</span>
                                  <span>Est. {formatEstTime(assignment.est_minutes)}</span>
                                </div>

                                {/* Progress indicator */}
                                {renderProgressIndicator(assignment.id)}
                              </div>

                              {/* Status Update Buttons */}
                              <div className="flex gap-2 flex-wrap">
                                {['not_started', 'in_progress', 'completed', 'dropped'].map((status) => (
                                  <button
                                    key={status}
                                    onClick={() => handleStatusUpdate(assignment.id, status as Assignment['status'])}
                                    disabled={assignment.status === status}
                                    className={`
                                      px-2 sm:px-3 py-1 text-xs rounded-md border transition-colors flex-shrink-0
                                      ${assignment.status === status
                                        ? `${statusColors[status as keyof typeof statusColors]} opacity-75 cursor-not-allowed`
                                        : 'border-neutral-300 text-neutral-600 hover:bg-neutral-50'
                                      }
                                    `}
                                  >
                                    <span className="hidden sm:inline">Mark as </span>{status.replace('_', ' ')}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Dropped Assignments - Collapsible */}
              {droppedAssignments.length > 0 && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowDropped(!showDropped)}
                    className="w-full flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
                  >
                    <span className="font-medium text-red-700">
                      Dropped ({droppedAssignments.length})
                    </span>
                    <svg
                      className={`w-5 h-5 text-red-600 transition-transform ${showDropped ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showDropped && (
                    <div className="mt-4 space-y-4">
                      {droppedAssignments.map((assignment) => (
                        <div key={assignment.id} className="bg-white rounded-lg border border-neutral-200 p-4 sm:p-6">
                          {/* Same card structure as completed, with opacity */}
                          <div className="mb-4 opacity-50">
                            {/* Course and priority */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
                                {assignment.course}
                              </span>
                              <span className="text-lg">
                                {impactEmojis[assignment.impact as keyof typeof impactEmojis]}
                              </span>
                            </div>

                            {/* Title aligned with action buttons */}
                            <div className="flex items-start gap-2 mb-3">
                              <h3 className="text-lg font-semibold text-neutral-800 flex-1 min-w-0 line-through">
                                {assignment.title}
                              </h3>
                              {/* Action buttons */}
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                  onClick={() => handleDelete(assignment.id)}
                                  className="
                                    px-2 sm:px-3 py-1 text-xs sm:text-sm text-red-600 hover:text-red-800
                                    border border-red-300 rounded-md hover:bg-red-50
                                    transition-colors
                                  "
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                            {assignment.description && (
                              <p className="text-sm text-neutral-600 mb-3 leading-relaxed">
                                {assignment.description}
                              </p>
                            )}

                            {/* Due date and time estimate - stack on very small screens */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-neutral-600">
                              <span>{formatDueDate(assignment.due_at)}</span>
                              <span>Est. {formatEstTime(assignment.est_minutes)}</span>
                            </div>

                            {/* Progress indicator */}
                            {renderProgressIndicator(assignment.id)}
                          </div>

                          {/* Status Update Buttons - only show reactivate option */}
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => handleStatusUpdate(assignment.id, 'not_started')}
                              className="px-2 sm:px-3 py-1 text-xs rounded-md border border-neutral-300 text-neutral-600 hover:bg-neutral-50 transition-colors flex-shrink-0"
                            >
                              Reactivate
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}