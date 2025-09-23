import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      await supabase.auth.exchangeCodeForSession(code)

      // Redirect to dashboard after successful confirmation
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } catch (error) {
      console.error('Error exchanging code for session:', error)

      // Redirect to auth page with error
      return NextResponse.redirect(
        new URL('/auth?message=Error confirming email. Please try again.', request.url)
      )
    }
  }

  // If no code, redirect to auth page
  return NextResponse.redirect(new URL('/auth', request.url))
}