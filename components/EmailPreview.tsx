'use client'

import React, { useDeferredValue, useState, useRef, useEffect } from 'react'
import { startTour } from '@/lib/tour'
import type { EmailData, EmailBlock, BlockContent } from '@/types/email'
import { HeroHeader } from './blocks/HeroHeader'
import { StatsBar } from './blocks/StatsBar'
import { DarkBanner } from './blocks/DarkBanner'
import { ProblemTable } from './blocks/ProblemTable'
import { FeatureList } from './blocks/FeatureList'
import { ProcessFlow } from './blocks/ProcessFlow'
import { BeforeAfter } from './blocks/BeforeAfter'
import { CalloutBlock } from './blocks/CalloutBlock'
import { WhatsNext } from './blocks/WhatsNext'
import { Changelog } from './blocks/Changelog'
import { DataTable } from './blocks/DataTable'
import { SignOff } from './blocks/SignOff'
import type {
  StatsBarContent, ProblemTableContent, FeatureListContent, ProcessFlowContent,
  DarkBannerContent, BeforeAfterContent, CalloutContent, WhatsNextContent,
  ChangelogContent, DataTableContent,
} from '@/types/email'

interface Props {
  emailData: EmailData | null
  parts: 1 | 2 | 3
  logoBase64: string
  onUpdateBlock: (idx: number, content: BlockContent) => void
  onUpdateTopLevel: (field: string, value: string) => void
  onUpdateCTA: (field: 'label' | 'url', value: string) => void
  onUpdateSignoff: (field: 'closing' | 'name', value: string) => void
  onRegenerate: () => void
}

export function EmailPreview({
  emailData,
  parts,
  logoBase64,
  onUpdateBlock,
  onUpdateTopLevel,
  onUpdateCTA,
  onUpdateSignoff,
  onRegenerate,
}: Props) {
  const deferredData = useDeferredValue(emailData)
  const [ctaPopoverOpen, setCtaPopoverOpen] = useState(false)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ctaPopoverOpen) return
    const handler = (e: MouseEvent) => {
      if (ctaRef.current && !ctaRef.current.contains(e.target as Node)) {
        setCtaPopoverOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ctaPopoverOpen])

  if (!deferredData) {
    return (
      <div
        style={{
          width: 800,
          minWidth: 800,
          margin: '0 auto',
          background: '#fff',
          borderRadius: 8,
          padding: '60px 36px',
          textAlign: 'center',
          color: '#9ca3af',
          fontFamily: 'var(--font-inter), Arial, sans-serif',
          fontSize: 14,
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 12 }}>✉</div>
        <p>Your email will appear here after generation</p>
      </div>
    )
  }

  // Group blocks by part number
  const partGroups: Record<number, EmailBlock[]> = {}
  for (let i = 1; i <= parts; i++) partGroups[i] = []

  deferredData.blocks.forEach(block => {
    const p = Math.min(Math.max(block.part, 1), parts)
    partGroups[p].push(block)
  })

  // CTA and signoff go in their specified part
  const ctaPart    = Math.min(Math.max(deferredData.cta.part, 1), parts)
  const signoffPart = Math.min(Math.max(deferredData.signoff.part, 1), parts)

  const blockIndexMap = new Map<EmailBlock, number>()
  deferredData.blocks.forEach((b, i) => blockIndexMap.set(b, i))

  function renderBlock(block: EmailBlock) {
    const idx = deferredData!.blocks.indexOf(block)
    switch (block.type) {
      case 'stats_bar':
        return <StatsBar key={idx} content={block.content as StatsBarContent} heading={block.heading} onUpdate={c => onUpdateBlock(idx, c)} />
      case 'problem_table':
        return <ProblemTable key={idx} content={block.content as ProblemTableContent} heading={block.heading} onUpdate={c => onUpdateBlock(idx, c)} />
      case 'feature_list':
        return <FeatureList key={idx} content={block.content as FeatureListContent} heading={block.heading} onUpdate={c => onUpdateBlock(idx, c)} />
      case 'process_flow':
        return <ProcessFlow key={idx} content={block.content as ProcessFlowContent} heading={block.heading} onUpdate={c => onUpdateBlock(idx, c)} />
      case 'dark_banner':
        return <DarkBanner key={idx} content={block.content as DarkBannerContent} heading={block.heading} onUpdate={c => onUpdateBlock(idx, c)} />
      case 'before_after':
        return <BeforeAfter key={idx} content={block.content as BeforeAfterContent} heading={block.heading} onUpdate={c => onUpdateBlock(idx, c)} />
      case 'callout':
        return <CalloutBlock key={idx} content={block.content as CalloutContent} heading={block.heading} onUpdate={c => onUpdateBlock(idx, c)} />
      case 'whats_next':
        return <WhatsNext key={idx} content={block.content as WhatsNextContent} heading={block.heading} onUpdate={c => onUpdateBlock(idx, c)} />
      case 'changelog':
        return <Changelog key={idx} content={block.content as ChangelogContent} heading={block.heading} onUpdate={c => onUpdateBlock(idx, c)} />
      case 'data_table':
        return <DataTable key={idx} content={block.content as DataTableContent} heading={block.heading} onUpdate={c => onUpdateBlock(idx, c)} />
      default:
        return null
    }
  }

  const isStale = deferredData !== emailData

  return (
    <div style={{ position: 'relative', opacity: isStale ? 0.6 : 1, transition: 'opacity 0.2s' }}>
      {/* Toolbar — Regenerate + Tour */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <button
          onClick={startTour}
          style={{
            background: 'none',
            border: '1px solid var(--ui-border)',
            borderRadius: 6,
            padding: '6px 14px',
            fontSize: 12,
            color: 'var(--ui-text-muted)',
            cursor: 'pointer',
            fontFamily: 'var(--font-inter), Arial, sans-serif',
          }}
        >
          Take a tour ?
        </button>
        <button
          onClick={() => {
            if (confirm('This will replace your current email and edits. Continue?')) {
              onRegenerate()
            }
          }}
          style={{
            background: 'none',
            border: '1px solid var(--ui-border)',
            borderRadius: 6,
            padding: '6px 14px',
            fontSize: 12,
            color: 'var(--ui-text-secondary)',
            cursor: 'pointer',
            fontFamily: 'var(--font-inter), Arial, sans-serif',
          }}
        >
          ✦ Regenerate
        </button>
      </div>

      {/* Email preview root — CSS vars live here */}
      <div
        id="email-preview-root"
        style={{
          width: 800,
          minWidth: 800,
          maxWidth: 800,
          background: 'var(--email-bg, #ffffff)',
          boxSizing: 'border-box',
          fontFamily: 'var(--email-font)',
          fontSize: 'var(--email-font-size)',
          lineHeight: 1.6,
          color: '#1a1a2e',
        }}
      >
        {Array.from({ length: parts }, (_, pi) => pi + 1).map(partNum => (
          <React.Fragment key={partNum}>
            {partNum > 1 && (
              <div
                key={`sep-${partNum}`}
                style={{
                  height: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  color: 'var(--ui-text-muted)',
                  letterSpacing: '0.1em',
                  userSelect: 'none',
                }}
              >
                ── Part {partNum} ──
              </div>
            )}
          <div
            id={`part-${partNum}`}
            style={{
              padding: 36,
              background: 'var(--email-bg, #ffffff)',
              overflow: 'hidden',
              borderBottom: 'none',
            }}
          >
            {/* Hero and intro only in part 1 */}
            {partNum === 1 && (
              <>
                <HeroHeader
                  emoji={deferredData.emoji}
                  title={deferredData.title}
                  subtitle={deferredData.subtitle}
                  pillBadge={deferredData.pillBadge}
                  logoBase64={logoBase64}
                  onUpdate={fields => {
                    if (fields.emoji)     onUpdateTopLevel('emoji', fields.emoji)
                    if (fields.title)     onUpdateTopLevel('title', fields.title)
                    if (fields.subtitle)  onUpdateTopLevel('subtitle', fields.subtitle)
                    if (fields.pillBadge) onUpdateTopLevel('pillBadge', fields.pillBadge)
                  }}
                />

                <div
                  className="email-block"
                  style={{ marginBottom: 24, fontFamily: 'var(--email-font)', fontSize: 'var(--email-font-size)', lineHeight: 1.6, color: '#1a1a2e' }}
                >
                  <p contentEditable suppressContentEditableWarning onBlur={e => onUpdateTopLevel('greeting', e.currentTarget.textContent ?? '')} style={{ fontWeight: 600, marginBottom: 6, outline: 'none', cursor: 'text' }}>
                    {deferredData.greeting}
                  </p>
                  <p contentEditable suppressContentEditableWarning onBlur={e => onUpdateTopLevel('intro', e.currentTarget.textContent ?? '')} style={{ outline: 'none', cursor: 'text' }}>
                    {deferredData.intro}
                  </p>
                </div>
              </>
            )}

            {/* Blocks for this part */}
            {(partGroups[partNum] || []).map(block => renderBlock(block))}

            {/* CTA */}
            {partNum === ctaPart && (
              <div className="email-block" style={{ marginBottom: 24, textAlign: 'center' }}>
                <div ref={ctaRef} style={{ position: 'relative', display: 'inline-block' }}>
                  {/* URL popover */}
                  {ctaPopoverOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 'calc(100% + 8px)',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#fff',
                        border: '1px solid var(--ui-border)',
                        borderRadius: 8,
                        padding: 12,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                        width: 280,
                        zIndex: 50,
                        textAlign: 'left',
                      }}
                    >
                      <label
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          color: 'var(--ui-text-secondary)',
                          display: 'block',
                          marginBottom: 6,
                          fontFamily: 'var(--font-inter), Arial, sans-serif',
                        }}
                      >
                        Link URL
                      </label>
                      <input
                        type="url"
                        defaultValue={deferredData.cta.url}
                        placeholder="https://..."
                        onBlur={e => onUpdateCTA('url', e.target.value)}
                        autoFocus
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          fontSize: 13,
                          border: '1px solid var(--ui-border)',
                          borderRadius: 6,
                          outline: 'none',
                          fontFamily: 'var(--font-inter), Arial, sans-serif',
                          boxSizing: 'border-box',
                          color: 'var(--ui-text-primary)',
                        }}
                      />
                      <p
                        style={{
                          marginTop: 6,
                          fontSize: 11,
                          color: 'var(--ui-text-muted)',
                          fontFamily: 'var(--font-inter), Arial, sans-serif',
                        }}
                      >
                        Click outside to save and close
                      </p>
                    </div>
                  )}

                  {/* Button label (contenteditable) */}
                  <a
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => onUpdateCTA('label', e.currentTarget.textContent ?? '')}
                    style={{
                      display: 'inline-block',
                      background: 'var(--email-primary-start)',
                      color: '#ffffff',
                      padding: '12px 24px',
                      borderRadius: 6,
                      fontWeight: 600,
                      textDecoration: 'none',
                      cursor: 'text',
                      outline: 'none',
                      fontFamily: 'var(--email-font)',
                      fontSize: 'var(--email-font-size)',
                    }}
                  >
                    {deferredData.cta.label}
                  </a>

                  {/* URL edit trigger */}
                  <div
                    onClick={() => setCtaPopoverOpen(o => !o)}
                    style={{
                      marginTop: 6,
                      fontSize: 11,
                      color: 'var(--ui-text-muted)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-inter), Arial, sans-serif',
                      userSelect: 'none',
                    }}
                  >
                    ↗ {deferredData.cta.url || '#'}
                  </div>
                </div>
              </div>
            )}

            {/* Sign-off */}
            {partNum === signoffPart && (
              <SignOff
                closing={deferredData.signoff.closing}
                name={deferredData.signoff.name}
                onUpdate={fields => {
                  if (fields.closing !== undefined) onUpdateSignoff('closing', fields.closing)
                  if (fields.name    !== undefined) onUpdateSignoff('name', fields.name)
                }}
              />
            )}
          </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
