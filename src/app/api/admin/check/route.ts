import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth, isAdminSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!isAdminSession(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return NextResponse.json({ ok: true })
}
