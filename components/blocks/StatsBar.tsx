'use client'

import { useState, useRef, useEffect } from 'react'
import type { StatsBarContent, StatsItem, BlockStyle } from '@/types/email'

interface Props {
  content: StatsBarContent
  heading: string | null
  onUpdate: (c: StatsBarContent) => void
}

export function StatsBar({ content, heading, onUpdate }: Props) {
  if (!content?.items?.length) return null

  const [hovered, setHovered]       = useState(false)
  const [showStyle, setShowStyle]   = useState(false)
  const wrapRef                     = useRef<HTMLDivElement>(null)

  const style      = content.style ?? {}
  const bg         = style.bg          ?? '#f0f4f8'
  const borderColor= style.borderColor ?? '#e2e8f0'
  const borderStyle= style.borderStyle ?? 'solid'

  const computedBorder = borderStyle === 'none'
    ? 'none'
    : `1px ${borderStyle} ${borderColor}`

  useEffect(() => {
    if (!showStyle) return
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowStyle(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [showStyle])

  function updateStyle(patch: Partial<BlockStyle>) {
    onUpdate({ ...content, style: { ...style, ...patch } })
  }

  function updateItem(idx: number, field: keyof StatsItem, value: string) {
    const items = content.items.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    )
    onUpdate({ ...content, items })
  }

  return (
    <div
      ref={wrapRef}
      className="email-block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); if (!showStyle) {} }}
      style={{ position: 'relative', marginBottom: 24 }}
    >
      {/* Style button */}
      {(hovered || showStyle) && (
        <button
          onMouseDown={e => { e.stopPropagation(); setShowStyle(v => !v) }}
          title="Style block"
          style={{
            position: 'absolute', top: -10, right: -2,
            width: 26, height: 22,
            borderRadius: 5,
            background: showStyle ? 'var(--ui-primary)' : 'var(--ui-surface)',
            border: '1px solid var(--ui-border)',
            cursor: 'pointer',
            fontSize: 11,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10,
            color: showStyle ? '#fff' : 'var(--ui-text-secondary)',
            fontWeight: 600,
          }}
        >
          ✦
        </button>
      )}

      {/* Style popover */}
      {showStyle && (
        <div style={{
          position: 'absolute', top: 16, right: -2,
          background: 'var(--ui-surface)',
          border: '1px solid var(--ui-border)',
          borderRadius: 8,
          padding: '10px 12px',
          zIndex: 50,
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          display: 'flex', flexDirection: 'column', gap: 10,
          minWidth: 170,
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ui-text-secondary)' }}>
            Block style
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--ui-text-secondary)', flex: 1 }}>Background</span>
            <input type="color" value={bg}
              onChange={e => updateStyle({ bg: e.target.value })}
              style={{ width: 32, height: 24, border: 'none', cursor: 'pointer', borderRadius: 3 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--ui-text-secondary)', flex: 1 }}>Border colour</span>
            <input type="color" value={borderColor === 'transparent' ? '#e2e8f0' : borderColor}
              onChange={e => updateStyle({ borderColor: e.target.value })}
              style={{ width: 32, height: 24, border: 'none', cursor: 'pointer', borderRadius: 3 }} />
          </div>
          <div>
            <span style={{ fontSize: 12, color: 'var(--ui-text-secondary)', display: 'block', marginBottom: 5 }}>Border style</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['none', 'solid', 'dashed'] as const).map(bs => (
                <button key={bs} onClick={() => updateStyle({ borderStyle: bs })}
                  style={{
                    flex: 1, padding: '4px 0',
                    border: `1px solid ${borderStyle === bs ? 'var(--ui-primary)' : 'var(--ui-border)'}`,
                    borderRadius: 4,
                    background: borderStyle === bs ? 'var(--ui-primary)' : 'var(--ui-surface)',
                    color: borderStyle === bs ? '#fff' : 'var(--ui-text-secondary)',
                    fontSize: 10, fontWeight: 600, cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}>
                  {bs}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Block content */}
      <div style={{
        background: bg,
        border: computedBorder,
        borderRadius: 8,
        padding: '18px 14px',
        display: 'flex',
      }}>
        {content.items.map((item, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              textAlign: 'center',
              borderRight: i < content.items.length - 1 ? `1px solid ${borderColor === '#f0f4f8' ? '#e2e8f0' : borderColor}` : 'none',
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
                color: 'var(--email-text, #1a1a2e)',
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
    </div>
  )
}
