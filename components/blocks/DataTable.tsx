'use client'

import type { DataTableContent } from '@/types/email'

interface Props {
  content: DataTableContent
  heading: string | null
  onUpdate: (c: DataTableContent) => void
}

const HIGHLIGHT_COLORS: Record<string, { bg: string; color: string }> = {
  green:  { bg: '#f0fff4', color: '#16a34a' },
  amber:  { bg: '#fffbf0', color: '#d97706' },
  red:    { bg: '#fff7f7', color: '#dc2626' },
}

export function DataTable({ content, heading, onUpdate }: Props) {
  if (!content?.rows?.length || !content?.columns?.length) return null

  function updateCell(rowIdx: number, cellIdx: number, value: string) {
    const rows = content.rows.map((row, ri) => {
      if (ri !== rowIdx) return row
      const cells = row.cells.map((cell, ci) => (ci === cellIdx ? value : cell))
      return { ...row, cells }
    })
    onUpdate({ ...content, rows })
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

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {content.columns.map((col, i) => (
              <th
                key={i}
                style={{
                  background: '#1a1a2e',
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
          {content.rows.map((row, ri) => {
            const hl = row.highlight ? HIGHLIGHT_COLORS[row.highlight] : null
            return (
              <tr
                key={ri}
                style={{
                  background: hl ? hl.bg : ri % 2 === 0 ? '#fff' : '#f9fafb',
                }}
              >
                {row.cells.map((cell, ci) => (
                  <td
                    key={ci}
                    style={{
                      borderBottom: '1px solid #e5e7eb',
                      padding: '10px 14px',
                      fontFamily: 'var(--email-font)',
                      fontSize: 'var(--email-font-size)',
                      color: hl ? hl.color : '#1a1a2e',
                      fontWeight: hl ? 600 : 400,
                    }}
                  >
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e => updateCell(ri, ci, e.currentTarget.textContent ?? '')}
                      style={{ outline: 'none', cursor: 'text' }}
                    >
                      {cell}
                    </span>
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
