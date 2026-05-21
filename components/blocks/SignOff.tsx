'use client'

import type { EmailData } from '@/types/email'

interface Props {
  closing: string
  name: string
  onUpdate: (fields: { closing?: string; name?: string }) => void
}

export function SignOff({ closing, name, onUpdate }: Props) {
  return (
    <div
      className="email-block"
      style={{
        marginBottom: 24,
        paddingTop: 16,
        borderTop: '1px solid #e5e7eb',
        fontFamily: 'var(--email-font)',
        fontSize: 'var(--email-font-size)',
        color: '#1a1a2e',
      }}
    >
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={e => onUpdate({ closing: e.currentTarget.textContent ?? '' })}
        style={{ marginBottom: 4, cursor: 'text', outline: 'none' }}
      >
        {closing || 'Warm Regards,'}
      </div>
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={e => onUpdate({ name: e.currentTarget.textContent ?? '' })}
        style={{ fontWeight: 600, cursor: 'text', outline: 'none', minHeight: 20 }}
      >
        {name}
      </div>
    </div>
  )
}
