'use client'

import React, { useDeferredValue, useState, useRef, useEffect } from 'react'
import { startTour } from '@/lib/tour'
import type { EmailData, EmailBlock, BlockContent, BlockType, BlockStyle } from '@/types/email'
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

// ── Block type picker ──────────────────────────────────────────────────────────

const BLOCK_OPTIONS: Array<{ type: BlockType; label: string }> = [
  { type: 'stats_bar',     label: 'Stats Bar' },
  { type: 'process_flow',  label: 'Process Flow' },
  { type: 'feature_list',  label: 'Feature List' },
  { type: 'callout',       label: 'Callout' },
  { type: 'dark_banner',   label: 'Dark Banner' },
  { type: 'before_after',  label: 'Before / After' },
  { type: 'whats_next',    label: "What's Next" },
  { type: 'changelog',     label: 'Changelog' },
  { type: 'problem_table', label: 'Problem Table' },
  { type: 'data_table',    label: 'Data Table' },
]

function InsertZone({ atIndex, part, onAdd }: {
  atIndex: number
  part: number
  onAdd: (atIndex: number, type: BlockType, part: number) => void
}) {
  const [hovered, setHovered] = useState(false)
  const [open, setOpen]       = useState(false)

  if (open) {
    return (
      <div style={{
        margin: '4px 0',
        background: 'var(--ui-surface)',
        border: '1px solid var(--ui-border)',
        borderRadius: 8,
        padding: '10px 12px',
        position: 'relative',
        zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: 'var(--ui-text-secondary)',
            fontFamily: 'var(--font-inter), Arial, sans-serif',
          }}>
            Insert block
          </span>
          <button
            onClick={() => setOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--ui-text-muted)', padding: '0 2px', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5 }}>
          {BLOCK_OPTIONS.map(opt => (
            <button
              key={opt.type}
              onClick={() => { onAdd(atIndex, opt.type, part); setOpen(false) }}
              style={{
                padding: '5px 4px',
                border: '1px solid var(--ui-border)',
                borderRadius: 5,
                background: 'var(--ui-bg)',
                cursor: 'pointer',
                fontSize: 10,
                fontWeight: 600,
                color: 'var(--ui-text-secondary)',
                textAlign: 'center',
                fontFamily: 'var(--font-inter), Arial, sans-serif',
                lineHeight: 1.3,
              }}
              onMouseEnter={e => {
                const el = e.currentTarget
                el.style.background = 'var(--ui-accent-light)'
                el.style.borderColor = 'var(--ui-primary)'
                el.style.color = 'var(--ui-primary)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget
                el.style.background = 'var(--ui-bg)'
                el.style.borderColor = 'var(--ui-border)'
                el.style.color = 'var(--ui-text-secondary)'
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      style={{ height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered ? (
        <button
          onClick={() => setOpen(true)}
          style={{
            background: 'var(--ui-surface)',
            border: '1px dashed var(--ui-border)',
            borderRadius: 12,
            padding: '2px 14px',
            fontSize: 11,
            cursor: 'pointer',
            color: 'var(--ui-text-muted)',
            fontFamily: 'var(--font-inter), Arial, sans-serif',
          }}
        >
          + insert block
        </button>
      ) : (
        <div style={{ width: '30%', height: 1, background: 'var(--ui-border)', opacity: 0.25 }} />
      )}
    </div>
  )
}

// ── Block style button + popover ───────────────────────────────────────────────

function BlockStyleButton({ show, blockStyle, onChange, showRowBg }: {
  show: boolean
  blockStyle: BlockStyle | undefined
  onChange: (s: BlockStyle) => void
  showRowBg?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref             = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (!show && !open) return null

  const style       = blockStyle ?? {}
  const bg          = style.bg          ?? '#ffffff'
  const rowBg       = style.rowBg       ?? '#f9fafb'
  const borderColor = style.borderColor ?? '#e2e8f0'
  const borderStyle = style.borderStyle ?? 'solid'

  return (
    <div ref={ref} style={{ position: 'absolute', top: -10, right: -2, zIndex: 20 }}>
      <button
        onMouseDown={e => { e.stopPropagation(); setOpen(v => !v) }}
        title="Style block"
        style={{
          width: 26, height: 22, borderRadius: 5,
          background: open ? 'var(--ui-primary)' : 'var(--ui-surface)',
          border: '1px solid var(--ui-border)',
          cursor: 'pointer', fontSize: 11,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: open ? '#fff' : 'var(--ui-text-secondary)', fontWeight: 600,
        }}
      >
        ✦
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 26, right: 0,
          background: 'var(--ui-surface)',
          border: '1px solid var(--ui-border)',
          borderRadius: 8, padding: '10px 12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          display: 'flex', flexDirection: 'column', gap: 10,
          minWidth: 170,
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ui-text-secondary)', fontFamily: 'var(--font-inter), Arial, sans-serif' }}>
            Block style
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--ui-text-secondary)', flex: 1, fontFamily: 'var(--font-inter), Arial, sans-serif' }}>{showRowBg ? 'Header colour' : 'Background'}</span>
            <input type="color" value={bg}
              onChange={e => onChange({ ...style, bg: e.target.value })}
              style={{ width: 32, height: 24, border: 'none', cursor: 'pointer', borderRadius: 3 }} />
          </div>
          {showRowBg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--ui-text-secondary)', flex: 1, fontFamily: 'var(--font-inter), Arial, sans-serif' }}>Row colour</span>
              <input type="color" value={rowBg}
                onChange={e => onChange({ ...style, rowBg: e.target.value })}
                style={{ width: 32, height: 24, border: 'none', cursor: 'pointer', borderRadius: 3 }} />
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--ui-text-secondary)', flex: 1, fontFamily: 'var(--font-inter), Arial, sans-serif' }}>Border colour</span>
            <input type="color" value={borderColor}
              onChange={e => onChange({ ...style, borderColor: e.target.value })}
              style={{ width: 32, height: 24, border: 'none', cursor: 'pointer', borderRadius: 3 }} />
          </div>
          <div>
            <span style={{ fontSize: 12, color: 'var(--ui-text-secondary)', display: 'block', marginBottom: 5, fontFamily: 'var(--font-inter), Arial, sans-serif' }}>Border style</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['none', 'solid', 'dashed'] as const).map(bs => (
                <button key={bs} onClick={() => onChange({ ...style, borderStyle: bs })}
                  style={{
                    flex: 1, padding: '4px 0',
                    border: `1px solid ${borderStyle === bs ? 'var(--ui-primary)' : 'var(--ui-border)'}`,
                    borderRadius: 4,
                    background: borderStyle === bs ? 'var(--ui-primary)' : 'var(--ui-surface)',
                    color: borderStyle === bs ? '#fff' : 'var(--ui-text-secondary)',
                    fontSize: 10, fontWeight: 600, cursor: 'pointer',
                    textTransform: 'capitalize',
                    fontFamily: 'var(--font-inter), Arial, sans-serif',
                  }}>
                  {bs}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Props ──────────────────────────────────────────────────────────────────────

interface Props {
  emailData: EmailData | null
  parts: 1 | 2 | 3
  logoBase64: string
  onUpdateBlock: (idx: number, content: BlockContent) => void
  onUpdateBlockHeading: (idx: number, heading: string | null) => void
  onUpdateTopLevel: (field: string, value: string) => void
  onUpdateCTA: (field: 'label' | 'url' | 'hidden', value: string | boolean) => void
  onUpdateSignoff: (field: 'closing' | 'name', value: string) => void
  onRegenerate: () => void
  hasEdits: boolean
  onRevert: () => void
  onRemoveBlock: (idx: number) => void
  onAddBlock: (atIndex: number, type: BlockType, part: number) => void
  onUpdateBlockStyle: (idx: number, style: BlockStyle) => void
}

// ── Component ──────────────────────────────────────────────────────────────────

export function EmailPreview({
  emailData,
  parts,
  logoBase64,
  onUpdateBlock,
  onUpdateBlockHeading,
  onUpdateTopLevel,
  onUpdateCTA,
  onUpdateSignoff,
  onRegenerate,
  hasEdits,
  onRevert,
  onRemoveBlock,
  onAddBlock,
  onUpdateBlockStyle,
}: Props) {
  const deferredData = useDeferredValue(emailData)
  const [ctaPopoverOpen, setCtaPopoverOpen]   = useState(false)
  const [ctaHovered, setCtaHovered]           = useState(false)
  const [hoveredRemoveIdx, setHoveredRemoveIdx] = useState<number | null>(null)
  const [hoveredBlockIdx, setHoveredBlockIdx]   = useState<number | null>(null)
  const savedHeadingsRef = useRef<Map<number, string>>(new Map())
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

  function handleHeadingToggle(block: EmailBlock, globalIdx: number) {
    if (block.heading) {
      savedHeadingsRef.current.set(globalIdx, block.heading)
      onUpdateBlockHeading(globalIdx, null)
    } else {
      onUpdateBlockHeading(globalIdx, savedHeadingsRef.current.get(globalIdx) ?? 'Section')
    }
  }

  const ctrlBtnBase: React.CSSProperties = {
    fontSize: 10, padding: '3px 8px', borderRadius: 20, cursor: 'pointer',
    fontFamily: 'var(--font-inter), Arial, sans-serif',
    textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.4,
  }

  function renderBlockControls(block: EmailBlock, globalIdx: number) {
    const content     = block.content as any
    const variants    = content.variants as Array<{ label: string }> | undefined
    const hasVariants = !!(variants && variants.length > 1)
    const hasToggle   = ['feature_list', 'problem_table', 'whats_next'].includes(block.type)
    const activeIndex = content.activeVariant ?? 0

    if (!hasVariants && !hasToggle) return null

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-start' }}>
        {hasToggle && (
          <button
            onClick={() => handleHeadingToggle(block, globalIdx)}
            style={{ ...ctrlBtnBase, border: '1px solid var(--ui-border)', background: 'var(--ui-surface)', color: 'var(--ui-text-muted)' }}
          >
            {block.heading ? 'Hide heading' : 'Show heading'}
          </button>
        )}
        {hasVariants && variants!.map((v, i) => (
          <button
            key={i}
            onClick={() => onUpdateBlock(globalIdx, { ...content, activeVariant: i })}
            style={{
              ...ctrlBtnBase,
              border: `1px solid ${i === activeIndex ? 'var(--ui-primary)' : 'var(--ui-border)'}`,
              background: i === activeIndex ? 'var(--ui-primary)' : 'transparent',
              color: i === activeIndex ? '#fff' : 'var(--ui-text-secondary)',
            }}
          >
            {v.label}
          </button>
        ))}
      </div>
    )
  }

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

  const ctaPart     = deferredData.cta     ? Math.min(Math.max(deferredData.cta.part, 1), parts)     : parts
  const signoffPart = deferredData.signoff ? Math.min(Math.max(deferredData.signoff.part, 1), parts) : parts

  function renderBlock(block: EmailBlock) {
    const idx = deferredData!.blocks.indexOf(block)
    switch (block.type) {
      case 'stats_bar':
        return <StatsBar key={idx} content={block.content as StatsBarContent} heading={block.heading} onUpdate={c => onUpdateBlock(idx, c)} />
      case 'problem_table':
        return <ProblemTable key={idx} content={block.content as ProblemTableContent} heading={block.heading} onUpdate={c => onUpdateBlock(idx, c)} onUpdateHeading={h => onUpdateBlockHeading(idx, h)} isHovered={hoveredRemoveIdx === idx} />
      case 'feature_list':
        return <FeatureList key={idx} content={block.content as FeatureListContent} heading={block.heading} onUpdate={c => onUpdateBlock(idx, c)} onUpdateHeading={h => onUpdateBlockHeading(idx, h)} isHovered={hoveredRemoveIdx === idx} />
      case 'process_flow':
        return <ProcessFlow key={idx} content={block.content as ProcessFlowContent} heading={block.heading} onUpdate={c => onUpdateBlock(idx, c)} />
      case 'dark_banner':
        return <DarkBanner key={idx} content={block.content as DarkBannerContent} heading={block.heading} onUpdate={c => onUpdateBlock(idx, c)} />
      case 'before_after':
        return <BeforeAfter key={idx} content={block.content as BeforeAfterContent} heading={block.heading} onUpdate={c => onUpdateBlock(idx, c)} />
      case 'callout':
        return <CalloutBlock key={idx} content={block.content as CalloutContent} heading={block.heading} onUpdate={c => onUpdateBlock(idx, c)} />
      case 'whats_next':
        return <WhatsNext key={idx} content={block.content as WhatsNextContent} heading={block.heading} onUpdate={c => onUpdateBlock(idx, c)} onUpdateHeading={h => onUpdateBlockHeading(idx, h)} isHovered={hoveredRemoveIdx === idx} />
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
    <div
      style={{ position: 'relative', opacity: isStale ? 0.6 : 1, transition: 'opacity 0.2s' }}
      onMouseLeave={() => { setHoveredBlockIdx(null); setHoveredRemoveIdx(null) }}
    >
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 8 }}>
        <button
          onClick={startTour}
          style={{
            background: 'none', border: '1px solid var(--ui-border)', borderRadius: 6,
            padding: '6px 14px', fontSize: 12, color: 'var(--ui-text-muted)', cursor: 'pointer',
            fontFamily: 'var(--font-inter), Arial, sans-serif',
          }}
        >
          Take a tour ?
        </button>
        {hasEdits && (
          <button
            onClick={() => {
              if (confirm('Revert all edits and restore the original generated email?')) onRevert()
            }}
            style={{
              background: 'none', border: '1px solid var(--ui-border)', borderRadius: 6,
              padding: '6px 14px', fontSize: 12, color: 'var(--ui-text-muted)', cursor: 'pointer',
              fontFamily: 'var(--font-inter), Arial, sans-serif',
            }}
          >
            ↩ Revert
          </button>
        )}
        <button
          onClick={() => {
            if (confirm('This will replace your current email and edits. Continue?')) onRegenerate()
          }}
          style={{
            background: 'none', border: '1px solid var(--ui-border)', borderRadius: 6,
            padding: '6px 14px', fontSize: 12, color: 'var(--ui-text-secondary)', cursor: 'pointer',
            fontFamily: 'var(--font-inter), Arial, sans-serif',
          }}
        >
          ✦ Regenerate
        </button>
      </div>

      {/* Email preview root */}
      <div
        id="email-preview-root"
        style={{
          width: 800, minWidth: 800, maxWidth: 800,
          background: 'var(--email-bg, #ffffff)',
          boxSizing: 'border-box',
          fontFamily: 'var(--email-font)',
          fontSize: 'var(--email-font-size)',
          lineHeight: 1.6,
          color: 'var(--email-text, #1a1a2e)',
        }}
      >
        {Array.from({ length: parts }, (_, pi) => pi + 1).map(partNum => (
          <React.Fragment key={partNum}>
            {partNum > 1 && (
              <div
                style={{
                  height: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: 'var(--ui-text-muted)', letterSpacing: '0.1em', userSelect: 'none',
                }}
              >
                ── Part {partNum} ──
              </div>
            )}
            <div
              id={`part-${partNum}`}
              style={{ padding: 36, background: 'var(--email-bg, #ffffff)', overflow: 'visible' }}
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
                    style={{ marginBottom: 24, fontFamily: 'var(--email-font)', fontSize: 'var(--email-font-size)', lineHeight: 1.6, color: 'var(--email-text, #1a1a2e)' }}
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

              {/* Blocks for this part — with insert zones and remove buttons */}
              {(() => {
                const blocksInPart = partGroups[partNum] || []
                const firstGlobalIdx = blocksInPart.length > 0
                  ? deferredData.blocks.indexOf(blocksInPart[0])
                  : deferredData.blocks.length

                return (
                  <>
                    <InsertZone atIndex={firstGlobalIdx} part={partNum} onAdd={onAddBlock} />
                    {blocksInPart.map(block => {
                      const globalIdx  = deferredData.blocks.indexOf(block)
                      const bs         = block.style
                      const hasBg      = !!bs?.bg
                      const hasBorder  = bs?.borderStyle !== 'none' && !!bs?.borderColor
                      const computedBorder = hasBorder
                        ? `1px ${bs!.borderStyle ?? 'solid'} ${bs!.borderColor}`
                        : undefined

                      const hasRowBg = !!bs?.rowBg

                      // CSS vars passed to children that reference --block-bg / --block-border / --block-row-bg
                      const cssVars: React.CSSProperties = {
                        ...(hasBg     ? { '--block-bg':      bs!.bg }           as React.CSSProperties : {}),
                        ...(hasBorder ? { '--block-border':  bs!.borderColor }  as React.CSSProperties : {}),
                        ...(hasRowBg  ? { '--block-row-bg':  bs!.rowBg }        as React.CSSProperties : {}),
                      }

                      // These block types consume --block-bg/--block-border on their own inner elements
                      // — applying the same styles to the outer wrapper would double-up visually
                      const applyOuterStyle = !['whats_next', 'problem_table', 'data_table', 'callout', 'changelog', 'dark_banner'].includes(block.type)

                      return (
                        <React.Fragment key={globalIdx}>
                          <div
                            style={{
                              position: 'relative',
                              ...cssVars,
                              ...(applyOuterStyle && hasBg     ? { background: bs!.bg, padding: 6, borderRadius: 8 } : {}),
                              ...(applyOuterStyle && hasBorder ? { border: computedBorder, borderRadius: 8 }          : {}),
                            }}
                            onMouseEnter={() => { setHoveredBlockIdx(globalIdx); setHoveredRemoveIdx(globalIdx) }}
                            onMouseLeave={() => setHoveredRemoveIdx(null)}
                          >
                            {/* Remove button — left side */}
                            {hoveredRemoveIdx === globalIdx && !isStale && (
                              <button
                                onClick={() => onRemoveBlock(globalIdx)}
                                title="Remove block"
                                style={{
                                  position: 'absolute', top: -8, left: -2, zIndex: 20,
                                  background: '#fff0f0', border: '1px solid #fca5a5',
                                  borderRadius: 5, padding: '2px 8px', fontSize: 10,
                                  color: '#dc2626', cursor: 'pointer',
                                  fontFamily: 'var(--font-inter), Arial, sans-serif',
                                  fontWeight: 600, letterSpacing: '0.03em',
                                }}
                              >
                                ✕ Remove
                              </button>
                            )}
                            {/* Style button — right side, not on blocks that have their own */}
                            {block.type !== 'stats_bar' && block.type !== 'process_flow' && (
                              <BlockStyleButton
                                show={hoveredRemoveIdx === globalIdx && !isStale}
                                blockStyle={block.style}
                                onChange={s => onUpdateBlockStyle(globalIdx, s)}
                                showRowBg={block.type === 'problem_table' || block.type === 'data_table'}
                              />
                            )}
                            {/* Side controls — heading toggle + variant switcher, float right of email */}
                            {hoveredBlockIdx === globalIdx && !isStale && (
                              <div style={{ position: 'absolute', top: 0, left: 'calc(100% + 10px)', zIndex: 20 }}>
                                {renderBlockControls(block, globalIdx)}
                              </div>
                            )}
                            {renderBlock(block)}
                          </div>
                          <InsertZone atIndex={globalIdx + 1} part={partNum} onAdd={onAddBlock} />
                        </React.Fragment>
                      )
                    })}
                  </>
                )
              })()}

              {/* CTA */}
              {deferredData.cta && partNum === ctaPart && (
                <div
                  className="email-block"
                  style={{ marginBottom: 24, textAlign: 'center', position: 'relative' }}
                  onMouseEnter={() => setCtaHovered(true)}
                  onMouseLeave={() => setCtaHovered(false)}
                >
                  <div style={{
                    position: 'absolute', top: 0, right: 0,
                    opacity: ctaHovered ? 1 : 0, transition: 'opacity 150ms',
                    zIndex: 10, pointerEvents: ctaHovered ? 'auto' : 'none',
                  }}>
                    <button
                      onClick={() => onUpdateCTA('hidden', !deferredData.cta.hidden)}
                      style={{
                        fontSize: 10, padding: '3px 8px', borderRadius: 20, cursor: 'pointer',
                        fontFamily: 'var(--font-inter), Arial, sans-serif',
                        textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.4,
                        border: '1px solid var(--ui-border)', background: 'var(--ui-surface)',
                        color: 'var(--ui-text-muted)',
                      }}
                    >
                      {deferredData.cta.hidden ? 'Show CTA' : 'Hide CTA'}
                    </button>
                  </div>

                  {deferredData.cta.hidden ? (
                    <div
                      data-export-hide="true"
                      style={{
                        display: 'inline-block', padding: '10px 24px',
                        border: '1px dashed var(--ui-border)', borderRadius: 6,
                        fontSize: 12, color: 'var(--ui-text-muted)',
                        fontFamily: 'var(--font-inter), Arial, sans-serif',
                      }}
                    >
                      CTA hidden
                    </div>
                  ) : (
                    <div ref={ctaRef} style={{ position: 'relative', display: 'inline-block' }}>
                      {ctaPopoverOpen && (
                        <div style={{
                          position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%',
                          transform: 'translateX(-50%)', background: '#fff',
                          border: '1px solid var(--ui-border)', borderRadius: 8,
                          padding: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                          width: 280, zIndex: 50, textAlign: 'left',
                        }}>
                          <label style={{
                            fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
                            textTransform: 'uppercase', color: 'var(--ui-text-secondary)',
                            display: 'block', marginBottom: 6,
                            fontFamily: 'var(--font-inter), Arial, sans-serif',
                          }}>
                            Link URL
                          </label>
                          <input
                            type="url"
                            defaultValue={deferredData.cta.url}
                            placeholder="https://..."
                            onBlur={e => onUpdateCTA('url', e.target.value)}
                            autoFocus
                            style={{
                              width: '100%', padding: '6px 10px', fontSize: 13,
                              border: '1px solid var(--ui-border)', borderRadius: 6,
                              outline: 'none', fontFamily: 'var(--font-inter), Arial, sans-serif',
                              boxSizing: 'border-box', color: 'var(--ui-text-primary)',
                            }}
                          />
                          <p style={{ marginTop: 6, fontSize: 11, color: 'var(--ui-text-muted)', fontFamily: 'var(--font-inter), Arial, sans-serif' }}>
                            Click outside to save and close
                          </p>
                        </div>
                      )}
                      <a
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={e => onUpdateCTA('label', e.currentTarget.textContent ?? '')}
                        style={{
                          display: 'inline-block', background: 'var(--email-primary-start)',
                          color: '#ffffff', padding: '12px 24px', borderRadius: 6,
                          fontWeight: 600, textDecoration: 'none', cursor: 'text',
                          outline: 'none', fontFamily: 'var(--email-font)',
                          fontSize: 'var(--email-font-size)',
                        }}
                      >
                        {deferredData.cta.label}
                      </a>
                      <div
                        onClick={() => setCtaPopoverOpen(o => !o)}
                        style={{
                          marginTop: 6, fontSize: 11, color: 'var(--ui-text-muted)',
                          cursor: 'pointer', fontFamily: 'var(--font-inter), Arial, sans-serif',
                          userSelect: 'none',
                        }}
                      >
                        ↗ {deferredData.cta.url || '#'}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sign-off */}
              {partNum === signoffPart && (
                <SignOff
                  closing={deferredData.signoff?.closing ?? 'Warm Regards,'}
                  name={deferredData.signoff?.name ?? ''}
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
