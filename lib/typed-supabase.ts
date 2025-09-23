/**
 * Typed Supabase Wrapper
 * This file provides type-safe wrappers around Supabase queries
 * with consistent error handling and return patterns
 */

import { supabase } from './supabase'
import {
  Assignment,
  User,
  Checkin,
  LittleWin,
  Subtask,
  UserProfile,
  Insertable,
  Updatable
} from '@/types/supabase'

// Typed database wrapper with consistent error handling
export const db = {
  // User operations
  users: {
    async getById(id: string): Promise<User | null> {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching user:', error)
        return null
      }
      return data
    },

    async getProfile(userId: string): Promise<Partial<User> | null> {
      const { data, error } = await supabase
        .from('users')
        .select('full_name, display_name, school, academic_year')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }
      return data
    },

    async updateProfile(userId: string, updates: UserProfile): Promise<User | null> {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating profile:', error)
        return null
      }
      return data
    },

    checkProfileComplete(user: User): boolean {
      return !!(user.full_name && user.school && user.academic_year)
    }
  },

  // Assignment operations
  assignments: {
    async getAll(userId: string): Promise<Assignment[]> {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('user_id', userId)
        .order('due_at', { ascending: true })

      if (error) {
        console.error('Error fetching assignments:', error)
        return []
      }
      return data || []
    },

    async getById(id: string): Promise<Assignment | null> {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching assignment:', error)
        return null
      }
      return data
    },

    async getRecent(userId: string, limit = 5): Promise<Assignment[]> {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['not_started', 'in_progress'])
        .order('due_at', { ascending: true })
        .limit(limit)

      if (error) {
        console.error('Error fetching recent assignments:', error)
        return []
      }
      return data || []
    },

    async getUpcoming(userId: string, days = 7): Promise<Assignment[]> {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('user_id', userId)
        .gte('due_at', new Date().toISOString())
        .lte('due_at', new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString())
        .order('due_at', { ascending: true })

      if (error) {
        console.error('Error fetching upcoming assignments:', error)
        return []
      }
      return data || []
    },

    async create(userId: string, assignment: Omit<Assignment, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Assignment | null> {
      const { data, error } = await supabase
        .from('assignments')
        .insert({
          user_id: userId,
          ...assignment
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating assignment:', error)
        return null
      }
      return data
    },

    async update(id: string, updates: Partial<Omit<Assignment, 'id' | 'user_id' | 'created_at'>>): Promise<Assignment | null> {
      const { data, error } = await supabase
        .from('assignments')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating assignment:', error)
        return null
      }
      return data
    },

    async delete(id: string): Promise<boolean> {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting assignment:', error)
        return false
      }
      return true
    }
  },

  // Check-in operations
  checkins: {
    async getAll(userId: string): Promise<Checkin[]> {
      const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching checkins:', error)
        return []
      }
      return data || []
    },

    async getRecent(userId: string, days = 7): Promise<Checkin[]> {
      const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching recent checkins:', error)
        return []
      }
      return data || []
    },

    async getToday(userId: string): Promise<Checkin | null> {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error('Error fetching today\'s checkin:', error)
        return null
      }
      return data
    },

    async create(userId: string, checkin: Omit<Checkin, 'id' | 'user_id' | 'created_at'>): Promise<Checkin | null> {
      const { data, error } = await supabase
        .from('checkins')
        .insert({
          user_id: userId,
          ...checkin
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating checkin:', error)
        return null
      }
      return data
    },

    async getStats(userId: string): Promise<{
      totalCheckIns: number
      currentStreak: number
      avgMood: number
      avgEnergy: number
      avgFocus: number
    }> {
      const checkins = await this.getRecent(userId, 30)

      if (checkins.length === 0) {
        return {
          totalCheckIns: 0,
          currentStreak: 0,
          avgMood: 0,
          avgEnergy: 0,
          avgFocus: 0
        }
      }

      // Calculate averages
      const totals = checkins.reduce(
        (acc, checkin) => ({
          mood: acc.mood + checkin.mood,
          energy: acc.energy + checkin.energy,
          focus: acc.focus + checkin.focus
        }),
        { mood: 0, energy: 0, focus: 0 }
      )

      // Calculate streak
      let currentStreak = 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today)
        checkDate.setDate(checkDate.getDate() - i)

        const hasCheckin = checkins.some(c => {
          const checkinDate = new Date(c.created_at)
          return checkinDate.toDateString() === checkDate.toDateString()
        })

        if (hasCheckin) {
          currentStreak++
        } else if (i > 0) {
          break
        }
      }

      return {
        totalCheckIns: checkins.length,
        currentStreak,
        avgMood: Number((totals.mood / checkins.length).toFixed(1)),
        avgEnergy: Number((totals.energy / checkins.length).toFixed(1)),
        avgFocus: Number((totals.focus / checkins.length).toFixed(1))
      }
    }
  },

  // Little wins operations
  littleWins: {
    async getAll(userId: string): Promise<LittleWin[]> {
      const { data, error } = await supabase
        .from('little_wins')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching little wins:', error)
        return []
      }
      return data || []
    },

    async getRecent(userId: string, limit = 5): Promise<LittleWin[]> {
      const { data, error } = await supabase
        .from('little_wins')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching recent little wins:', error)
        return []
      }
      return data || []
    },

    async create(userId: string, win: Omit<LittleWin, 'id' | 'user_id' | 'created_at'>): Promise<LittleWin | null> {
      const { data, error } = await supabase
        .from('little_wins')
        .insert({
          user_id: userId,
          ...win
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating little win:', error)
        return null
      }
      return data
    }
  },

  // Subtask operations
  subtasks: {
    async getByAssignment(assignmentId: string): Promise<Subtask[]> {
      const { data, error } = await supabase
        .from('subtasks')
        .select('*')
        .eq('assignment_id', assignmentId)
        .order('order_position', { ascending: true })

      if (error) {
        console.error('Error fetching subtasks:', error)
        return []
      }
      return data || []
    },

    async getById(id: string): Promise<Subtask | null> {
      const { data, error } = await supabase
        .from('subtasks')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching subtask:', error)
        return null
      }
      return data
    },

    async create(assignmentId: string, subtask: Omit<Subtask, 'id' | 'assignment_id' | 'created_at' | 'updated_at'>): Promise<Subtask | null> {
      // Get the current max order_position for this assignment
      const { data: existingSubtasks } = await supabase
        .from('subtasks')
        .select('order_position')
        .eq('assignment_id', assignmentId)
        .order('order_position', { ascending: false })
        .limit(1)

      const nextPosition = (existingSubtasks?.[0]?.order_position ?? -1) + 1

      const { data, error } = await supabase
        .from('subtasks')
        .insert({
          assignment_id: assignmentId,
          ...subtask,
          order_position: nextPosition
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating subtask:', error)
        return null
      }
      return data
    },

    async update(id: string, updates: Partial<Omit<Subtask, 'id' | 'assignment_id' | 'created_at'>>): Promise<Subtask | null> {
      const { data, error } = await supabase
        .from('subtasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating subtask:', error)
        return null
      }
      return data
    },

    async delete(id: string): Promise<boolean> {
      const { error } = await supabase
        .from('subtasks')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting subtask:', error)
        return false
      }
      return true
    },

    async reorder(subtaskId: string, newPosition: number): Promise<boolean> {
      const { error } = await supabase
        .from('subtasks')
        .update({
          order_position: newPosition,
          updated_at: new Date().toISOString()
        })
        .eq('id', subtaskId)

      if (error) {
        console.error('Error reordering subtask:', error)
        return false
      }
      return true
    },

    async getProgress(assignmentId: string): Promise<{ completed: number; total: number; percentage: number }> {
      const { data, error } = await supabase
        .from('subtasks')
        .select('completed')
        .eq('assignment_id', assignmentId)

      if (error) {
        console.error('Error getting subtask progress:', error)
        return { completed: 0, total: 0, percentage: 0 }
      }

      const total = data.length
      const completed = data.filter(s => s.completed).length
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

      return { completed, total, percentage }
    }
  }
}