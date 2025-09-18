import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  AuthContext: vi.fn(),
  AuthProvider: ({ children }: any) => children,
  useAuth: () => ({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
    },
    loading: false,
    needsProfileSetup: false,
    signOut: vi.fn(),
    refreshProfile: vi.fn(),
  }),
}))

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(() => ({
            limit: vi.fn(),
          })),
        })),
        order: vi.fn(() => ({
          limit: vi.fn(),
        })),
      })),
      insert: vi.fn(),
      update: vi.fn(() => ({
        eq: vi.fn(),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(),
      })),
      upsert: vi.fn(),
    })),
  },
  getUserAssignments: vi.fn(() => Promise.resolve([])),
  saveAssignment: vi.fn(() => Promise.resolve()),
  updateAssignment: vi.fn(() => Promise.resolve()),
  deleteAssignment: vi.fn(() => Promise.resolve()),
  completeAssignment: vi.fn(() => Promise.resolve()),
  getProgressStats: vi.fn(() => Promise.resolve({
    checkins: 0,
    completed: 0,
    wins: 0,
  })),
  saveCheckin: vi.fn(() => Promise.resolve()),
  getUserProfile: vi.fn(() => Promise.resolve(null)),
  updateUserProfile: vi.fn(() => Promise.resolve()),
  getLastCheckinTime: vi.fn(() => Promise.resolve(null)),
}))