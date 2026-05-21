'use client'

import type { StatsBarContent, StatsItem } from '@/types/email'

interface Props {
  content: StatsBarContent
  heading: string | null
  onUpdate: (c: StatsBarContent) => void
}

export function StatsBar({ content, heading, onUpdate }: Props) {
  if (!content?.items?.length) return null

  function updateItem(idx: number, field: keyof StatsItem, value: string) {
    const items = content.items.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    )
    onUpdate({ items })
  }

  return (
    <div
      className="email-block"
      style={{
        background: '#f0f4f8',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        padding: '18px 14px',
        display: 'flex',
        marginBottom: 24,
      }}
    >
      {content.items.map((item, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            textAlign: 'center',
            borderRight: i < content.items.length - 1 ? '1px solid #e2e8f0' : 'none',
            padding: '0 8px',
          }}
        >
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={e => updateItem(i, 'value', e.currentTarget.textContent ?? '')}
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#1a1a2e',
              cursor: 'text',
              outline: 'none',
              fontFamily: 'var(--email-font)',
            }}
          >
            {item.value}
          </div>
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={e => updateItem(i, 'label', e.currentTarget.textContent ?? '')}
            style={{
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: '#6b7280',
              cursor: 'text',
              outline: 'none',
              fontFamily: 'var(--email-font)',
            }}
          >
            {item.label}
          </div>
          {item.sublabel && (
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={e => updateItem(i, 'sublabel', e.currentTarget.textContent ?? '')}
              style={{
                fontSize: 12,
                color: '#9ca3af',
                marginTop: 2,
                cursor: 'text',
                outline: 'none',
                fontFamily: 'var(--email-font)',
              }}
            >
              {item.sublabel}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
