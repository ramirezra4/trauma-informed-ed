import { createClient } from '@supabase/supabase-js'
import { Database, Assignment, User, Checkin, UserProfile } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create Supabase client (types added at function level for safety)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

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
  console.log('Saving check-in for user:', userId, checkin)
  
  try {
    // First ensure user exists in users table
    await ensureUserExists(userId)
    console.log('User ensured, now inserting check-in')
    
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

    if (error) {
      console.error('Supabase check-in error:', error)
      throw error
    }
    
    console.log('Check-in saved successfully:', data)
    return data
  } catch (err) {
    console.error('saveCheckin error:', err)
    throw err
  }
}

// Ensure user exists in users table (create if not exists)
async function ensureUserExists(userId: string) {
  console.log('Checking if user exists:', userId)
  
  const { data: existingUser, error: selectError } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single()

  console.log('Existing user check result:', existingUser, selectError)

  if (!existingUser) {
    console.log('User does not exist, creating...')
    const { data: authUser } = await supabase.auth.getUser()
    console.log('Auth user:', authUser.user?.email)
    
    if (authUser.user) {
      // Extract profile data from user metadata if available
      const metadata = authUser.user.user_metadata || {}
      
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: authUser.user.email!,
          full_name: metadata.full_name || null,
          school: metadata.school || null,
          academic_year: metadata.academic_year || null,
          consent_at: new Date().toISOString()
        })
        .select()
        .single()

      console.log('User creation result:', newUser, insertError)
      if (insertError) throw insertError
    }
  } else {
    console.log('User already exists')
  }
}

// Save a little win (trauma-informed positive reinforcement)
export async function saveLittleWin(userId: string, win: {
  category: 'academic' | 'self_care' | 'social' | 'personal' | 'other'
  description: string
}) {
  // First ensure user exists in users table
  await ensureUserExists(userId)
  
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

// Get user profile information
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('full_name, display_name, school, academic_year')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

// Update user profile information
export async function updateUserProfile(userId: string, profile: {
  fullName: string
  school: string
  academicYear: 'freshman' | 'sophomore' | 'junior' | 'senior' | 'graduate' | 'other'
}) {
  const { data, error } = await supabase
    .from('users')
    .update({
      full_name: profile.fullName,
      school: profile.school,
      academic_year: profile.academicYear,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
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

// Get the most recent check-in time for display
export async function getLastCheckinTime(userId: string) {
  const { data, error } = await supabase
    .from('checkins')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) return null
  return data.created_at
}

// Assignment CRUD functions

// Get all assignments for a user
export async function getUserAssignments(userId: string): Promise<Assignment[]> {
  await ensureUserExists(userId)

  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('user_id', userId)
    .order('due_at', { ascending: true })

  if (error) throw error
  return data || []
}

// Get recent assignments (for card display)
export async function getRecentAssignments(userId: string, limit = 5): Promise<Assignment[]> {
  await ensureUserExists(userId)

  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['not_started', 'in_progress'])
    .order('due_at', { ascending: true })
    .limit(limit)

  if (error) throw error
  return data || []
}

// Get a single assignment by ID
export async function getAssignment(assignmentId: string): Promise<Assignment | null> {
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('id', assignmentId)
    .single()

  if (error) throw error
  return data
}

// Create a new assignment
export async function saveAssignment(userId: string, assignment: {
  course: string
  title: string
  description?: string | null
  due_at: string
  impact: number
  est_minutes: number
}): Promise<Assignment> {
  await ensureUserExists(userId)

  const { data, error } = await supabase
    .from('assignments')
    .insert({
      user_id: userId,
      course: assignment.course,
      title: assignment.title,
      description: assignment.description || null,
      due_at: assignment.due_at,
      impact: assignment.impact,
      est_minutes: assignment.est_minutes,
      status: 'not_started'
    })
    .select()
    .single()

  if (error) throw error
  return data!
}

// Update an assignment
export async function updateAssignment(assignmentId: string, updates: {
  course?: string
  title?: string
  description?: string | null
  due_at?: string
  impact?: number
  est_minutes?: number
  status?: 'not_started' | 'in_progress' | 'completed' | 'dropped'
}): Promise<Assignment> {
  const { data, error } = await supabase
    .from('assignments')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', assignmentId)
    .select()
    .single()

  if (error) throw error
  return data!
}

// Delete an assignment
export async function deleteAssignment(assignmentId: string) {
  const { error } = await supabase
    .from('assignments')
    .delete()
    .eq('id', assignmentId)

  if (error) throw error
}