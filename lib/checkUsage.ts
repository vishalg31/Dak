import { db } from './db'

const GENERATION_LIMIT  = parseInt(process.env.NEXT_PUBLIC_GENERATION_LIMIT ?? '15', 10)
const WARNING_THRESHOLD = 3

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10)
}

export function getResetTimeLocal(): string {
  const now      = new Date()
  const midnight = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0,
  ))
  return midnight.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export interface UsageStatus {
  status:         'ok' | 'warning' | 'blocked'
  usedToday:      number
  remainingToday: number
  limit:          number
}

export async function checkUsage(sessionId: string): Promise<UsageStatus> {
  const record    = await db.usageCounters.get(sessionId)
  const today     = todayUTC()
  const count     = (record && record.date === today) ? record.count : 0
  const remaining = Math.max(0, GENERATION_LIMIT - count)

  let status: UsageStatus['status']
  if      (remaining <= 0)                 status = 'blocked'
  else if (remaining <= WARNING_THRESHOLD) status = 'warning'
  else                                      status = 'ok'

  return { status, usedToday: count, remainingToday: remaining, limit: GENERATION_LIMIT }
}

export async function incrementUsage(sessionId: string): Promise<void> {
  const today  = todayUTC()
  const record = await db.usageCounters.get(sessionId)

  if (record && record.date === today) {
    await db.usageCounters.update(sessionId, { count: record.count + 1 })
  } else {
    // New day — reset counter
    await db.usageCounters.put({ sessionId, count: 1, date: today })
  }
}
