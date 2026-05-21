'use client'

import { useEffect, useState } from 'react'
import { checkUsage, getResetTimeLocal, type UsageStatus } from '@/lib/checkUsage'

export function HomepageUsage() {
  const [status, setStatus] = useState<UsageStatus | null>(null)

  useEffect(() => {
    const today      = new Date().toISOString().slice(0, 10)
    const storedId   = localStorage.getItem('dak_session_id')
    const storedDate = localStorage.getItem('dak_session_date')
    const sessionId  = (storedId && storedDate === today) ? storedId : null
    if (!sessionId) return
    checkUsage(sessionId).then(setStatus)
  }, [])

  if (!status) return null

  if (status.status === 'blocked') {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          color: 'var(--ui-accent)',
          background: 'var(--ui-accent-light)',
          border: '1px solid var(--ui-accent)',
          borderRadius: 20,
          padding: '5px 14px',
          marginBottom: 16,
          fontFamily: 'var(--font-inter), Arial, sans-serif',
        }}
      >
        <span>⚠</span>
        Daily limit reached. Resets at {getResetTimeLocal()}.
      </div>
    )
  }

  if (status.status === 'warning') {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          color: 'var(--ui-accent)',
          background: 'var(--ui-accent-light)',
          border: '1px solid var(--ui-accent)',
          borderRadius: 20,
          padding: '5px 14px',
          marginBottom: 16,
          fontFamily: 'var(--font-inter), Arial, sans-serif',
        }}
      >
        <span style={{ opacity: 0.7 }}>✦</span>
        {status.remainingToday} generation{status.remainingToday !== 1 ? 's' : ''} left today
      </div>
    )
  }

  // ok — show subtle remaining count
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        color: 'var(--ui-text-muted)',
        background: 'var(--ui-surface)',
        border: '1px solid var(--ui-border)',
        borderRadius: 20,
        padding: '5px 14px',
        marginBottom: 16,
        fontFamily: 'var(--font-inter), Arial, sans-serif',
      }}
    >
      <span style={{ opacity: 0.6 }}>✦</span>
      {status.remainingToday} free generation{status.remainingToday !== 1 ? 's' : ''} remaining today
    </div>
  )
}
