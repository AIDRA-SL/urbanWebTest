import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_PATH = process.env.ADMIN_PATH ?? 'panel-x7k2mq'
const SESSION_COOKIE = '__session_id'
const UTM_COOKIE = '__utm'

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Always pass pathname to Server Components via header
  const response = NextResponse.next({
    request: {
      headers: new Headers({
        ...Object.fromEntries(request.headers.entries()),
        'x-pathname': pathname,
      }),
    },
  })

  // ── 1. Admin path guard (lightweight — full auth in layout.tsx) ───
  if (pathname.startsWith(`/${ADMIN_PATH}`)) {
    const isLoginPage = pathname === `/${ADMIN_PATH}/login`

    if (!isLoginPage) {
      // Check for Better Auth session cookie (any of the possible names)
      const hasSession =
        request.cookies.has('better-auth.session_token') ||
        request.cookies.has('__Secure-better-auth.session_token')

      if (!hasSession) {
        const loginUrl = new URL(`/${ADMIN_PATH}/login`, request.url)
        return NextResponse.redirect(loginUrl)
      }
    }

    return response
  }

  // ── 2. UTM capture for store pages ────────────────────────────────
  const utmSource = searchParams.get('utm_source')
  if (utmSource) {
    const utmData = {
      source: utmSource,
      medium: searchParams.get('utm_medium'),
      campaign: searchParams.get('utm_campaign'),
    }
    response.cookies.set(UTM_COOKIE, JSON.stringify(utmData), {
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })
  }

  // ── 3. Ensure anonymous session ID exists ─────────────────────────
  if (!request.cookies.has(SESSION_COOKIE)) {
    // Generate a simple random ID without nanoid (Edge compatible)
    const id = crypto.randomUUID().replace(/-/g, '')
    response.cookies.set(SESSION_COOKIE, id, {
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|uploads/).*)',
  ],
}
