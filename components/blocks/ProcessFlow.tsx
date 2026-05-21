'use client'

import React from 'react'
import type { ProcessFlowContent, ProcessStep } from '@/types/email'

interface Props {
  content: ProcessFlowContent
  heading: string | null
  onUpdate: (c: ProcessFlowContent) => void
}

export function ProcessFlow({ content, heading, onUpdate }: Props) {
  if (!content?.steps?.length) return null

  function updateStep(idx: number, field: keyof ProcessStep, value: string) {
    const steps = content.steps.map((step, i) =>
      i === idx ? { ...step, [field]: value } : step
    )
    onUpdate({ steps })
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

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        {content.steps.map((step, i) => (
          <React.Fragment key={i}>
            <div
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '16px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
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
                style={{ fontWeight: 600, marginBottom: 4, cursor: 'text', outline: 'none', color: '#1a1a2e' }}
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
