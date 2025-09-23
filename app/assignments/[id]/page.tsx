'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getAssignment, updateAssignment, deleteAssignment } from '@/lib/supabase'
import PageHeader from '@/components/PageHeader'
import SubtaskList from '@/components/SubtaskList'
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

export default function AssignmentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading } = useAuth()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [assignmentLoading, setAssignmentLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    course: '',
    title: '',
    description: '',
    due_date: '',
    due_time: '',
    impact: 3,
    est_minutes: 60
  })
  const [isSaving, setIsSaving] = useState(false)

  const assignmentId = params.id as string

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  // Load assignment
  useEffect(() => {
    const loadAssignment = async () => {
      if (user && assignmentId) {
        setAssignmentLoading(true)
        setError(null)
        try {
          const data = await getAssignment(assignmentId)
          if (!data) {
            setError('Assignment not found')
          } else {
            setAssignment(data)
            // Initialize edit data
            const dueDate = new Date(data.due_at)
            setEditData({
              course: data.course,
              title: data.title,
              description: data.description || '',
              due_date: dueDate.toISOString().split('T')[0],
              due_time: dueDate.toTimeString().slice(0, 5),
              impact: data.impact,
              est_minutes: data.est_minutes
            })
          }
        } catch (error) {
          console.error('Error loading assignment:', error)
          setError('Failed to load assignment')
        } finally {
          setAssignmentLoading(false)
        }
      }
    }
    loadAssignment()
  }, [user, assignmentId])

  const handleStatusUpdate = async (status: Assignment['status']) => {
    if (!assignment) return

    try {
      const updated = await updateAssignment(assignment.id, { status })
      setAssignment(updated)
    } catch (error) {
      console.error('Error updating assignment status:', error)
      alert('Sorry, there was an error updating the assignment.')
    }
  }

  const handleDelete = async () => {
    if (!assignment) return
    if (!confirm('Are you sure you want to delete this assignment?')) return

    try {
      await deleteAssignment(assignment.id)
      router.push('/assignments')
    } catch (error) {
      console.error('Error deleting assignment:', error)
      alert('Sorry, there was an error deleting the assignment.')
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    if (!assignment) return
    // Reset edit data to current assignment values
    const dueDate = new Date(assignment.due_at)
    setEditData({
      course: assignment.course,
      title: assignment.title,
      description: assignment.description || '',
      due_date: dueDate.toISOString().split('T')[0],
      due_time: dueDate.toTimeString().slice(0, 5),
      impact: assignment.impact,
      est_minutes: assignment.est_minutes
    })
    setIsEditing(false)
  }

  const handleSaveEdit = async () => {
    if (!assignment) return

    setIsSaving(true)
    try {
      const dueDateTime = new Date(`${editData.due_date}T${editData.due_time}`)
      const updatedData = {
        course: editData.course,
        title: editData.title,
        description: editData.description || null,
        due_at: dueDateTime.toISOString(),
        impact: editData.impact,
        est_minutes: editData.est_minutes
      }

      const updated = await updateAssignment(assignment.id, updatedData)
      setAssignment(updated)
      setIsEditing(false)
      alert('Assignment updated successfully! 📚')
    } catch (error) {
      console.error('Error updating assignment:', error)
      alert('Sorry, there was an error updating the assignment.')
    } finally {
      setIsSaving(false)
    }
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

  // Show assignment loading
  if (assignmentLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background to-neutral-50 px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-600 border-t-transparent mx-auto mb-2"></div>
            <p className="text-neutral-600">Loading assignment...</p>
          </div>
        </div>
      </main>
    )
  }

  // Show error state
  if (error || !assignment) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background to-neutral-50 px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📚</div>
            <h2 className="text-xl font-semibold text-neutral-800 mb-2">
              {error || 'Assignment not found'}
            </h2>
            <p className="text-neutral-600 mb-6">
              This assignment might have been deleted or you don't have access to it.
            </p>
            <button
              onClick={() => router.push('/assignments')}
              className="
                px-4 py-2 bg-orange-500 text-white rounded-lg font-medium
                hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500
                transition-colors
              "
            >
              Back to Assignments
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-neutral-50 px-4 py-6">
      <div className="max-w-2xl mx-auto">
        {/* Navigation Header */}
        <PageHeader
          showBack={true}
          backPath="/assignments"
          backLabel="Assignments"
        />
        {/* Assignment Header */}
        <div className="mb-6">
          <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-6">
            {isEditing ? (
              // Edit Mode
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-neutral-800 mb-4">Edit Assignment</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Course
                    </label>
                    <input
                      type="text"
                      value={editData.course}
                      onChange={(e) => setEditData(prev => ({ ...prev, course: e.target.value }))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={editData.due_date}
                      onChange={(e) => setEditData(prev => ({ ...prev, due_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Due Time
                  </label>
                  <input
                    type="time"
                    value={editData.due_time}
                    onChange={(e) => setEditData(prev => ({ ...prev, due_time: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Description <span className="text-neutral-500">(optional)</span>
                  </label>
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Priority Level
                    </label>
                    <div className="flex justify-between items-center gap-1">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setEditData(prev => ({ ...prev, impact: value }))}
                          className={`
                            min-w-8 h-8 px-1 rounded-full border-2 transition-all text-xs flex items-center justify-center
                            focus:outline-none focus:ring-2 focus:ring-primary-500
                            ${editData.impact === value
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-neutral-200 hover:border-primary-300'
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
                      value={editData.est_minutes}
                      onChange={(e) => setEditData(prev => ({ ...prev, est_minutes: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                      <option value={180}>3 hours</option>
                      <option value={240}>4+ hours</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-neutral-200">
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 py-2 px-4 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={isSaving || !editData.course || !editData.title || !editData.due_date}
                    className="flex-1 py-2 px-4 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              // Display Mode
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
                        {assignment.course}
                      </span>
                      <span className="text-xl">
                        {impactEmojis[assignment.impact as keyof typeof impactEmojis]}
                      </span>
                      <span className={`inline-block text-xs px-2 py-1 rounded-full border ${statusColors[assignment.status]}`}>
                        {assignment.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h1 className="text-2xl font-semibold text-neutral-800 mb-3">
                      {assignment.title}
                    </h1>
                    {assignment.description && (
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-neutral-700 mb-2">Description</h3>
                        <p className="text-neutral-600 leading-relaxed whitespace-pre-wrap">
                          {assignment.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Assignment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-t border-neutral-200">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-700 mb-1">Due Date</h3>
                    <p className="text-neutral-600">{formatDueDate(assignment.due_at)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-700 mb-1">Estimated Time</h3>
                    <p className="text-neutral-600">{formatEstTime(assignment.est_minutes)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-700 mb-1">Priority Level</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{impactEmojis[assignment.impact as keyof typeof impactEmojis]}</span>
                      <span className="text-neutral-600">{assignment.impact}/5</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-700 mb-1">Status</h3>
                    <span className={`inline-block text-xs px-2 py-1 rounded-full border ${statusColors[assignment.status]}`}>
                      {assignment.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Subtasks */}
        <div className="mb-6">
          <SubtaskList
            assignmentId={assignment.id}
            assignmentTitle={assignment.title}
            isEditable={!isEditing}
          />
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Actions</h2>

          {/* Status Update Buttons */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-neutral-700 mb-3">Update Status</h3>
            <div className="flex gap-2 flex-wrap">
              {['not_started', 'in_progress', 'completed', 'dropped'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status as Assignment['status'])}
                  disabled={assignment.status === status}
                  className={`
                    px-3 py-2 text-sm rounded-md border transition-colors
                    ${assignment.status === status
                      ? `${statusColors[status as keyof typeof statusColors]} opacity-75 cursor-not-allowed`
                      : 'border-neutral-300 text-neutral-600 hover:bg-neutral-50'
                    }
                  `}
                >
                  Mark as {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Other Actions */}
          <div className="flex gap-3 pt-4 border-t border-neutral-200">
            <button
              onClick={handleEdit}
              disabled={isEditing}
              className="
                flex-1 py-2 px-4 border border-neutral-300 text-neutral-700 rounded-lg
                hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-500
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors
              "
            >
              Edit Assignment
            </button>
            <button
              onClick={handleDelete}
              disabled={isEditing}
              className="
                px-4 py-2 text-red-600 border border-red-300 rounded-lg
                hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors
              "
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}