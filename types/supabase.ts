// Complete Supabase Database Types
// This file provides proper typing for all database operations

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          display_name: string | null
          school: string | null
          academic_year: 'freshman' | 'sophomore' | 'junior' | 'senior' | 'graduate' | 'other' | null
          consent_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          display_name?: string | null
          school?: string | null
          academic_year?: 'freshman' | 'sophomore' | 'junior' | 'senior' | 'graduate' | 'other' | null
          consent_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          display_name?: string | null
          school?: string | null
          academic_year?: 'freshman' | 'sophomore' | 'junior' | 'senior' | 'graduate' | 'other' | null
          consent_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      checkins: {
        Row: {
          id: string
          user_id: string
          mood: number
          energy: number
          focus: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mood: number
          energy: number
          focus: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mood?: number
          energy?: number
          focus?: number
          notes?: string | null
          created_at?: string
        }
      }
      assignments: {
        Row: {
          id: string
          user_id: string
          course: string
          title: string
          description: string | null
          due_at: string
          impact: number
          est_minutes: number
          status: 'not_started' | 'in_progress' | 'completed' | 'dropped'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course: string
          title: string
          description?: string | null
          due_at: string
          impact: number
          est_minutes: number
          status?: 'not_started' | 'in_progress' | 'completed' | 'dropped'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course?: string
          title?: string
          description?: string | null
          due_at?: string
          impact?: number
          est_minutes?: number
          status?: 'not_started' | 'in_progress' | 'completed' | 'dropped'
          created_at?: string
          updated_at?: string
        }
      }
      little_wins: {
        Row: {
          id: string
          user_id: string
          category: 'academic' | 'self_care' | 'social' | 'personal' | 'other'
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: 'academic' | 'self_care' | 'social' | 'personal' | 'other'
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: 'academic' | 'self_care' | 'social' | 'personal' | 'other'
          description?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types for easier access
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific table types for convenience
export type User = Tables<'users'>
export type Checkin = Tables<'checkins'>
export type Assignment = Tables<'assignments'>
export type LittleWin = Tables<'little_wins'>

// UserProfile type for profile update operations
export interface UserProfile {
  full_name: string | null
  display_name: string | null
  school: string | null
  academic_year: 'freshman' | 'sophomore' | 'junior' | 'senior' | 'graduate' | 'other' | null
}

// Type guards
export function isAssignment(obj: any): obj is Assignment {
  return obj && typeof obj.id === 'string' && 'due_at' in obj && 'impact' in obj
}

export function isUser(obj: any): obj is User {
  return obj && typeof obj.id === 'string' && 'email' in obj
}