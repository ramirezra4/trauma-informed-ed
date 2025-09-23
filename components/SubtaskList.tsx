'use client'

import { useState, useEffect } from 'react'
import { Subtask } from '@/types/supabase'
import { db } from '@/lib/typed-supabase'
import SubtaskItem from './SubtaskItem'

interface SubtaskListProps {
  assignmentId: string
  assignmentTitle: string
  isEditable?: boolean
  onProgressUpdate?: (progress: { completed: number; total: number; percentage: number }) => void
}

export default function SubtaskList({
  assignmentId,
  assignmentTitle,
  isEditable = true,
  onProgressUpdate
}: SubtaskListProps) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [newSubtaskDescription, setNewSubtaskDescription] = useState('')
  const [newSubtaskEstMinutes, setNewSubtaskEstMinutes] = useState(30)
  const [isCreating, setIsCreating] = useState(false)

  // Load subtasks
  useEffect(() => {
    loadSubtasks()
  }, [assignmentId])

  // Update progress when subtasks change
  useEffect(() => {
    if (onProgressUpdate) {
      const total = subtasks.length
      const completed = subtasks.filter(s => s.completed).length
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
      onProgressUpdate({ completed, total, percentage })
    }
  }, [subtasks, onProgressUpdate])

  const loadSubtasks = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await db.subtasks.getByAssignment(assignmentId)
      setSubtasks(data)
    } catch (error) {
      console.error('Error loading subtasks:', error)
      setError('Failed to load subtasks')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleComplete = async (subtaskId: string, completed: boolean) => {
    try {
      const updated = await db.subtasks.update(subtaskId, { completed })
      if (updated) {
        setSubtasks(prev => prev.map(s => s.id === subtaskId ? updated : s))
      }
    } catch (error) {
      console.error('Error toggling subtask completion:', error)
      throw error
    }
  }

  const handleUpdateSubtask = async (subtaskId: string, updates: Partial<Subtask>) => {
    try {
      const updated = await db.subtasks.update(subtaskId, updates)
      if (updated) {
        setSubtasks(prev => prev.map(s => s.id === subtaskId ? updated : s))
      }
    } catch (error) {
      console.error('Error updating subtask:', error)
      throw error
    }
  }

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      const success = await db.subtasks.delete(subtaskId)
      if (success) {
        setSubtasks(prev => prev.filter(s => s.id !== subtaskId))
      }
    } catch (error) {
      console.error('Error deleting subtask:', error)
      throw error
    }
  }

  const handleCreateSubtask = async () => {
    if (!newSubtaskTitle.trim()) return

    setIsCreating(true)
    try {
      const newSubtask = await db.subtasks.create(assignmentId, {
        title: newSubtaskTitle.trim(),
        description: newSubtaskDescription.trim() || null,
        est_minutes: newSubtaskEstMinutes > 0 ? newSubtaskEstMinutes : null,
        completed: false,
        order_position: 0, // Will be set by the backend
        due_at: null
      })

      if (newSubtask) {
        setSubtasks(prev => [...prev, newSubtask])
        setNewSubtaskTitle('')
        setNewSubtaskDescription('')
        setNewSubtaskEstMinutes(30)
        setShowAddForm(false)
      } else {
        throw new Error('Failed to create subtask')
      }
    } catch (error) {
      console.error('Error creating subtask:', error)
      alert('Sorry, there was an error creating the subtask.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCancelAdd = () => {
    setShowAddForm(false)
    setNewSubtaskTitle('')
    setNewSubtaskDescription('')
    setNewSubtaskEstMinutes(30)
  }

  const completedCount = subtasks.filter(s => s.completed).length
  const totalCount = subtasks.length
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Subtasks</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-600 border-t-transparent"></div>
          <span className="ml-3 text-neutral-600">Loading subtasks...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Subtasks</h3>
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadSubtasks}
            className="mt-2 px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6">
      {/* Header with progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-neutral-800">Subtasks</h3>
          {isEditable && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-3 py-1 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Add Subtask
            </button>
          )}
        </div>

        {/* Progress indicator */}
        {totalCount > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-neutral-600">
              <span>{completedCount} of {totalCount} completed</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Add new subtask form */}
      {showAddForm && (
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200 mb-4">
          <h4 className="text-sm font-medium text-orange-800 mb-3">Add New Subtask</h4>
          <form onSubmit={(e) => { e.preventDefault(); handleCreateSubtask(); }} className="space-y-3">
            <div>
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="What needs to be done?"
                required
                className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <textarea
                value={newSubtaskDescription}
                onChange={(e) => setNewSubtaskDescription(e.target.value)}
                placeholder="Optional description..."
                rows={2}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm resize-none focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm text-neutral-700">Estimated time:</label>
                <select
                  value={newSubtaskEstMinutes}
                  onChange={(e) => setNewSubtaskEstMinutes(parseInt(e.target.value))}
                  className="px-2 py-1 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option value={15}>15 min</option>
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancelAdd}
                className="flex-1 px-3 py-2 text-sm border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || !newSubtaskTitle.trim()}
                className="flex-1 px-3 py-2 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCreating ? 'Adding...' : 'Add Subtask'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Subtasks list */}
      {subtasks.length === 0 ? (
        <div className="text-center py-8 text-neutral-500">
          <div className="text-3xl mb-3">📝</div>
          <p className="text-sm">No subtasks yet</p>
          {isEditable && (
            <p className="text-xs mt-1">Break this assignment into smaller, manageable pieces</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {subtasks.map((subtask) => (
            <SubtaskItem
              key={subtask.id}
              subtask={subtask}
              onToggleComplete={handleToggleComplete}
              onUpdate={handleUpdateSubtask}
              onDelete={handleDeleteSubtask}
              isEditable={isEditable}
            />
          ))}
        </div>
      )}
    </div>
  )
}