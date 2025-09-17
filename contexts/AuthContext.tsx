'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, getUserProfile } from '@/lib/supabase'

interface UserProfile {
  fullName: string
  school: string
  academicYear: 'freshman' | 'sophomore' | 'junior' | 'senior' | 'graduate' | 'other'
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  needsProfileSetup: boolean
  signUp: (email: string, password: string, profile?: UserProfile) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false)

  // Check if user profile is complete (temporarily simplified)
  const checkProfileCompletion = async (userId: string) => {
    try {
      // Temporarily disable profile checking to fix loading issue
      setNeedsProfileSetup(false)
      return true
    } catch (error) {
      setNeedsProfileSetup(false)
      return true
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await checkProfileCompletion(session.user.id)
      } else {
        setNeedsProfileSetup(false)
      }
      
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        await checkProfileCompletion(session.user.id)
      } else {
        setNeedsProfileSetup(false)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, profile?: UserProfile) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: profile ? {
          full_name: profile.fullName,
          school: profile.school,
          academic_year: profile.academicYear
        } : {}
      }
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const refreshProfile = async () => {
    if (user) {
      await checkProfileCompletion(user.id)
    }
  }

  const value = {
    user,
    session,
    loading,
    needsProfileSetup,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}