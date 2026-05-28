'use client'

import { useState } from 'react'
import type { FeatureListContent, FeatureItem } from '@/types/email'

interface Props {
  content: FeatureListContent
  heading: string | null
  onUpdate: (c: FeatureListContent) => void
  onUpdateHeading?: (heading: string | null) => void
  isHovered?: boolean
}

export function FeatureList({ content, heading, onUpdate, onUpdateHeading, isHovered }: Props) {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null)

  const hasVariants = !!(content.variants && content.variants.length > 0)
  const activeIndex = content.activeVariant ?? 0
  const activeContent = hasVariants ? content.variants![activeIndex] : { items: content.items ?? [] }

  if (!activeContent.items.length && !hasVariants) return null

  function updateItem(idx: number, field: keyof FeatureItem, value: string) {
    const items = activeContent.items.map((item, i) => i === idx ? { ...item, [field]: value } : item)
    if (hasVariants) {
      const variants = content.variants!.map((v, i) => i === activeIndex ? { ...v, items } : v)
      onUpdate({ ...content, variants })
    } else {
      onUpdate({ ...content, items })
    }
  }

  function addItem() {
    const items = [...activeContent.items, { title: 'New item', description: '' }]
    if (hasVariants) {
      const variants = content.variants!.map((v, i) => i === activeIndex ? { ...v, items } : v)
      onUpdate({ ...content, variants })
    } else {
      onUpdate({ ...content, items })
    }
  }

  function removeItem(idx: number) {
    if (activeContent.items.length <= 1) return
    const items = activeContent.items.filter((_, i) => i !== idx)
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

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {activeContent.items.map((item, i) => (
          <li
            key={i}
            style={{ marginBottom: 12, paddingLeft: 20, paddingRight: 20, position: 'relative', fontFamily: 'var(--email-font)', fontSize: 'var(--email-font-size)' }}
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
            {activeContent.items.length > 1 && (
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
