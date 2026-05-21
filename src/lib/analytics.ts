'use client'

import type { TrackEventPayload } from '@/types/analytics'

export async function trackEvent(payload: TrackEventPayload): Promise<void> {
  try {
    await fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        pageUrl: window.location.href,
        referrer: document.referrer || undefined,
      }),
    })
  } catch {
    // Analytics failures are silent
  }
}
