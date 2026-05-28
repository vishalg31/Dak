'use client'

import type { BeforeAfterContent } from '@/types/email'

interface Props {
  content: BeforeAfterContent
  heading: string | null
  onUpdate: (c: BeforeAfterContent) => void
}

export function BeforeAfter({ content, heading, onUpdate }: Props) {
  if (!content?.before || !content?.after) return null

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Before */}
        <div
          style={{
            border: '1px solid #fca5a5',
            background: '#fff7f7',
            borderRadius: 8,
            padding: 16,
          }}
        >
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={e =>
              onUpdate({ ...content, before: { ...content.before, label: e.currentTarget.textContent ?? '' } })
            }
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#dc2626',
              marginBottom: 8,
              cursor: 'text',
              outline: 'none',
              fontFamily: 'var(--email-font)',
            }}
          >
            {content.before.label}
          </div>
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={e =>
              onUpdate({ ...content, before: { ...content.before, value: e.currentTarget.textContent ?? '' } })
            }
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#dc2626',
              marginBottom: 6,
              cursor: 'text',
              outline: 'none',
              fontFamily: 'var(--email-font)',
            }}
          >
            {content.before.value}
          </div>
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={e =>
              onUpdate({ ...content, before: { ...content.before, description: e.currentTarget.textContent ?? '' } })
            }
            style={{
              fontSize: 13,
              color: '#6b7280',
              cursor: 'text',
              outline: 'none',
              fontFamily: 'var(--email-font)',
            }}
          >
            {content.before.description}
          </div>
        </div>

        {/* After */}
        <div
          style={{
            border: '1px solid #86efac',
            background: '#f0fff4',
            borderRadius: 8,
            padding: 16,
          }}
        >
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={e =>
              onUpdate({ ...content, after: { ...content.after, label: e.currentTarget.textContent ?? '' } })
            }
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#16a34a',
              marginBottom: 8,
              cursor: 'text',
              outline: 'none',
              fontFamily: 'var(--email-font)',
            }}
          >
            {content.after.label}
          </div>
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={e =>
              onUpdate({ ...content, after: { ...content.after, value: e.currentTarget.textContent ?? '' } })
            }
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#16a34a',
              marginBottom: 6,
              cursor: 'text',
              outline: 'none',
              fontFamily: 'var(--email-font)',
            }}
          >
            {content.after.value}
          </div>
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={e =>
              onUpdate({ ...content, after: { ...content.after, description: e.currentTarget.textContent ?? '' } })
            }
            style={{
              fontSize: 13,
              color: '#6b7280',
              cursor: 'text',
              outline: 'none',
              fontFamily: 'var(--email-font)',
            }}
          >
            {content.after.description}
          </div>
        </div>
      </div>
    </div>
  )
}
