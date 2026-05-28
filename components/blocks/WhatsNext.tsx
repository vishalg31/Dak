'use client'

import { useState } from 'react'
import type { WhatsNextContent, WhatsNextItem } from '@/types/email'

interface Props {
  content: WhatsNextContent
  heading: string | null
  onUpdate: (c: WhatsNextContent) => void
  onUpdateHeading?: (heading: string | null) => void
  isHovered?: boolean
}

const TIMELINE_COLORS = ['#16a34a', '#d97706', '#2563eb']

export function WhatsNext({ content, heading, onUpdate, onUpdateHeading, isHovered }: Props) {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null)

  const hasVariants = !!(content.variants && content.variants.length > 0)
  const activeIndex = content.activeVariant ?? 0
  const activeVariant = hasVariants ? content.variants![activeIndex] : null
  const activeItems: WhatsNextItem[] = activeVariant ? activeVariant.items : (content.items ?? [])
  const activeStyle = activeVariant ? activeVariant.style : (content.style ?? 'bullets')

  if (!activeItems.length && !hasVariants) return null

  function updateItem(idx: number, field: keyof WhatsNextItem, value: string) {
    const items = activeItems.map((item, i) => i === idx ? { ...item, [field]: value } : item)
    if (hasVariants) {
      const variants = content.variants!.map((v, i) => i === activeIndex ? { ...v, items } : v)
      onUpdate({ ...content, variants })
    } else {
      onUpdate({ ...content, items })
    }
  }

  function addItem() {
    const items = [...activeItems, { title: 'New item', description: '' }]
    if (hasVariants) {
      const variants = content.variants!.map((v, i) => i === activeIndex ? { ...v, items } : v)
      onUpdate({ ...content, variants })
    } else {
      onUpdate({ ...content, items })
    }
  }

  function removeItem(idx: number) {
    if (activeItems.length <= 1) return
    const items = activeItems.filter((_, i) => i !== idx)
    if (hasVariants) {
      const variants = content.variants!.map((v, i) => i === activeIndex ? { ...v, items } : v)
      onUpdate({ ...content, variants })
    } else {
      onUpdate({ ...content, items })
    }
  }

  return (
    <div
      className="email-block"
      style={{ marginBottom: 24, position: 'relative' }}
      onMouseLeave={() => setHoveredItem(null)}
    >
      {heading && (
        <div style={{
          fontSize: 16,
          fontWeight: 700,
          borderBottom: '2px solid var(--email-accent)',
          display: 'inline-block',
          paddingBottom: 5,
          marginBottom: 14,
          fontFamily: 'var(--email-font)',
          color: 'var(--email-text, #1a1a2e)',
        }}>
          <span
            contentEditable
            suppressContentEditableWarning
            onBlur={e => onUpdateHeading?.(e.currentTarget.textContent ?? heading)}
            style={{ outline: 'none', cursor: 'text' }}
          >
            {heading}
          </span>
        </div>
      )}

      {activeStyle === 'bullets' ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {activeItems.map((item, i) => (
            <li
              key={i}
              style={{ marginBottom: 10, paddingLeft: 20, paddingRight: 20, position: 'relative', fontFamily: 'var(--email-font)', fontSize: 'var(--email-font-size)' }}
              onMouseEnter={() => setHoveredItem(i)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span style={{ position: 'absolute', left: 0, color: 'var(--email-accent)', fontWeight: 700 }}>▸</span>
              <strong
                contentEditable
                suppressContentEditableWarning
                onBlur={e => updateItem(i, 'title', e.currentTarget.textContent ?? '')}
                style={{ color: 'var(--email-text, #1a1a2e)', cursor: 'text', outline: 'none' }}
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
              {activeItems.length > 1 && (
                <button
                  onClick={() => removeItem(i)}
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    opacity: hoveredItem === i ? 1 : 0,
                    transition: 'opacity 150ms',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--ui-text-muted)',
                    fontSize: 16,
                    padding: '0 2px',
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(activeItems.length, 3)}, 1fr)`, gap: 16 }}>
          {activeItems.map((item, i) => (
            <div
              key={i}
              style={{ border: '1px solid var(--block-border, var(--email-card-bg, #e2e8f0))', background: 'var(--block-bg, transparent)', borderRadius: 8, padding: 20, textAlign: 'center', fontFamily: 'var(--email-font)', position: 'relative' }}
              onMouseEnter={() => setHoveredItem(i)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={e => updateItem(i, 'title', e.currentTarget.textContent ?? '')}
                style={{ fontSize: 24, fontWeight: 700, color: TIMELINE_COLORS[i % TIMELINE_COLORS.length], marginBottom: 6, cursor: 'text', outline: 'none' }}
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
              {activeItems.length > 1 && (
                <button
                  onClick={() => removeItem(i)}
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    opacity: hoveredItem === i ? 1 : 0,
                    transition: 'opacity 150ms',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--ui-text-muted)',
                    fontSize: 16,
                    padding: '0 2px',
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {isHovered && (
        <button
          onClick={addItem}
          style={{
            width: '100%',
            padding: '6px',
            marginTop: 4,
            background: 'none',
            border: '1px dashed var(--ui-border)',
            borderRadius: 4,
            fontSize: 12,
            color: 'var(--ui-text-muted)',
            cursor: 'pointer',
            fontFamily: 'var(--font-inter), Arial, sans-serif',
          }}
        >
          + Add item
        </button>
      )}
    </div>
  )
}
