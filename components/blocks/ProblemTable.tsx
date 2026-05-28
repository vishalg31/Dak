'use client'

import { useState } from 'react'
import type { ProblemTableContent, ProblemRow } from '@/types/email'

interface Props {
  content: ProblemTableContent
  heading: string | null
  onUpdate: (c: ProblemTableContent) => void
  onUpdateHeading?: (heading: string | null) => void
  isHovered?: boolean
}

export function ProblemTable({ content, heading, onUpdate, onUpdateHeading, isHovered }: Props) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  const hasVariants = !!(content.variants && content.variants.length > 0)
  const activeIndex = content.activeVariant ?? 0
  const activeContent = hasVariants ? content.variants![activeIndex] : { label: 'Table', rows: content.rows ?? [] }
  const isList = activeContent.rows.every(r => !r.impact)

  if (!activeContent.rows.length && !hasVariants) return null

  function updateRow(idx: number, field: keyof ProblemRow, value: string) {
    const rows = activeContent.rows.map((row, i) => i === idx ? { ...row, [field]: value } : row)
    if (hasVariants) {
      const variants = content.variants!.map((v, i) => i === activeIndex ? { ...v, rows } : v)
      onUpdate({ ...content, variants })
    } else {
      onUpdate({ ...content, rows })
    }
  }

  function addRow() {
    const newRow: ProblemRow = isList
      ? { problem: 'New problem', impact: null as unknown as string }
      : { problem: 'New problem', impact: 'Impact here' }
    const rows = [...activeContent.rows, newRow]
    if (hasVariants) {
      const variants = content.variants!.map((v, i) => i === activeIndex ? { ...v, rows } : v)
      onUpdate({ ...content, variants })
    } else {
      onUpdate({ ...content, rows })
    }
  }

  function removeRow(idx: number) {
    if (activeContent.rows.length <= 1) return
    const rows = activeContent.rows.filter((_, i) => i !== idx)
    if (hasVariants) {
      const variants = content.variants!.map((v, i) => i === activeIndex ? { ...v, rows } : v)
      onUpdate({ ...content, variants })
    } else {
      onUpdate({ ...content, rows })
    }
  }

  return (
    <div
      className="email-block"
      style={{ marginBottom: 24, position: 'relative' }}
      onMouseLeave={() => setHoveredRow(null)}
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

      {isList ? (
        /* List variant */
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {activeContent.rows.map((row, i) => (
            <li
              key={i}
              style={{ marginBottom: 10, paddingLeft: 20, paddingRight: 20, position: 'relative', fontFamily: 'var(--email-font)', fontSize: 'var(--email-font-size)' }}
              onMouseEnter={() => setHoveredRow(i)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <span style={{ position: 'absolute', left: 0, color: 'var(--email-accent)', fontWeight: 700 }}>▸</span>
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={e => updateRow(i, 'problem', e.currentTarget.textContent ?? '')}
                style={{ color: 'var(--email-text, #1a1a2e)', cursor: 'text', outline: 'none' }}
              >
                {row.problem}
              </span>
              {activeContent.rows.length > 1 && (
                <button
                  onClick={() => removeRow(i)}
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    opacity: hoveredRow === i ? 1 : 0,
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
        /* Table variant */
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Problem', 'Impact'].map(col => (
                <th
                  key={col}
                  style={{
                    background: 'var(--block-bg, var(--email-primary-start))',
                    color: '#fff',
                    padding: '10px 14px',
                    textAlign: 'left',
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontFamily: 'var(--email-font)',
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeContent.rows.map((row, i) => (
              <tr
                key={i}
                onMouseEnter={() => setHoveredRow(i)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{ position: 'relative' }}
              >
                <td style={{ background: i % 2 === 0 ? 'var(--email-bg, #fff)' : 'var(--block-row-bg, var(--email-card-bg, #f9fafb))', borderBottom: '1px solid var(--block-border, var(--email-card-bg, #e5e7eb))', padding: '10px 14px', fontFamily: 'var(--email-font)', fontSize: 'var(--email-font-size)', color: 'var(--email-text, #1a1a2e)', position: 'relative' }}>
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => updateRow(i, 'problem', e.currentTarget.textContent ?? '')}
                    style={{ outline: 'none', cursor: 'text' }}
                  >
                    {row.problem}
                  </span>
                </td>
                <td style={{ background: i % 2 === 0 ? 'var(--email-bg, #fff)' : 'var(--block-row-bg, var(--email-card-bg, #f9fafb))', borderBottom: '1px solid var(--block-border, var(--email-card-bg, #e5e7eb))', padding: '10px 14px', fontFamily: 'var(--email-font)', fontSize: 'var(--email-font-size)', color: 'var(--email-text, #1a1a2e)', position: 'relative' }}>
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => updateRow(i, 'impact', e.currentTarget.textContent ?? '')}
                    style={{ outline: 'none', cursor: 'text' }}
                  >
                    {row.impact}
                  </span>
                  {activeContent.rows.length > 1 && (
                    <button
                      onClick={() => removeRow(i)}
                      style={{
                        position: 'absolute',
                        right: 4,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        opacity: hoveredRow === i ? 1 : 0,
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isHovered && (
        <button
          onClick={addRow}
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
