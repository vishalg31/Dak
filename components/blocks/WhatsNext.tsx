'use client'

import type { WhatsNextContent, WhatsNextItem } from '@/types/email'

interface Props {
  content: WhatsNextContent
  heading: string | null
  onUpdate: (c: WhatsNextContent) => void
}

const TIMELINE_COLORS = ['#16a34a', '#d97706', '#2563eb']

export function WhatsNext({ content, heading, onUpdate }: Props) {
  if (!content?.items?.length) return null

  function updateItem(idx: number, field: keyof WhatsNextItem, value: string) {
    const items = content.items.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    )
    onUpdate({ ...content, items })
  }

  const isBullets = content.style === 'bullets'

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
            color: '#1a1a2e',
          }}
        >
          {heading}
        </div>
      )}

      {isBullets ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {content.items.map((item, i) => (
            <li
              key={i}
              style={{
                marginBottom: 10,
                paddingLeft: 20,
                position: 'relative',
                fontFamily: 'var(--email-font)',
                fontSize: 'var(--email-font-size)',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  color: 'var(--email-accent)',
                  fontWeight: 700,
                }}
              >
                ▸
              </span>
              <strong
                contentEditable
                suppressContentEditableWarning
                onBlur={e => updateItem(i, 'title', e.currentTarget.textContent ?? '')}
                style={{ color: '#1a1a2e', cursor: 'text', outline: 'none' }}
              >
                {item.title}
              </strong>
              {item.description && (
                <>
                  {' — '}
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => updateItem(i, 'description', e.currentTarget.textContent ?? '')}
                    style={{ color: '#374151', cursor: 'text', outline: 'none' }}
                  >
                    {item.description}
                  </span>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(content.items.length, 3)}, 1fr)`,
            gap: 16,
          }}
        >
          {content.items.map((item, i) => (
            <div
              key={i}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: 20,
                textAlign: 'center',
                fontFamily: 'var(--email-font)',
              }}
            >
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={e => updateItem(i, 'title', e.currentTarget.textContent ?? '')}
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: TIMELINE_COLORS[i % TIMELINE_COLORS.length],
                  marginBottom: 6,
                  cursor: 'text',
                  outline: 'none',
                }}
              >
                {item.title}
              </div>
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={e => updateItem(i, 'description', e.currentTarget.textContent ?? '')}
                style={{ fontSize: 13, color: '#6b7280', cursor: 'text', outline: 'none' }}
              >
                {item.description}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
