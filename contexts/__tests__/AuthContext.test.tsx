import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, renderHook } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { ReactNode } from 'react'

vi.mock('@/lib/supabase')

describe('AuthContext', () => {
  const mockSession = {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    },
    access_token: 'test-token',
    refresh_token: 'refresh-token',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('AuthProvider', () => {
    it('provides authentication context to children', async () => {
      ;(supabase.auth.getSession as any).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })
      ;(supabase.auth.onAuthStateChange as any).mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      })
      ;(supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { profile_completed: true },
              error: null,
            }),
          }),
        }),
      })

      const TestComponent = () => {
        const { user } = useAuth()
        return <div>{user?.email || 'No user'}</div>
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('test@example.com')).toBeInTheDocument()
      })
    })

    it('handles no session', async () => {
      ;(supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null,
      })
      ;(supabase.auth.onAuthStateChange as any).mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      })

      const TestComponent = () => {
        const { user, loading } = useAuth()
        return (
          <div>
            {loading ? 'Loading' : user ? 'Has user' : 'No user'}
          </div>
        )
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('No user')).toBeInTheDocument()
      })
    })

    it('sets loading state correctly', async () => {
      let resolveSession: any
      ;(supabase.auth.getSession as any).mockReturnValue(
        new Promise(resolve => {
          resolveSession = resolve
        })
      )
      ;(supabase.auth.onAuthStateChange as any).mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      })

      const TestComponent = () => {
        const { loading } = useAuth()
        return <div>{loading ? 'Loading' : 'Not loading'}</div>
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByText('Loading')).toBeInTheDocument()

      resolveSession({ data: { session: null }, error: null })

      await waitFor(() => {
        expect(screen.getByText('Not loading')).toBeInTheDocument()
      })
    })

    it('checks profile setup status', async () => {
      ;(supabase.auth.getSession as any).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })
      ;(supabase.auth.onAuthStateChange as any).mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      })
      ;(supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' },
            }),
          }),
        }),
      })

      const TestComponent = () => {
        const { needsProfileSetup } = useAuth()
        return <div>{needsProfileSetup ? 'Needs setup' : 'Profile complete'}</div>
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Needs setup')).toBeInTheDocument()
      })
    })

    it('handles auth state changes', async () => {
      let authChangeCallback: any
      ;(supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null,
      })
      ;(supabase.auth.onAuthStateChange as any).mockImplementation((callback) => {
        authChangeCallback = callback
        return {
          data: { subscription: { unsubscribe: vi.fn() } },
        }
      })

      const TestComponent = () => {
        const { user } = useAuth()
        return <div>{user?.email || 'No user'}</div>
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByText('No user')).toBeInTheDocument()

      // Simulate auth state change
      await authChangeCallback('SIGNED_IN', mockSession)

      await waitFor(() => {
        expect(screen.getByText('test@example.com')).toBeInTheDocument()
      })
    })

    it('unsubscribes from auth changes on unmount', () => {
      const unsubscribe = vi.fn()
      ;(supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null,
      })
      ;(supabase.auth.onAuthStateChange as any).mockReturnValue({
        data: { subscription: { unsubscribe } },
      })

      const { unmount } = render(
        <AuthProvider>
          <div>Test</div>
        </AuthProvider>
      )

      unmount()

      expect(unsubscribe).toHaveBeenCalled()
    })
  })

  describe('useAuth hook', () => {
    it('throws error when used outside AuthProvider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useAuth())
      }).toThrow('useAuth must be used within an AuthProvider')

      consoleError.mockRestore()
    })

    it('provides signOut function', async () => {
      ;(supabase.auth.getSession as any).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })
      ;(supabase.auth.onAuthStateChange as any).mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      })
      ;(supabase.auth.signOut as any).mockResolvedValue({ error: null })
      ;(supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { profile_completed: true },
              error: null,
            }),
          }),
        }),
      })

      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.user).toBeTruthy()
      })

      await result.current.signOut()

      expect(supabase.auth.signOut).toHaveBeenCalled()
    })

    it('provides refreshProfile function', async () => {
      ;(supabase.auth.getSession as any).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })
      ;(supabase.auth.onAuthStateChange as any).mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      })

      const mockProfileQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { profile_completed: false },
              error: null,
            }),
          }),
        }),
      }

      ;(supabase.from as any).mockReturnValue(mockProfileQuery)

      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.needsProfileSetup).toBe(false)
      })

      // Update mock to return profile completed
      mockProfileQuery.select().eq().single.mockResolvedValueOnce({
        data: { profile_completed: true },
        error: null,
      })

      await result.current.refreshProfile()

      await waitFor(() => {
        expect(result.current.needsProfileSetup).toBe(false)
      })
    })
  })
})