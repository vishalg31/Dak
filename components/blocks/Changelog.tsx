'use client'

import type { ChangelogContent } from '@/types/email'

interface Props {
  content: ChangelogContent
  heading: string | null
  onUpdate: (c: ChangelogContent) => void
}

export function Changelog({ content, heading, onUpdate }: Props) {
  if (!content?.versions?.length) return null

  function updateVersionLabel(vIdx: number, value: string) {
    const versions = content.versions.map((v, i) =>
      i === vIdx ? { ...v, label: value } : v
    )
    onUpdate({ versions })
  }

  function updateVersionItem(vIdx: number, iIdx: number, value: string) {
    const versions = content.versions.map((v, vi) => {
      if (vi !== vIdx) return v
      const items = v.items.map((item, ii) => (ii === iIdx ? value : item))
      return { ...v, items }
    })
    onUpdate({ versions })
  }

  return (
    <div className="email-block" style={{ marginBottom: 24 }}>
      {heading && (
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            borderBottom: '2px solid var(--email-accent)',
            display: 'inline-block',
            paddingBottom: 5,
            marginBottom: 14,
            fontFamily: 'var(--email-font)',
            color: 'var(--email-text, #1a1a2e)',
          }}
        >
          {heading}
        </div>
      )}

      {content.versions.map((version, vi) => (
        <div
          key={vi}
          style={{
            borderLeft: '4px solid var(--block-border, var(--email-accent, #d97706))',
            background: 'var(--block-bg, var(--email-card-bg, #fffbf0))',
            padding: '12px 16px',
            borderRadius: '0 8px 8px 0',
            marginBottom: 12,
          }}
        >
          <div
            style={{
              display: 'inline-block',
              fontSize: 11,
              fontWeight: 700,
              background: 'var(--email-accent, #d97706)',
              color: '#fff',
              borderRadius: 12,
              padding: '2px 10px',
              marginBottom: 8,
            }}
          >
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={e => updateVersionLabel(vi, e.currentTarget.textContent ?? '')}
              style={{ outline: 'none', cursor: 'text' }}
            >
              {version.label}
            </span>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {version.items.map((item, ii) => (
              <li
                key={ii}
                style={{
                  padding: '3px 0 3px 16px',
                  position: 'relative',
                  fontSize: 'var(--email-font-size)',
                  fontFamily: 'var(--email-font)',
                  color: 'var(--email-text, #1a1a2e)',
                }}
              >
                <span style={{ position: 'absolute', left: 0, color: 'var(--email-accent, #d97706)' }}>▸</span>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => updateVersionItem(vi, ii, e.currentTarget.textContent ?? '')}
                  style={{ outline: 'none', cursor: 'text' }}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
