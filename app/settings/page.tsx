'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getUserProfile, updateUserProfile } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import PageHeader from '@/components/PageHeader'

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading: authLoading, refreshProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'password'>('profile')
  
  // Profile form state
  const [fullName, setFullName] = useState('')
  const [school, setSchool] = useState('')
  const [academicYear, setAcademicYear] = useState<'freshman' | 'sophomore' | 'junior' | 'senior' | 'graduate' | 'other'>('freshman')
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  
  // Account form state
  const [newEmail, setNewEmail] = useState('')
  const [accountLoading, setAccountLoading] = useState(false)
  const [accountError, setAccountError] = useState<string | null>(null)
  const [accountSuccess, setAccountSuccess] = useState<string | null>(null)
  
  // Password form state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  const loadProfile = useCallback(async () => {
    if (!user) return

    try {
      const profile = await getUserProfile(user.id)
      if (profile) {
        setFullName(profile.full_name || '')
        setSchool(profile.school || '')
        setAcademicYear(profile.academic_year || 'freshman')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setProfileLoading(false)
    }
  }, [user])

  // Load profile data
  useEffect(() => {
    if (user) {
      loadProfile()
      setNewEmail(user.email || '')
    }
  }, [user, loadProfile])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setProfileSaving(true)
    setProfileError(null)
    setProfileSuccess(null)

    try {
      await updateUserProfile(user.id, {
        fullName,
        school,
        academicYear
      })

      await refreshProfile()
      setProfileSuccess('Profile updated successfully!')
    } catch (err) {
      console.error('Error updating profile:', err)
      setProfileError('Failed to update profile. Please try again.')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || newEmail === user.email) return

    setAccountLoading(true)
    setAccountError(null)
    setAccountSuccess(null)

    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      })

      if (error) throw error

      setAccountSuccess('Check your new email address to confirm the change.')
    } catch (err: any) {
      console.error('Error updating email:', err)
      setAccountError(err.message || 'Failed to update email. Please try again.')
    } finally {
      setAccountLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.')
      return
    }

    setPasswordLoading(true)
    setPasswordError(null)
    setPasswordSuccess(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      setPasswordSuccess('Password updated successfully.')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      console.error('Error updating password:', err)
      setPasswordError(err.message || 'Failed to update password. Please try again.')
    } finally {
      setPasswordLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto mb-2"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-neutral-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Navigation Header */}
        <PageHeader
          showBack={true}
          backPath="/"
          backLabel="Home"
        />

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display text-primary-600 mb-2">Settings</h1>
          <p className="text-neutral-600">
            Manage your profile, account, and security preferences
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 mb-6">
          <div className="flex border-b border-neutral-200">
            {[
              { id: 'profile', label: 'Profile', icon: '👤' },
              { id: 'account', label: 'Account', icon: '✉️' },
              { id: 'password', label: 'Security', icon: '🔒' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 bg-primary-50'
                    : 'border-transparent text-neutral-600 hover:text-neutral-800'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-lg font-medium text-neutral-800 mb-6">Profile Information</h3>
                
                {profileLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent mx-auto mb-2"></div>
                    <p className="text-sm text-neutral-600">Loading profile...</p>
                  </div>
                ) : (
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
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

                    {profileError && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-sm text-red-600">{profileError}</p>
                      </div>
                    )}

                    {profileSuccess && (
                      <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <p className="text-sm text-green-600">{profileSuccess}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-medium py-2 px-4 rounded-md transition-colors"
                    >
                      {profileSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {activeTab === 'account' && (
              <div>
                <h3 className="text-lg font-medium text-neutral-800 mb-6">Account Settings</h3>
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="currentEmail" className="block text-sm font-medium text-neutral-700 mb-1">
                      Current Email
                    </label>
                    <input
                      id="currentEmail"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md bg-neutral-50 text-neutral-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="newEmail" className="block text-sm font-medium text-neutral-700 mb-1">
                      New Email Address
                    </label>
                    <input
                      id="newEmail"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  {accountError && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-sm text-red-600">{accountError}</p>
                    </div>
                  )}

                  {accountSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                      <p className="text-sm text-green-600">{accountSuccess}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={accountLoading || newEmail === user?.email}
                    className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    {accountLoading ? 'Updating...' : 'Update Email'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'password' && (
              <div>
                <h3 className="text-lg font-medium text-neutral-800 mb-6">Change Password</h3>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-neutral-700 mb-1">
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="••••••••"
                    />
                  </div>

                  {passwordError && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-sm text-red-600">{passwordError}</p>
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                      <p className="text-sm text-green-600">{passwordSuccess}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    {passwordLoading ? 'Updating...' : 'Change Password'}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-neutral-200">
                  <p className="text-xs text-neutral-500">
                    Your password must be at least 6 characters long. You'll remain signed in after changing your password.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}