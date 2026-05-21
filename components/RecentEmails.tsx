'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { db, type GenerationRecord } from '@/lib/db'
import { timeAgo } from '@/lib/utils'

export function RecentEmails() {
  const router = useRouter()
  const [records, setRecords]         = useState<GenerationRecord[]>([])
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => {
    db.generations.orderBy('createdAt').reverse().limit(5).toArray().then(setRecords)
  }, [])

  if (records.length === 0) return null

  function handleOpen(record: GenerationRecord) {
    localStorage.setItem('dak_restore', JSON.stringify({ hash: record.hash }))
    router.push('/create')
  }

  async function handleDelete(hash: string) {
    await db.generations.delete(hash)
    setRecords(prev => prev.filter(r => r.hash !== hash))
    setConfirmDelete(null)
  }

  const templateLabel = (t: string) => t === 'launch' ? 'Launch' : 'Progress Update'

  return (
    <div style={{ width: '100%', maxWidth: 560, marginTop: 48 }}>
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color: 'var(--ui-text-muted)',
          marginBottom: 10,
        }}
      >
        Recent emails
      </p>

      <div
        style={{
          background: 'var(--ui-surface)',
          border: '1px solid var(--ui-border)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        {records.map((r, i) => (
          <div
            key={r.hash}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              borderBottom: i < records.length - 1 ? '1px solid var(--ui-border)' : 'none',
              gap: 10,
            }}
          >
            {/* Emoji */}
            <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1 }}>{r.emoji ?? '✉'}</span>

            {/* Title + meta */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--ui-text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: 3,
                }}
              >
                {r.title ?? 'Untitled'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: 'var(--ui-primary)',
                    background: 'rgba(27,58,107,0.08)',
                    padding: '1px 6px',
                    borderRadius: 4,
                  }}
                >
                  {templateLabel(r.template)}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: 'var(--ui-text-muted)',
                    background: 'var(--ui-bg)',
                    padding: '1px 6px',
                    borderRadius: 4,
                    border: '1px solid var(--ui-border)',
                  }}
                >
                  {r.parts ?? 2} part{(r.parts ?? 2) !== 1 ? 's' : ''}
                </span>
                <span style={{ fontSize: 11, color: 'var(--ui-text-muted)' }}>
                  {timeAgo(r.createdAt)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              {confirmDelete === r.hash ? (
                <button
                  onClick={() => handleDelete(r.hash)}
                  style={{
                    fontSize: 11,
                    color: 'var(--ui-accent)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    fontWeight: 600,
                    fontFamily: 'var(--font-inter), Arial, sans-serif',
                  }}
                >
                  Delete?
                </button>
              ) : (
                <button
                  onClick={() => setConfirmDelete(r.hash)}
                  onBlur={() => setConfirmDelete(null)}
                  style={{
                    fontSize: 11,
                    color: 'var(--ui-text-muted)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    fontFamily: 'var(--font-inter), Arial, sans-serif',
                  }}
                >
                  Delete
                </button>
              )}
              <button
                onClick={() => handleOpen(r)}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--ui-primary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  fontFamily: 'var(--font-inter), Arial, sans-serif',
                }}
              >
                Open →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
