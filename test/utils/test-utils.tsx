import { ReactElement, ReactNode, createContext } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { User } from '@supabase/supabase-js'

// Create a mock AuthContext since the real one might not be available in test environment
const AuthContext = createContext<any>(null)

// Mock user for testing
export const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as User

// Mock AuthContext provider
interface MockAuthProviderProps {
  children: ReactNode
  user?: User | null
  loading?: boolean
  needsProfileSetup?: boolean
}

export function MockAuthProvider({
  children,
  user = mockUser,
  loading = false,
  needsProfileSetup = false,
}: MockAuthProviderProps) {
  const mockSignOut = async () => {}
  const mockRefreshProfile = async () => {}

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        needsProfileSetup,
        signOut: mockSignOut,
        refreshProfile: mockRefreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  {
    user = mockUser,
    loading = false,
    needsProfileSetup = false,
    ...renderOptions
  }: RenderOptions & Partial<MockAuthProviderProps> = {}
) => {
  return render(
    <MockAuthProvider user={user} loading={loading} needsProfileSetup={needsProfileSetup}>
      {ui}
    </MockAuthProvider>,
    renderOptions
  )
}

export * from '@testing-library/react'
export { customRender as render }

// Helper to create mock assignments
export const createMockAssignment = (overrides = {}) => ({
  id: 'test-assignment-id',
  user_id: 'test-user-id',
  course: 'Test Course',
  title: 'Test Assignment',
  description: 'Test description',
  due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
  priority: 'medium' as const,
  completed: false,
  completed_at: null,
  created_at: new Date().toISOString(),
  ...overrides,
})

// Helper to create mock check-in data
export const createMockCheckin = (overrides = {}) => ({
  mood: 7,
  energy: 6,
  focus: 8,
  notes: 'Test check-in',
  ...overrides,
})