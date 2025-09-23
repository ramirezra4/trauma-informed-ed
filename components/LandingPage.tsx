'use client'

import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="px-6 py-4 border-b border-neutral-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-display text-primary-600 font-bold">Base</h1>
          <div className="flex items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/auth"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-6xl font-display text-neutral-800 mb-6">
            Academic support that
            <span className="text-primary-600"> gets you</span>
          </h2>
          <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Plan assignments, break them up, and build momentum—without overwhelm.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <Link
                href="/dashboard"
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-md text-lg transition-colors"
              >
                Continue Your Journey
              </Link>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-md text-lg transition-colors"
                >
                  Start Free
                </Link>
                <p className="text-sm text-neutral-500">
                  No pressure, no tracking, just support when you need it
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-display text-neutral-800 text-center mb-12">
            Built for how you actually learn
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <h4 className="text-xl font-semibold text-neutral-800 mb-3">Gentle Progress</h4>
              <p className="text-neutral-600">
                Track assignments and check-ins at your own pace. No shame, no pressure — just steady growth.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧠</span>
              </div>
              <h4 className="text-xl font-semibold text-neutral-800 mb-3">Trauma-Informed</h4>
              <p className="text-neutral-600">
                Every feature is designed with understanding of how trauma affects learning and daily life.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h4 className="text-xl font-semibold text-neutral-800 mb-3">Private & Safe</h4>
              <p className="text-neutral-600">
                Your data stays yours. No selling information, no invasive tracking — just a safe space to grow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-display text-neutral-800 text-center mb-8">
            Why Base exists
          </h3>
          <div className="bg-white rounded-lg p-8 shadow-sm border border-neutral-200">
            <p className="text-lg text-neutral-700 leading-relaxed mb-6">
              Traditional academic tools assume everyone learns the same way. They're built for productivity,
              optimization, and "getting things done" — but what if your brain doesn't work that way?
            </p>
            <p className="text-lg text-neutral-700 leading-relaxed mb-6">
              Base was created for students who need something different. Whether you're managing trauma,
              anxiety, depression, ADHD, or just feeling overwhelmed by traditional academic pressure —
              this is a space designed with your reality in mind.
            </p>
            <p className="text-lg text-neutral-700 leading-relaxed">
              Here, progress isn't about perfection. It's about showing up for yourself,
              one small step at a time. Because you deserve support that actually supports you.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-6 py-16 bg-primary-50">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-3xl font-display text-neutral-800 mb-6">
            Ready to try a different approach?
          </h3>
          <p className="text-xl text-neutral-600 mb-8">
            Join students who are building momentum with compassion, not pressure.
          </p>
          {user ? (
            <div>
              <Link
                href="/dashboard"
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-md text-lg transition-colors inline-block"
              >
                Back to Your Dashboard
              </Link>
              <p className="text-sm text-neutral-500 mt-4">Welcome back! 👋</p>
            </div>
          ) : (
            <div>
              <Link
                href="/auth"
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-md text-lg transition-colors inline-block"
              >
                Get Started Free
              </Link>
              <div className="mt-6 text-sm text-neutral-500 space-y-1">
                <p>✓ No credit card required</p>
                <p>✓ Your data stays private</p>
                <p>✓ Cancel anytime (but we hope you'll stay)</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-neutral-200 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-neutral-600">
            Built with care for students who need academic support that actually supports them.
          </p>
          <p className="text-sm text-neutral-500 mt-2">
            BASE - Trauma-informed academic support
          </p>
        </div>
      </footer>
    </div>
  )
}