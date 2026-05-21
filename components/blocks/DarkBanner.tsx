'use client'

import type { DarkBannerContent, StatsItem } from '@/types/email'

interface Props {
  content: DarkBannerContent
  heading: string | null
  onUpdate: (c: DarkBannerContent) => void
}

export function DarkBanner({ content, heading, onUpdate }: Props) {
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
        background: 'linear-gradient(135deg, var(--email-primary-start), var(--email-primary-end))',
        borderRadius: 8,
        padding: 24,
        marginBottom: 24,
      }}
    >
      {heading && (
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.6)',
            marginBottom: 16,
            fontFamily: 'var(--email-font)',
          }}
        >
          {heading}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {content.items.map((item, i) => (
          <div
            key={i}
            style={{
              flex: '1 1 120px',
              background: 'rgba(255,255,255,0.12)',
              borderRadius: 8,
              padding: 16,
              color: '#fff',
              textAlign: 'center',
            }}
          >
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={e => updateItem(i, 'value', e.currentTarget.textContent ?? '')}
              style={{
                fontSize: 22,
                fontWeight: 700,
                marginBottom: 4,
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
                color: 'rgba(255,255,255,0.7)',
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
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.5)',
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
    </div>
  )
}
