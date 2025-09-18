'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getRecentAssignments, saveAssignment } from '@/lib/supabase'

interface Assignment {
  id: string
  course: string
  title: string
  due_at: string
  impact: number
  est_minutes: number
  status: 'not_started' | 'in_progress' | 'completed' | 'dropped'
}

interface AssignmentCardProps {
  onViewAll: () => void
  onQuickAdd?: (data: { course: string; title: string; due_at: string; impact: number; est_minutes: number }) => void
}

const impactEmojis = {
  1: '⭐',
  2: '⭐⭐',
  3: '⭐⭐⭐',
  4: '⭐⭐⭐⭐',
  5: '🔥'
}

const statusColors = {
  not_started: 'bg-neutral-100 text-neutral-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  dropped: 'bg-red-100 text-red-700'
}

export default function AssignmentCard({ onViewAll, onQuickAdd }: AssignmentCardProps) {
  const { user } = useAuth()
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [quickData, setQuickData] = useState({
    course: '',
    title: '',
    due_date: '',
    due_time: '23:59',
    impact: 3,
    est_minutes: 60
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load recent assignments
  useEffect(() => {
    const loadAssignments = async () => {
      if (user) {
        setLoading(true)
        try {
          const data = await getRecentAssignments(user.id)
          setAssignments(data)
        } catch (error) {
          console.error('Error loading assignments:', error)
          setAssignments([])
        } finally {
          setLoading(false)
        }
      }
    }
    loadAssignments()
  }, [user])

  const handleQuickSubmit = async () => {
    if (!user) return

    setIsSubmitting(true)
    try {
      // Save to database
      const dueDateTime = new Date(`${quickData.due_date}T${quickData.due_time}`)
      await saveAssignment(user.id, {
        course: quickData.course,
        title: quickData.title,
        due_at: dueDateTime.toISOString(),
        impact: quickData.impact,
        est_minutes: quickData.est_minutes
      })

      // Reload assignments
      const data = await getRecentAssignments(user.id)
      setAssignments(data)

      // Call optional callback
      onQuickAdd?.(quickData)

      // Reset form
      setShowQuickAdd(false)
      setQuickData({ course: '', title: '', due_date: '', due_time: '23:59', impact: 3, est_minutes: 60 })

      // Show success feedback
      alert('Assignment added! 📚')
    } catch (error) {
      console.error('Error saving assignment:', error)
      alert('Sorry, there was an error adding your assignment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getUpcomingCount = () => {
    const upcoming = assignments.filter(a =>
      a.status !== 'completed' && a.status !== 'dropped' &&
      new Date(a.due_at) > new Date()
    )
    return upcoming.length
  }

  const formatDueDate = (due_at: string) => {
    const date = new Date(due_at)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })

    if (diffDays < 0) return `Overdue (${timeStr})`
    if (diffDays === 0) return `Due today at ${timeStr}`
    if (diffDays === 1) return `Due tomorrow at ${timeStr}`
    return `Due in ${diffDays} days at ${timeStr}`
  }

  if (showQuickAdd) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-display text-primary-600 mb-1">
            Quick Add Assignment
          </h3>
          <p className="text-sm text-neutral-600">
            Add a new assignment to track
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Course
              </label>
              <input
                type="text"
                value={quickData.course}
                onChange={(e) => setQuickData(prev => ({ ...prev, course: e.target.value }))}
                placeholder="e.g., PSYC 101"
                className="
                  w-full px-3 py-2 border border-neutral-300 rounded-md text-sm
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                "
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={quickData.due_date}
                onChange={(e) => setQuickData(prev => ({ ...prev, due_date: e.target.value }))}
                className="
                  w-full px-3 py-2 border border-neutral-300 rounded-md text-sm
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
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
              value={quickData.due_time}
              onChange={(e) => setQuickData(prev => ({ ...prev, due_time: e.target.value }))}
              className="
                w-full px-3 py-2 border border-neutral-300 rounded-md text-sm
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
              "
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={quickData.title}
              onChange={(e) => setQuickData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Final Research Paper"
              className="
                w-full px-3 py-2 border border-neutral-300 rounded-md text-sm
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
              "
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Priority Level
              </label>
              <div className="flex justify-between items-center gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setQuickData(prev => ({ ...prev, impact: value }))}
                    className={`
                      min-w-8 h-8 px-1 rounded-full border-2 transition-all text-xs flex items-center justify-center
                      focus:outline-none focus:ring-2 focus:ring-primary-500
                      ${quickData.impact === value
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
                value={quickData.est_minutes}
                onChange={(e) => setQuickData(prev => ({ ...prev, est_minutes: parseInt(e.target.value) }))}
                className="
                  w-full px-3 py-2 border border-neutral-300 rounded-md text-sm
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
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
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={() => setShowQuickAdd(false)}
            className="
              flex-1 py-2 px-4 border border-neutral-300 text-neutral-700 rounded-lg
              hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-500
              transition-colors text-sm
            "
          >
            Cancel
          </button>
          <button
            onClick={handleQuickSubmit}
            disabled={isSubmitting || !quickData.course || !quickData.title || !quickData.due_date}
            className="
              flex-1 py-2 px-4 bg-primary-500 text-white rounded-lg font-medium
              hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors text-sm
            "
          >
            {isSubmitting ? 'Adding...' : 'Add Assignment'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-3 bg-gradient-to-r from-orange-50 to-yellow-50">
        <h2 className="text-lg font-display text-orange-600 mb-1">
          Assignments
        </h2>
        <p className="text-sm text-neutral-600">
          Track your upcoming assignments
        </p>
        <p className="text-xs text-neutral-500 mt-2">
          {loading ? 'Loading...' : `${getUpcomingCount()} upcoming assignments`}
        </p>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-600 border-t-transparent mx-auto mb-2"></div>
            <p className="text-sm text-neutral-600">Loading assignments...</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-neutral-700 leading-relaxed mb-3">
                Stay organized and reduce stress by keeping track of your assignments and deadlines.
              </p>

              {/* Preview of recent assignments */}
              {assignments.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {assignments.slice(0, 3).map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-2 bg-neutral-50 rounded-md">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-neutral-500 uppercase">
                            {assignment.course}
                          </span>
                          <span className="text-xs">
                            {impactEmojis[assignment.impact as keyof typeof impactEmojis]}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-800 truncate">{assignment.title}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-neutral-600">{formatDueDate(assignment.due_at)}</p>
                        <span className={`inline-block text-xs px-2 py-1 rounded-full ${statusColors[assignment.status]}`}>
                          {assignment.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                  {assignments.length > 3 && (
                    <p className="text-xs text-neutral-500 text-center">
                      +{assignments.length - 3} more assignments
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center p-4 bg-neutral-50 rounded-md mb-4">
                  <div className="text-2xl mb-2">📚</div>
                  <p className="text-sm text-neutral-600">No assignments yet</p>
                  <p className="text-xs text-neutral-500 mt-1">Add your first assignment below</p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              <button
                onClick={() => setShowQuickAdd(true)}
                className="
                  w-full py-3 px-4 bg-orange-500 text-white rounded-lg font-medium
                  hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500
                  transition-colors
                "
              >
                Add New Assignment
              </button>

              <button
                onClick={onViewAll}
                className="
                  w-full py-2 px-4 border border-neutral-300 text-neutral-700 rounded-lg
                  hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-500
                  transition-colors text-sm
                "
              >
                View All Assignments
              </button>
            </div>

            {/* Gentle reminder */}
            <div className="mt-3 pt-3 border-t border-neutral-200">
              <p className="text-xs text-neutral-500 text-center">
                One step at a time — you've got this
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}