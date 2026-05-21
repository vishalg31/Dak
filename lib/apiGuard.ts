import { NextRequest } from 'next/server'

// Server-side input cap — matches client-side MAX_CHARS, prevents token stuffing
export const MAX_CONTENT_CHARS = 8_000

function buildAllowedOrigins(): string[] {
  const origins: string[] = []

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    origins.push(process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, ''))
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    origins.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
  }

  if (origins.length === 0) {
    origins.push('https://dak.vishalbuilds.com')
  }

  return origins
}

export function isAllowedOrigin(req: NextRequest): boolean {
  if (process.env.NODE_ENV !== 'production') return true
  const origin = req.headers.get('origin') ?? req.headers.get('referer') ?? ''
  return buildAllowedOrigins().some(allowed => origin.startsWith(allowed))
}

export function originDenied() {
  return new Response(JSON.stringify({ error: 'Forbidden' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  })
}
