'use client'

import type { FeatureListContent, FeatureItem } from '@/types/email'

interface Props {
  content: FeatureListContent
  heading: string | null
  onUpdate: (c: FeatureListContent) => void
}

export function FeatureList({ content, heading, onUpdate }: Props) {
  if (!content?.items?.length) return null

  function updateItem(idx: number, field: keyof FeatureItem, value: string) {
    const items = content.items.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    )
    onUpdate({ items })
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
            color: '#1a1a2e',
          }}
        >
          {heading}
        </div>
      )}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {content.items.map((item, i) => (
          <li
            key={i}
            style={{
              marginBottom: 12,
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
              <span style={{ color: '#374151' }}>
                {' — '}
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => updateItem(i, 'description', e.currentTarget.textContent ?? '')}
                  style={{ cursor: 'text', outline: 'none' }}
                >
                  {item.description}
                </span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
