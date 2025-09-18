/**
 * Typed Supabase Wrapper
 * This file provides type-safe wrappers around Supabase queries
 * allowing us to gradually add type safety without breaking existing code
 */

import { supabase } from './supabase'
import { Assignment, User, Checkin, LittleWin } from '@/types/supabase'

// Type-safe query builders
export const db = {
  assignments: {
    async getAll(userId: string): Promise<Assignment[]> {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('user_id', userId)
        .order('due_at', { ascending: true })

      if (error) throw error
      return (data as Assignment[]) || []
    },

    async getById(id: string): Promise<Assignment | null> {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Assignment | null
    },

    async create(userId: string, assignment: Omit<Assignment, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Assignment> {
      const { data, error } = await supabase
        .from('assignments')
        .insert({
          user_id: userId,
          ...assignment
        })
        .select()
        .single()

      if (error) throw error
      return data as Assignment
    },

    async update(id: string, updates: Partial<Omit<Assignment, 'id' | 'user_id' | 'created_at'>>): Promise<Assignment> {
      const { data, error } = await supabase
        .from('assignments')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Assignment
    },

    async delete(id: string): Promise<void> {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id)

      if (error) throw error
    }
  },

  checkins: {
    async create(userId: string, checkin: Omit<Checkin, 'id' | 'user_id' | 'created_at'>): Promise<Checkin> {
      const { data, error } = await supabase
        .from('checkins')
        .insert({
          user_id: userId,
          ...checkin
        })
        .select()
        .single()

      if (error) throw error
      return data as Checkin
    },

    async getRecent(userId: string, days: number = 7): Promise<Checkin[]> {
      const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data as Checkin[]) || []
    }
  },

  users: {
    async getProfile(userId: string): Promise<Partial<User> | null> {
      const { data, error } = await supabase
        .from('users')
        .select('full_name, display_name, school, academic_year')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data as Partial<User> | null
    },

    async updateProfile(userId: string, updates: Partial<Omit<User, 'id' | 'email' | 'created_at'>>): Promise<User> {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return data as User
    }
  },

  littleWins: {
    async create(userId: string, win: Omit<LittleWin, 'id' | 'user_id' | 'created_at'>): Promise<LittleWin> {
      const { data, error } = await supabase
        .from('little_wins')
        .insert({
          user_id: userId,
          ...win
        })
        .select()
        .single()

      if (error) throw error
      return data as LittleWin
    }
  }
}