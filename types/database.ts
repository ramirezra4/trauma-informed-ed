export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Trauma-informed database schema
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          consent_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          display_name?: string | null
          consent_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          consent_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      checkins: {
        Row: {
          id: string
          user_id: string
          mood: number // 1-5 scale
          energy: number // 1-5 scale
          focus: number // 1-5 scale
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
          due_at: string
          impact: number // 1-5 scale (how important)
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
          due_at?: string
          impact?: number
          est_minutes?: number
          status?: 'not_started' | 'in_progress' | 'completed' | 'dropped'
          created_at?: string
          updated_at?: string
        }
      }
      plans: {
        Row: {
          id: string
          user_id: string
          trigger: 'morning' | 'falling_behind'
          summary: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          trigger: 'morning' | 'falling_behind'
          summary: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          trigger?: 'morning' | 'falling_behind'
          summary?: string
          created_at?: string
        }
      }
      plan_steps: {
        Row: {
          id: string
          plan_id: string
          assignment_id: string | null
          label: string
          est_min: number
          status: 'pending' | 'completed' | 'skipped'
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          plan_id: string
          assignment_id?: string | null
          label: string
          est_min: number
          status?: 'pending' | 'completed' | 'skipped'
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          plan_id?: string
          assignment_id?: string | null
          label?: string
          est_min?: number
          status?: 'pending' | 'completed' | 'skipped'
          created_at?: string
          completed_at?: string | null
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
      assignment_status: 'not_started' | 'in_progress' | 'completed' | 'dropped'
      plan_trigger: 'morning' | 'falling_behind'
      plan_step_status: 'pending' | 'completed' | 'skipped'
      little_win_category: 'academic' | 'self_care' | 'social' | 'personal' | 'other'
    }
  }
}