'use client'

import { useTransition, useState, useRef, useEffect } from 'react'
import { getCachedFile, setCachedFile } from '@/lib/cache'
import { RateLimitBar } from './RateLimitBar'
import type { UsageStatus } from '@/lib/checkUsage'

interface Props {
  content: string
  onChange: (v: string) => void
  onGenerate: () => Promise<void>
  disabled: boolean
  usageStatus: UsageStatus | null
}

const MAX_CHARS = 8000
const MIN_CHARS = 50
const WARN_THRESHOLD = 7000

const MODAL_PLACEHOLDER = `Paste your raw content here. Bullet points, notes, metrics, decisions.

Include what changed, key numbers, who it impacts, and what comes next. The more context you give, the better the email.`

export function ContentInput({ content, onChange, onGenerate, disabled, usageStatus }: Props) {
  const [isPending, startTransition] = useTransition()
  const [modalOpen, setModalOpen]       = useState(false)
  const [modalMounted, setModalMounted] = useState(false)
  const [modalExiting, setModalExiting] = useState(false)
  const [draft, setDraft]               = useState('')
  const [fileName, setFileName]         = useState<string | null>(null)
  const [fileError, setFileError]       = useState<string | null>(null)
  const [fileCacheHit, setFileCacheHit] = useState(false)
  const fileInputRef                    = useRef<HTMLInputElement>(null)
  const textareaRef                     = useRef<HTMLTextAreaElement>(null)

  const charCount   = content.length
  const tooShort    = charCount > 0 && charCount < MIN_CHARS
  const tooLong     = charCount > MAX_CHARS
  const showCount   = charCount >= WARN_THRESHOLD
  const blocked     = usageStatus?.status === 'blocked'
  const canGenerate = charCount >= MIN_CHARS && !tooLong && !disabled && !isPending && !blocked

  const draftCount = draft.length
  const draftTooLong = draftCount > MAX_CHARS
  const showDraftCount = draftCount >= WARN_THRESHOLD

  useEffect(() => {
    if (!fileError) return
    const t = setTimeout(() => setFileError(null), 4000)
    return () => clearTimeout(t)
  }, [fileError])

  function openModal() {
    setDraft(content)
    setModalOpen(true)
    setModalExiting(false)
    requestAnimationFrame(() => setModalMounted(true))
  }

  function closeModal(save: boolean) {
    if (save) onChange(draft.slice(0, MAX_CHARS))
    setModalExiting(true)
    setModalMounted(false)
    setTimeout(() => {
      setModalOpen(false)
      setModalExiting(false)
    }, 180)
  }

  useEffect(() => {
    if (!modalOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modalOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleDone() {
    closeModal(true)
  }

  function handleGenerate() {
    startTransition(async () => {
      await onGenerate()
    })
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const cached = getCachedFile(file)
    if (cached !== null) {
      setDraft(cached)
      setFileName(file.name)
      setFileCacheHit(true)
      setFileError(null)
      e.target.value = ''
      return
    }

    if (file.size > 500 * 1024) {
      setFileError('File too large (500KB max)')
      e.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      let text = event.target?.result as string

      if (typeof window !== 'undefined' && (file.type === 'text/html' || file.name.endsWith('.html'))) {
        const doc = new DOMParser().parseFromString(text, 'text/html')
        text = doc.body.innerText
      }

      if (text.length > MAX_CHARS) {
        text = text.slice(0, MAX_CHARS)
        setFileError('File content trimmed to 8,000 characters')
      } else {
        setFileError(null)
      }

      setCachedFile(file, text)
      setDraft(text)
      setFileName(file.name)
      setFileCacheHit(false)
    }

    reader.readAsText(file)
    e.target.value = ''
  }

  function clearContent() {
    onChange('')
    setDraft('')
    setFileName(null)
    setFileError(null)
    setFileCacheHit(false)
  }

  const isVisible = modalMounted && !modalExiting

  return (
    <>
      {/* Sidebar trigger */}
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--ui-text-secondary)',
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            className="stamp-step active"
            style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
          >
            3
          </span>
          Your content
        </div>

        {content ? (
          /* Has content — show preview chip */
          <div
            onClick={openModal}
            style={{
              border: '1px solid var(--ui-primary)',
              borderRadius: 8,
              padding: '10px 12px',
              cursor: 'pointer',
              background: 'var(--ui-surface)',
              position: 'relative',
            }}
          >
            <p
              style={{
                fontSize: 12,
                color: 'var(--ui-text-secondary)',
                fontFamily: 'var(--font-inter), Arial, sans-serif',
                lineHeight: 1.5,
                margin: 0,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {content}
            </p>
            <div style={{
              marginTop: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 11, color: 'var(--ui-primary)', fontFamily: 'var(--font-inter), Arial, sans-serif', fontWeight: 500 }}>
                Edit content →
              </span>
              {fileName && (
                <span style={{ fontSize: 11, color: 'var(--ui-text-muted)', fontFamily: 'var(--font-inter), Arial, sans-serif' }}>
                  📄 {fileName}
                </span>
              )}
            </div>
          </div>
        ) : (
          /* Empty — show click-to-add trigger */
          <div
            onClick={openModal}
            style={{
              border: '1px dashed var(--ui-border)',
              borderRadius: 8,
              padding: '24px 16px',
              cursor: 'pointer',
              background: 'var(--ui-surface)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              transition: 'border-color 150ms, background 150ms',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--ui-primary)'
              e.currentTarget.style.background = 'color-mix(in srgb, var(--ui-primary) 4%, var(--ui-surface))'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--ui-border)'
              e.currentTarget.style.background = 'var(--ui-surface)'
            }}
          >
            <span style={{ fontSize: 22 }}>✏</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ui-text-primary)', fontFamily: 'var(--font-inter), Arial, sans-serif' }}>
              Add your content
            </span>
            <span style={{ fontSize: 11, color: 'var(--ui-text-muted)', fontFamily: 'var(--font-inter), Arial, sans-serif', textAlign: 'center' }}>
              Paste notes or upload a file
            </span>
          </div>
        )}

        {/* Validation errors shown in sidebar */}
        {tooShort && (
          <p style={{ fontSize: 12, color: 'var(--ui-accent)', marginTop: 6, fontFamily: 'var(--font-inter), Arial, sans-serif' }}>
            Add more detail so Dak can build a complete email
          </p>
        )}
        {tooLong && (
          <p style={{ fontSize: 12, color: 'var(--ui-accent)', marginTop: 6, fontFamily: 'var(--font-inter), Arial, sans-serif' }}>
            Content too long. Trim to 8,000 characters.
          </p>
        )}
        {showCount && !tooLong && (
          <div style={{ fontSize: 11, color: 'var(--ui-text-muted)', textAlign: 'right', marginTop: 4 }}>
            {charCount} / {MAX_CHARS}
          </div>
        )}

        {/* Rate limit bar + Generate button */}
        <div style={{ marginTop: 12 }}>
          <RateLimitBar status={usageStatus} />
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            style={{
              width: '100%',
              padding: '12px',
              background: canGenerate ? 'var(--ui-primary)' : '#c8c4bc',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: isPending ? 'wait' : canGenerate ? 'pointer' : 'not-allowed',
              transition: 'background 0.15s, opacity 0.15s',
              opacity: isPending ? 0.8 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isPending && <span className="dak-spinner" />}
            {isPending ? 'Generating...' : '✦ Generate Email'}
          </button>
        </div>
      </div>

      {/* Pop-out modal */}
      {modalOpen && (
        <>
          <style>{`
            .content-modal-textarea:focus { outline: none; border-color: var(--ui-primary) !important; }
          `}</style>

          {/* Backdrop */}
          <div
            onClick={() => closeModal(true)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              opacity: isVisible ? 1 : 0,
              transition: 'opacity 180ms ease',
            }}
          />

          {/* Card */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1001,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                width: 560,
                background: 'var(--ui-surface)',
                borderRadius: 16,
                padding: '36px 36px 28px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.20)',
                border: '1px solid var(--ui-border)',
                pointerEvents: 'auto',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(12px)',
                transition: 'opacity 180ms ease, transform 180ms ease',
              }}
            >
              {/* Header */}
              <div style={{ marginBottom: 20 }}>
                <p style={{
                  fontFamily: 'var(--font-fraunces), Georgia, serif',
                  fontSize: 22,
                  fontWeight: 700,
                  color: 'var(--ui-text-primary)',
                  letterSpacing: '-0.3px',
                  margin: 0,
                }}>
                  Your content
                </p>
                <p style={{
                  fontSize: 13,
                  color: 'var(--ui-text-secondary)',
                  fontFamily: 'var(--font-inter), Arial, sans-serif',
                  margin: '4px 0 0',
                }}>
                  Paste notes, bullets, or data. AI will structure it into your email.
                </p>
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                autoFocus
                className="content-modal-textarea"
                value={draft}
                onChange={e => setDraft(e.target.value.slice(0, MAX_CHARS))}
                placeholder={MODAL_PLACEHOLDER}
                style={{
                  width: '100%',
                  minHeight: 220,
                  padding: '12px 14px',
                  border: `1px solid ${draftTooLong ? 'var(--ui-accent)' : 'var(--ui-border)'}`,
                  borderRadius: 10,
                  fontSize: 13,
                  lineHeight: 1.65,
                  color: 'var(--ui-text-primary)',
                  background: 'var(--ui-bg)',
                  resize: 'vertical',
                  fontFamily: 'var(--font-inter), Arial, sans-serif',
                  transition: 'border-color 150ms',
                  boxSizing: 'border-box',
                }}
              />

              {showDraftCount && (
                <div style={{ fontSize: 11, color: draftTooLong ? 'var(--ui-accent)' : 'var(--ui-text-muted)', textAlign: 'right', marginTop: 4, fontFamily: 'var(--font-inter), Arial, sans-serif' }}>
                  {draftCount} / {MAX_CHARS}
                </div>
              )}

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--ui-border)' }} />
                <span style={{ fontSize: 11, color: 'var(--ui-text-muted)', fontFamily: 'var(--font-inter), Arial, sans-serif' }}>or upload a file</span>
                <div style={{ flex: 1, height: 1, background: 'var(--ui-border)' }} />
              </div>

              {/* Upload button */}
              <input
                type="file"
                accept=".html,.txt,.md"
                ref={fileInputRef}
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '1.5px dashed var(--ui-primary)',
                    borderRadius: 10,
                    background: 'color-mix(in srgb, var(--ui-primary) 5%, var(--ui-surface))',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'background 150ms',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--ui-primary) 10%, var(--ui-surface))')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--ui-primary) 5%, var(--ui-surface))')}
                >
                  <span style={{ fontSize: 16 }}>↑</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ui-primary)', fontFamily: 'var(--font-inter), Arial, sans-serif' }}>
                    {fileName ? `${fileName} ${fileCacheHit ? '(cached)' : '(uploaded)'}` : 'Upload .html, .txt, or .md'}
                  </span>
                </button>
                {fileName && (
                  <button
                    onClick={() => { setDraft(''); setFileName(null); setFileCacheHit(false) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ui-text-muted)', fontSize: 14, padding: 4, lineHeight: 1, flexShrink: 0 }}
                    title="Clear file"
                  >
                    ✕
                  </button>
                )}
              </div>

              {fileError && (
                <p style={{ fontSize: 12, color: 'var(--ui-accent)', marginTop: 6, fontFamily: 'var(--font-inter), Arial, sans-serif' }}>
                  {fileError}
                </p>
              )}

              {/* Footer actions */}
              <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => closeModal(false)}
                  style={{
                    padding: '10px 20px',
                    background: 'none',
                    border: '1px solid var(--ui-border)',
                    borderRadius: 8,
                    fontSize: 13,
                    color: 'var(--ui-text-secondary)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-inter), Arial, sans-serif',
                    fontWeight: 500,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDone}
                  disabled={draftTooLong}
                  style={{
                    padding: '10px 28px',
                    background: draftTooLong ? '#c8c4bc' : 'var(--ui-primary)',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#fff',
                    cursor: draftTooLong ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--font-inter), Arial, sans-serif',
                    transition: 'background 150ms',
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
