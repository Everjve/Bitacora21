import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Auth protection is handled client-side in app/app/layout.tsx
// Admin route protection is handled client-side in app/admin/layout.tsx
export async function middleware(req: NextRequest) {
  return NextResponse.next()
}

export const config = { matcher: ['/app/:path*', '/admin/:path*'] }
