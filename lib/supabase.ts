import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Trauma-informed helper functions

// Get recent check-ins for AI context
export async function getRecentCheckins(userId: string, days = 7) {
  const { data, error } = await supabase
    .from('checkins')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Get upcoming assignments (next 7 days)
export async function getUpcomingAssignments(userId: string) {
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('user_id', userId)
    .gte('due_at', new Date().toISOString())
    .lte('due_at', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('due_at', { ascending: true })

  if (error) throw error
  return data
}

// Get today's focus assignments (for morning check-in)
export async function getTodaysFocus(userId: string) {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'not_started')
    .lte('due_at', tomorrow.toISOString())
    .order('impact', { ascending: false })
    .limit(3) // Only show top 3 to prevent overwhelm

  if (error) throw error
  return data
}

// Save morning check-in
export async function saveCheckin(userId: string, checkin: {
  mood: number
  energy: number
  focus: number
  notes?: string
}) {
  const { data, error } = await supabase
    .from('checkins')
    .insert({
      user_id: userId,
      mood: checkin.mood,
      energy: checkin.energy,
      focus: checkin.focus,
      notes: checkin.notes || null
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Save a little win (trauma-informed positive reinforcement)
export async function saveLittleWin(userId: string, win: {
  category: 'academic' | 'self_care' | 'social' | 'personal' | 'other'
  description: string
}) {
  const { data, error } = await supabase
    .from('little_wins')
    .insert({
      user_id: userId,
      category: win.category,
      description: win.description
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Get cumulative progress stats (for growth tracking)
export async function getProgressStats(userId: string) {
  // Get total check-ins this month
  const monthStart = new Date()
  monthStart.setDate(1)
  
  const { count: checkinCount } = await supabase
    .from('checkins')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', monthStart.toISOString())

  // Get completed assignments this month
  const { count: completedCount } = await supabase
    .from('assignments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('updated_at', monthStart.toISOString())

  // Get little wins this month
  const { count: winsCount } = await supabase
    .from('little_wins')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', monthStart.toISOString())

  return {
    checkins: checkinCount || 0,
    completed: completedCount || 0,
    wins: winsCount || 0
  }
}