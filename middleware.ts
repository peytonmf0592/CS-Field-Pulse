import { type NextRequest, NextResponse } from 'next/server'
// import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Temporarily disable all middleware for testing
  return NextResponse.next()
}

// Temporarily disable matcher to avoid any issues
export const config = {
  matcher: []
}