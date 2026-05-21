'use client'

import { useState, useEffect, useRef } from 'react'
import { getCachedFile, setCachedFile } from '@/lib/cache'

const MAX_CHARS = 8000
const MIN_CHARS = 50

const PLACEHOLDER = `Paste your raw content here. Bullet points, notes, metrics, decisions.

Include what changed, key numbers, who it impacts, and what comes next. The more context you give, the better the email.`

interface OnboardingModalProps {
  onComplete: (template: string, parts: number, content: string) => void
  onSkip: () => void
}

export function OnboardingModal({ onComplete, onSkip }: OnboardingModalProps) {
  const [step, setStep]         = useState(1)
  const [template, setTemplate] = useState<'launch' | 'progress'>('launch')
  const [parts, setParts]       = useState(2)
  const [content, setContent]   = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [mounted, setMounted]   = useState(false)
  const [exiting, setExiting]   = useState(false)
  const fileInputRef            = useRef<HTMLInputElement>(null)

  // Entry animation
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // Escape key skips onboarding
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleSkip() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-clear file error
  useEffect(() => {
    if (!fileError) return
    const t = setTimeout(() => setFileError(null), 4000)
    return () => clearTimeout(t)
  }, [fileError])

  const charCount   = content.length
  const canGenerate = charCount >= MIN_CHARS && charCount <= MAX_CHARS

  function close(cb: () => void) {
    setExiting(true)
    setTimeout(cb, 150)
  }

  function handleSkip() {
    if (typeof window !== 'undefined') localStorage.setItem('dak_onboarded', 'true')
    close(onSkip)
  }

  function handleComplete() {
    if (!canGenerate) return
    if (typeof window !== 'undefined') localStorage.setItem('dak_onboarded', 'true')
    close(() => onComplete(template, parts, content))
  }

  function handleTemplateSelect(t: 'launch' | 'progress') {
    setTemplate(t)
    setTimeout(() => setStep(2), 300)
  }

  function goBack() {
    setStep(s => s - 1)
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    // Cache check
    const cached = getCachedFile(file)
    if (cached) {
      setContent(cached)
      setFileName(`${file.name} (cached)`)
      return
    }

    if (file.size > 500 * 1024) {
      setFileError('File too large (500KB max)')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      let text = reader.result as string
      if (file.name.endsWith('.html')) {
        if (typeof window !== 'undefined') {
          const doc = new DOMParser().parseFromString(text, 'text/html')
          text = doc.body.innerText || doc.body.textContent || ''
        }
      }
      text = text.slice(0, MAX_CHARS)
      setCachedFile(file, text)
      setContent(text)
      setFileName(file.name)
    }
    reader.readAsText(file)
  }

  const showCount = charCount >= 7000
  const tooShort  = charCount > 0 && charCount < MIN_CHARS

  const isVisible = mounted && !exiting

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-fraunces), Georgia, serif',
    fontSize: 22,
    fontWeight: 700,
    color: 'var(--ui-text-primary)',
    letterSpacing: '-0.3px',
    marginBottom: 6,
  }

  const subStyle: React.CSSProperties = {
    fontSize: 13,
    color: 'var(--ui-text-secondary)',
    fontFamily: 'var(--font-inter), Arial, sans-serif',
    marginBottom: 24,
    lineHeight: 1.5,
  }

  const backBtnStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    fontSize: 13,
    color: 'var(--ui-text-muted)',
    cursor: 'pointer',
    padding: 0,
    fontFamily: 'var(--font-inter), Arial, sans-serif',
    marginBottom: 20,
    display: 'block',
  }

  return (
    <>
      <style>{`
        @media (max-width: 639px) {
          .onboarding-card {
            width: 100vw !important;
            min-height: 100vh !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            margin: 0 !important;
            overflow-y: auto !important;
          }
        }
      `}</style>

      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 200ms ease-out',
        }}
      >
        {/* Modal card */}
        <div
          className="onboarding-card"
          style={{
            width: 520,
            background: 'var(--ui-surface)',
            borderRadius: 16,
            padding: '40px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
            border: '1px solid var(--ui-border)',
            position: 'relative',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'scale(1)' : 'scale(0.95)',
            transition: 'opacity 200ms ease-out, transform 200ms ease-out',
          }}
        >
          {/* Skip */}
          <button onClick={handleSkip} style={{
            position: 'absolute',
            top: 16,
            right: 20,
            background: 'none',
            border: 'none',
            fontSize: 13,
            color: 'var(--ui-text-muted)',
            cursor: 'pointer',
            padding: 0,
            fontFamily: 'var(--font-inter), Arial, sans-serif',
          }}>
            Skip →
          </button>

          {/* Step dots */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
            {[1, 2, 3].map(s => (
              <button
                key={s}
                onClick={() => { if (s < step) setStep(s) }}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  border: s === step ? 'none' : '1.5px solid var(--ui-border)',
                  background: s === step ? 'var(--ui-primary)' : 'transparent',
                  padding: 0,
                  cursor: s < step ? 'pointer' : 'default',
                  transition: 'background 200ms, border-color 200ms',
                  flexShrink: 0,
                }}
              />
            ))}
          </div>

          {/* Sliding steps track */}
          <div style={{ overflow: 'hidden', minHeight: 380 }}>
            <div style={{
              display: 'flex',
              width: '300%',
              transform: `translateX(${-(step - 1) * 100 / 3}%)`,
              transition: 'transform 250ms ease-in-out',
            }}>

              {/* ── Step 1: Template ── */}
              <div style={{ width: '33.3333%', flexShrink: 0 }}>
                <p style={labelStyle}>What are you sending?</p>
                <p style={subStyle}>Pick the format that fits your content</p>

                <div style={{ display: 'flex', gap: 12 }}>
                  {([
                    { id: 'launch',   icon: '🚀', title: 'Launch Email',    desc: 'New tool, feature, or system going live' },
                    { id: 'progress', icon: '📊', title: 'Progress Update', desc: 'Metrics, adoption, what\'s changed' },
                  ] as const).map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => handleTemplateSelect(opt.id)}
                      style={{
                        flex: 1,
                        padding: 20,
                        border: `${template === opt.id ? '2px' : '1px'} solid ${template === opt.id ? 'var(--ui-primary)' : 'var(--ui-border)'}`,
                        borderRadius: 12,
                        background: template === opt.id ? 'var(--ui-accent-light)' : 'var(--ui-surface)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'border-color 150ms, background 150ms',
                      }}
                    >
                      <div style={{ fontSize: 32, marginBottom: 10, lineHeight: 1 }}>{opt.icon}</div>
                      <div style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: 16, fontWeight: 600, color: 'var(--ui-text-primary)', marginBottom: 6 }}>
                        {opt.title}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--ui-text-secondary)', fontFamily: 'var(--font-inter), Arial, sans-serif', lineHeight: 1.4 }}>
                        {opt.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Step 2: Split ── */}
              <div style={{ width: '33.3333%', flexShrink: 0 }}>
                <button onClick={goBack} style={backBtnStyle}>← Back</button>
                <p style={labelStyle}>How many images?</p>
                <p style={subStyle}>Split your email for easy Outlook pasting</p>

                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  {([
                    { val: 1, label: '1 Image',   sub: 'Short email' },
                    { val: 2, label: '2 Images',  sub: 'Most common' },
                    { val: 3, label: '3 Images',  sub: 'Long & detailed' },
                  ] as const).map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => setParts(opt.val)}
                      style={{
                        flex: 1,
                        padding: '12px 8px',
                        border: `1px solid ${parts === opt.val ? 'var(--ui-primary)' : 'var(--ui-border)'}`,
                        borderRadius: 8,
                        background: parts === opt.val ? 'var(--ui-primary)' : 'var(--ui-surface)',
                        color: parts === opt.val ? '#ffffff' : 'var(--ui-text-primary)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'background 150ms, border-color 150ms, color 150ms',
                        fontFamily: 'var(--font-inter), Arial, sans-serif',
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{opt.label}</div>
                      <div style={{ fontSize: 11, opacity: parts === opt.val ? 0.75 : 1, color: parts === opt.val ? '#fff' : 'var(--ui-text-muted)' }}>
                        {opt.sub}
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setStep(3)}
                  style={{
                    width: '100%',
                    padding: 12,
                    background: 'var(--ui-primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-inter), Arial, sans-serif',
                    transition: 'background 150ms',
                  }}
                >
                  Continue →
                </button>
              </div>

              {/* ── Step 3: Content ── */}
              <div style={{ width: '33.3333%', flexShrink: 0 }}>
                <button onClick={goBack} style={backBtnStyle}>← Back</button>
                <p style={labelStyle}>What's your content?</p>
                <p style={subStyle}>Paste notes, bullets, or data. AI will structure it.</p>

                <div style={{ position: 'relative', marginBottom: 8 }}>
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder={PLACEHOLDER}
                    style={{
                      width: '100%',
                      minHeight: 160,
                      padding: '10px 12px',
                      border: `1px solid ${tooShort ? 'var(--ui-accent)' : 'var(--ui-border)'}`,
                      borderRadius: 8,
                      fontSize: 13,
                      fontFamily: 'var(--font-inter), Arial, sans-serif',
                      color: 'var(--ui-text-primary)',
                      background: 'var(--ui-surface)',
                      resize: 'vertical',
                      outline: 'none',
                      lineHeight: 1.6,
                      transition: 'border-color 150ms',
                    }}
                  />
                  {showCount && (
                    <span style={{
                      position: 'absolute',
                      bottom: 8,
                      right: 10,
                      fontSize: 11,
                      color: charCount > MAX_CHARS ? 'var(--ui-accent)' : 'var(--ui-text-muted)',
                      fontFamily: 'var(--font-inter), Arial, sans-serif',
                    }}>
                      {charCount}/{MAX_CHARS}
                    </span>
                  )}
                </div>

                {/* File upload */}
                <div style={{ marginBottom: 16 }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'none',
                      border: '1px dashed var(--ui-primary)',
                      borderRadius: 8,
                      fontSize: 13,
                      color: fileName ? 'var(--ui-primary)' : 'var(--ui-text-secondary)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-inter), Arial, sans-serif',
                      textAlign: 'center',
                      transition: 'border-color 150ms, color 150ms',
                    }}
                  >
                    {fileName ? `↑ ${fileName}` : '↑ Or upload a file (.html .txt .md)'}
                  </button>
                  {fileError && (
                    <p style={{ fontSize: 11, color: 'var(--ui-accent)', marginTop: 4, fontFamily: 'var(--font-inter), Arial, sans-serif' }}>
                      {fileError}
                    </p>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".html,.txt,.md"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </div>

                <button
                  onClick={handleComplete}
                  disabled={!canGenerate}
                  style={{
                    width: '100%',
                    padding: 12,
                    background: canGenerate ? 'var(--ui-primary)' : 'var(--ui-border)',
                    color: canGenerate ? '#fff' : 'var(--ui-text-muted)',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: canGenerate ? 'pointer' : 'not-allowed',
                    fontFamily: 'var(--font-inter), Arial, sans-serif',
                    transition: 'background 150ms, color 150ms',
                  }}
                >
                  ✦ Generate Email
                </button>
                {tooShort && (
                  <p style={{ fontSize: 11, color: 'var(--ui-text-muted)', marginTop: 6, fontFamily: 'var(--font-inter), Arial, sans-serif' }}>
                    Add a bit more detail ({MIN_CHARS - charCount} chars needed)
                  </p>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}
