'use client'

import { getResetTimeLocal, type UsageStatus } from '@/lib/checkUsage'

interface Props {
  status: UsageStatus | null
}

export function RateLimitBar({ status }: Props) {
  if (!status || status.status === 'ok') {
    return (
      <p style={{ fontSize: 12, color: 'var(--ui-text-muted)', marginBottom: 8, marginTop: 0 }}>
        {status?.remainingToday ?? '-'} generation{status?.remainingToday !== 1 ? 's' : ''} remaining today
      </p>
    )
  }

  if (status.status === 'warning') {
    return (
      <div
        style={{
          background: 'var(--ui-accent-light)',
          border: '1px solid var(--ui-accent)',
          borderRadius: 6,
          padding: '8px 12px',
          marginBottom: 8,
          fontSize: 12,
          color: 'var(--ui-accent)',
        }}
      >
        {status.remainingToday} generation{status.remainingToday !== 1 ? 's' : ''} left today. Resets at {getResetTimeLocal()}.
      </div>
    )
  }

  return (
    <div
      style={{
        background: 'var(--ui-accent-light)',
        border: '1px solid var(--ui-accent)',
        borderRadius: 6,
        padding: '8px 12px',
        marginBottom: 8,
        fontSize: 12,
        color: 'var(--ui-accent)',
      }}
    >
      Daily limit reached. Come back after {getResetTimeLocal()}. Your cached emails are saved.
    </div>
  )
}
