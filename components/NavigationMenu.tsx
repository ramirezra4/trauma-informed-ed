'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface NavigationMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function NavigationMenu({ isOpen, onClose }: NavigationMenuProps) {
  const router = useRouter()
  const { user, signOut } = useAuth()

  const handleNavigation = (path: string) => {
    router.push(path)
    onClose()
  }

  const handleSignOut = async () => {
    await signOut()
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            <div>
              <h2 className="text-lg font-display text-primary-600">Menu</h2>
              <p className="text-sm text-neutral-600">{user?.email}</p>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => handleNavigation('/')}
              className="w-full flex items-center px-4 py-3 text-left text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
            >
              <span className="mr-3 text-lg">🏠</span>
              <div>
                <div className="font-medium">Home</div>
                <div className="text-sm text-neutral-500">Dashboard and check-ins</div>
              </div>
            </button>

            <button
              onClick={() => handleNavigation('/planning')}
              className="w-full flex items-center px-4 py-3 text-left text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
            >
              <span className="mr-3 text-lg">📋</span>
              <div>
                <div className="font-medium">Planning</div>
                <div className="text-sm text-neutral-500">Goals and progress tracking</div>
              </div>
            </button>

            <button
              onClick={() => handleNavigation('/settings')}
              className="w-full flex items-center px-4 py-3 text-left text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
            >
              <span className="mr-3 text-lg">⚙️</span>
              <div>
                <div className="font-medium">Settings</div>
                <div className="text-sm text-neutral-500">Profile, account, and security</div>
              </div>
            </button>

            <hr className="my-4 border-neutral-200" />

            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-3 text-left text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
            >
              <span className="mr-3 text-lg">👋</span>
              <div>
                <div className="font-medium">Sign Out</div>
                <div className="text-sm text-neutral-500">End your session</div>
              </div>
            </button>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-neutral-200">
            <p className="text-xs text-neutral-500 text-center">
              Take care of yourself. You're doing great.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}