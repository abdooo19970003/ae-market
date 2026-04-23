import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from './lib/auth/auth.middleware'

// This function can be marked async if using await inside
export function middleware(request: NextRequest) {
  // Middleware logic goes here
  console.log('Middleware called')
  authMiddleware(request)
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}
