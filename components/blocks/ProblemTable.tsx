'use client'

import type { ProblemTableContent, ProblemRow } from '@/types/email'

interface Props {
  content: ProblemTableContent
  heading: string | null
  onUpdate: (c: ProblemTableContent) => void
}

export function ProblemTable({ content, heading, onUpdate }: Props) {
  if (!content?.rows?.length) return null

  function updateRow(idx: number, field: keyof ProblemRow, value: string) {
    const rows = content.rows.map((row, i) =>
      i === idx ? { ...row, [field]: value } : row
    )
    onUpdate({ rows })
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
            <th
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
              Problem
            </th>
            <th
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
              Impact
            </th>
          </tr>
        </thead>
        <tbody>
          {content.rows.map((row, i) => (
            <tr key={i}>
              <td
                style={{
                  background: i % 2 === 0 ? '#fff' : '#f9fafb',
                  borderBottom: '1px solid #e5e7eb',
                  padding: '10px 14px',
                  fontFamily: 'var(--email-font)',
                  fontSize: 'var(--email-font-size)',
                  color: '#1a1a2e',
                }}
              >
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => updateRow(i, 'problem', e.currentTarget.textContent ?? '')}
                  style={{ outline: 'none', cursor: 'text' }}
                >
                  {row.problem}
                </span>
              </td>
              <td
                style={{
                  background: i % 2 === 0 ? '#fff' : '#f9fafb',
                  borderBottom: '1px solid #e5e7eb',
                  padding: '10px 14px',
                  fontFamily: 'var(--email-font)',
                  fontSize: 'var(--email-font-size)',
                  color: '#1a1a2e',
                }}
              >
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => updateRow(i, 'impact', e.currentTarget.textContent ?? '')}
                  style={{ outline: 'none', cursor: 'text' }}
                >
                  {row.impact}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
