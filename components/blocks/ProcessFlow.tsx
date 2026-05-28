'use client'

import React, { useState, useRef, useEffect } from 'react'
import type { ProcessFlowContent, ProcessStep, BlockStyle } from '@/types/email'

interface Props {
  content: ProcessFlowContent
  heading: string | null
  onUpdate: (c: ProcessFlowContent) => void
}

export function ProcessFlow({ content, heading, onUpdate }: Props) {
  if (!content?.steps?.length) return null

  const [hovered, setHovered]     = useState(false)
  const [showStyle, setShowStyle] = useState(false)
  const wrapRef                   = useRef<HTMLDivElement>(null)

  const style      = content.style ?? {}
  const bg         = style.bg          ?? '#ffffff'
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

  function updateStep(idx: number, field: keyof ProcessStep, value: string) {
    const steps = content.steps.map((step, i) =>
      i === idx ? { ...step, [field]: value } : step
    )
    onUpdate({ ...content, steps })
  }

  return (
    <div
      ref={wrapRef}
      className="email-block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', marginBottom: 24 }}
    >
      {/* Style button */}
      {(hovered || showStyle) && (
        <button
          onMouseDown={e => { e.stopPropagation(); setShowStyle(v => !v) }}
          title="Style block"
          style={{
            position: 'absolute', top: heading ? -2 : -10, right: -2,
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
          position: 'absolute', top: (heading ? 20 : 16), right: -2,
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
            Card style
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--ui-text-secondary)', flex: 1 }}>Background</span>
            <input type="color" value={bg}
              onChange={e => updateStyle({ bg: e.target.value })}
              style={{ width: 32, height: 24, border: 'none', cursor: 'pointer', borderRadius: 3 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--ui-text-secondary)', flex: 1 }}>Border colour</span>
            <input type="color" value={borderColor}
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

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        {content.steps.map((step, i) => (
          <React.Fragment key={i}>
            <div
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '16px 12px',
                border: computedBorder,
                borderRadius: 8,
                background: bg,
                fontFamily: 'var(--email-font)',
                fontSize: 'var(--email-font-size)',
              }}
            >
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={e => updateStep(i, 'icon', e.currentTarget.textContent ?? '')}
                style={{ fontSize: 24, marginBottom: 8, cursor: 'text', outline: 'none' }}
              >
                {step.icon}
              </div>
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={e => updateStep(i, 'title', e.currentTarget.textContent ?? '')}
                style={{ fontWeight: 600, marginBottom: 4, cursor: 'text', outline: 'none', color: 'var(--email-text, #1a1a2e)' }}
              >
                {step.title}
              </div>
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={e => updateStep(i, 'description', e.currentTarget.textContent ?? '')}
                style={{ fontSize: 12, color: '#6b7280', cursor: 'text', outline: 'none' }}
              >
                {step.description}
              </div>
            </div>
            {i < content.steps.length - 1 && (
              <div
                style={{
                  color: 'var(--email-accent)',
                  fontSize: 18,
                  alignSelf: 'center',
                  flexShrink: 0,
                }}
              >
                →
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
