'use client'

import { useState } from 'react'
import { Subtask } from '@/types/supabase'

interface SubtaskItemProps {
  subtask: Subtask
  onToggleComplete: (subtaskId: string, completed: boolean) => Promise<void>
  onUpdate: (subtaskId: string, updates: Partial<Subtask>) => Promise<void>
  onDelete: (subtaskId: string) => Promise<void>
  isEditable?: boolean
}

export default function SubtaskItem({
  subtask,
  onToggleComplete,
  onUpdate,
  onDelete,
  isEditable = true
}: SubtaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(subtask.title)
  const [editDescription, setEditDescription] = useState(subtask.description || '')
  const [editEstMinutes, setEditEstMinutes] = useState(subtask.est_minutes || 30)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleToggleComplete = async () => {
    try {
      await onToggleComplete(subtask.id, !subtask.completed)
    } catch (error) {
      console.error('Error toggling subtask completion:', error)
    }
  }

  const handleStartEdit = () => {
    setEditTitle(subtask.title)
    setEditDescription(subtask.description || '')
    setEditEstMinutes(subtask.est_minutes || 30)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditTitle(subtask.title)
    setEditDescription(subtask.description || '')
    setEditEstMinutes(subtask.est_minutes || 30)
  }

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return

    setIsSubmitting(true)
    try {
      await onUpdate(subtask.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        est_minutes: editEstMinutes > 0 ? editEstMinutes : null
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating subtask:', error)
      alert('Sorry, there was an error updating the subtask.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this subtask?')) return

    try {
      await onDelete(subtask.id)
    } catch (error) {
      console.error('Error deleting subtask:', error)
      alert('Sorry, there was an error deleting the subtask.')
    }
  }

  const formatEstTime = (minutes: number | null) => {
    if (!minutes) return null
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMin = minutes % 60
    return remainingMin > 0 ? `${hours}h ${remainingMin}m` : `${hours}h`
  }

  if (isEditing) {
    return (
      <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
        <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="space-y-3">
          <div>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Subtask title..."
              required
              className="w-full px-2 py-1 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Optional description..."
              rows={2}
              className="w-full px-2 py-1 border border-neutral-300 rounded text-sm resize-none focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-neutral-600">Time:</label>
              <select
                value={editEstMinutes}
                onChange={(e) => setEditEstMinutes(parseInt(e.target.value))}
                className="px-2 py-1 border border-neutral-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
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

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="flex-1 px-3 py-1 text-xs border border-neutral-300 text-neutral-600 rounded hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !editTitle.trim()}
              className="flex-1 px-3 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
      subtask.completed
        ? 'bg-green-50 border-green-200 opacity-75'
        : 'bg-white border-neutral-200 hover:bg-neutral-50'
    }`}>
      {/* Checkbox */}
      <button
        onClick={handleToggleComplete}
        className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-colors flex items-center justify-center ${
          subtask.completed
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-neutral-300 hover:border-orange-500'
        }`}
      >
        {subtask.completed && (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-medium ${
              subtask.completed ? 'text-green-700 line-through' : 'text-neutral-800'
            }`}>
              {subtask.title}
            </h4>
            {subtask.description && (
              <p className={`text-xs mt-1 ${
                subtask.completed ? 'text-green-600' : 'text-neutral-600'
              }`}>
                {subtask.description}
              </p>
            )}
            {subtask.est_minutes && (
              <span className={`inline-block text-xs mt-1 px-2 py-0.5 rounded-full ${
                subtask.completed
                  ? 'bg-green-100 text-green-700'
                  : 'bg-neutral-100 text-neutral-600'
              }`}>
                {formatEstTime(subtask.est_minutes)}
              </span>
            )}
          </div>

          {/* Action buttons */}
          {isEditable && !subtask.completed && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={handleStartEdit}
                className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                title="Edit subtask"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                title="Delete subtask"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}