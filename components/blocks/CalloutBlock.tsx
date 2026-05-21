'use client'

import type { CalloutContent } from '@/types/email'

interface Props {
  content: CalloutContent
  heading: string | null
  onUpdate: (c: CalloutContent) => void
}

export function CalloutBlock({ content, heading, onUpdate }: Props) {
  return (
    <div
      className="email-block"
      style={{
        borderLeft: '4px solid var(--email-accent)',
        background: '#fffbf0',
        padding: '14px 16px',
        borderRadius: '0 8px 8px 0',
        margin: '16px 0 24px',
        fontFamily: 'var(--email-font)',
        fontSize: 'var(--email-font-size)',
        color: '#1a1a2e',
        lineHeight: 1.6,
      }}
    >
      <span
        contentEditable
        suppressContentEditableWarning
        onBlur={e => onUpdate({ ...content, text: e.currentTarget.textContent ?? '' })}
        style={{ outline: 'none', cursor: 'text' }}
      >
        {content.text}
      </span>
    </div>
  )
}
