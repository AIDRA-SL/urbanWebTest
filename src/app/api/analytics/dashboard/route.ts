import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth, isAdminSession } from '@/lib/auth'
import {
  getDashboardStats,
  getTrafficSources,
  getDailyRevenue,
  getGeographicData,
} from '@/lib/analytics-server'

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!isAdminSession(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const days = Number(request.nextUrl.searchParams.get('days') ?? 30)

  const [stats, traffic, revenue, geo] = await Promise.all([
    getDashboardStats(),
    getTrafficSources(days),
    getDailyRevenue(days),
    getGeographicData(),
  ])

  return NextResponse.json({ stats, traffic, revenue, geo })
}
