'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getUserProfile, updateUserProfile } from '@/lib/supabase'

export default function ProfileSetupPage() {
  const [fullName, setFullName] = useState('')
  const [school, setSchool] = useState('')
  const [academicYear, setAcademicYear] = useState<'freshman' | 'sophomore' | 'junior' | 'senior' | 'graduate' | 'other'>('freshman')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { user, loading: authLoading, refreshProfile } = useAuth()
  const router = useRouter()

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  // Load existing profile data
  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    try {
      const profile = await getUserProfile(user.id)
      if (profile) {
        setFullName(profile.full_name || '')
        setSchool(profile.school || '')
        setAcademicYear(profile.academic_year || 'freshman')
      }
    } catch (error) {
      // Profile doesn't exist yet, that's okay
      console.log('No existing profile found')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setError(null)

    try {
      await updateUserProfile(user.id, {
        fullName,
        school,
        academicYear
      })

      // Refresh the profile status in auth context
      await refreshProfile()

      // Redirect to home page
      router.push('/')
    } catch (err) {
      console.error('Error saving profile:', err)
      setError('There was an error saving your profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto mb-2"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if no user (will redirect)
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-display text-primary-600 mb-2">
              Complete Your Profile
            </h1>
            <p className="text-sm text-neutral-600">
              Help us personalize your experience with a few quick details
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700 mb-1">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label htmlFor="school" className="block text-sm font-medium text-neutral-700 mb-1">
                School/University
              </label>
              <input
                id="school"
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                required
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Name of your institution"
              />
            </div>

            <div>
              <label htmlFor="academicYear" className="block text-sm font-medium text-neutral-700 mb-1">
                Academic Year
              </label>
              <select
                id="academicYear"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value as typeof academicYear)}
                required
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="freshman">Freshman</option>
                <option value="sophomore">Sophomore</option>
                <option value="junior">Junior</option>
                <option value="senior">Senior</option>
                <option value="graduate">Graduate Student</option>
                <option value="other">Other</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {saving ? 'Saving...' : 'Complete Profile'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-neutral-500">
              This information helps us provide a more personalized, supportive experience
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}