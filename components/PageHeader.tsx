'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import NavigationMenu from './NavigationMenu'

interface PageHeaderProps {
  title?: string
  showBack?: boolean
  backPath?: string
  backLabel?: string
  onBack?: () => void  // Custom back handler
}

export default function PageHeader({
  title,
  showBack = true,
  backPath = '/',
  backLabel = 'Back',
  onBack
}: PageHeaderProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleBack = () => {
    if (onBack) {
      onBack()  // Use custom handler if provided
    } else if (backPath === 'history') {
      router.back()
    } else {
      router.push(backPath)
    }
  }

  return (
    <>
      <div className={`flex items-center gap-2 ${!title ? 'mb-6' : ''}`}>
        {/* Hamburger menu button */}
        <button
          onClick={() => setMenuOpen(true)}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          aria-label="Open navigation menu"
        >
          <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Back button */}
        {showBack && (
          <button
            onClick={handleBack}
            className="flex items-center gap-1 px-3 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">{backLabel}</span>
          </button>
        )}

        {/* Page title */}
        {title && (
          <h1 className="flex-1 text-2xl font-display text-primary-600">
            {title}
          </h1>
        )}
      </div>

      {/* Navigation menu */}
      <NavigationMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}