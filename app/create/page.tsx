'use client'

import { useState, useEffect, useRef } from 'react'
import { TemplateSelector, type TemplateId } from '@/components/TemplateSelector'
import { SplitSelector } from '@/components/SplitSelector'
import { ContentInput } from '@/components/ContentInput'
import { EmailPreview } from '@/components/EmailPreview'
import { SkeletonLoader } from '@/components/SkeletonLoader'
import { EditorSidebar } from '@/components/EditorSidebar'
import { ExportPanel } from '@/components/ExportPanel'
import { getCachedGeneration, setCachedGeneration } from '@/lib/cache'
import { checkUsage, incrementUsage, type UsageStatus } from '@/lib/checkUsage'
import { db } from '@/lib/db'
import type { EmailData, BlockContent } from '@/types/email'
import { OnboardingModal } from '@/components/OnboardingModal'
import { runTourIfNeeded } from '@/lib/tour'
import Link from 'next/link'

export default function CreatePage() {
  const [template, setTemplate]       = useState<TemplateId>('launch')
  const [parts, setParts]             = useState<1 | 2 | 3>(2)
  const [content, setContent]         = useState('')
  const [emailData, setEmailData]     = useState<EmailData | null>(null)
  const [isLoading, setIsLoading]     = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [logoBase64, setLogoBase64]   = useState('')
  const [cacheNotice, setCacheNotice]   = useState<string | null>(null)
  const [usageStatus, setUsageStatus]   = useState<UsageStatus | null>(null)
  const [progressState, setProgressState] = useState<'idle' | 'loading' | 'complete'>('idle')
  const [progressKey, setProgressKey]   = useState(0)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [previewScale, setPreviewScale] = useState(1)
  const previewWrapRef = useRef<HTMLDivElement>(null)

  // Daily session ID — same UUID for the whole day, new one each day
  const [sessionId] = useState(() => {
    if (typeof window === 'undefined') return crypto.randomUUID()
    const today      = new Date().toISOString().slice(0, 10)
    const storedId   = localStorage.getItem('dak_session_id')
    const storedDate = localStorage.getItem('dak_session_date')
    if (storedId && storedDate === today) return storedId
    const newId = crypto.randomUUID()
    localStorage.setItem('dak_session_id', newId)
    localStorage.setItem('dak_session_date', today)
    return newId
  })

  // Load usage status on mount + show modal on every fresh visit (skip if restoring a session)
  useEffect(() => {
    checkUsage(sessionId).then(setUsageStatus)
    if (typeof window !== 'undefined') {
      const hasRestore = localStorage.getItem('dak_restore')
      if (!hasRestore) setShowOnboarding(true)
    }
  }, [sessionId])

  // Restore session from homepage history click
  useEffect(() => {
    const raw = localStorage.getItem('dak_restore')
    if (!raw) return
    localStorage.removeItem('dak_restore')
    try {
      const { hash } = JSON.parse(raw)
      db.generations.get(hash).then(record => {
        if (!record) return
        setTemplate((record.template as TemplateId) ?? 'launch')
        setParts((record.parts as 1 | 2 | 3) ?? 2)
        setContent(record.content ?? '')
        setEmailData(record.data as EmailData)
      })
    } catch {}
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-clear cache notice
  useEffect(() => {
    if (!cacheNotice) return
    const t = setTimeout(() => setCacheNotice(null), 3000)
    return () => clearTimeout(t)
  }, [cacheNotice])

  // Fire product tour once after first email generation this session
  const tourFiredRef = useRef(false)
  useEffect(() => {
    if (!emailData || tourFiredRef.current) return
    tourFiredRef.current = true
    const t = setTimeout(runTourIfNeeded, 600)
    return () => clearTimeout(t)
  }, [emailData])

  // Scale email preview to fit container when viewport is narrower than 800px content
  useEffect(() => {
    const el = previewWrapRef.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => {
      const available = entry.contentRect.width - 48
      setPreviewScale(Math.min(1, available / 800))
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  async function generate(opts?: { template?: TemplateId, parts?: 1 | 2 | 3, content?: string }) {
    const _template = opts?.template ?? template
    const _parts    = opts?.parts    ?? parts
    const _content  = opts?.content  ?? content

    // Check rate limit before anything else
    const usage = await checkUsage(sessionId)
    setUsageStatus(usage)
    if (usage.status === 'blocked') return

    // Cache hit — no API call, no rate limit charge
    const cached = await getCachedGeneration(_content, _template, _parts)
    if (cached) {
      setEmailData(cached as EmailData)
      setError(null)
      setCacheNotice('⚡ Loaded from cache')
      return
    }

    setIsLoading(true)
    setEmailData(null)
    setProgressState('loading')
    setProgressKey(k => k + 1)
    setError(null)
    try {
      const res = await fetch('/api/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ template: _template, content: _content, parts: _parts }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Generation failed')
      }
      const data = await res.json()
      // Storage writes are best-effort — disk full or quota errors must not block the email showing
      try {
        await Promise.all([
          incrementUsage(sessionId),
          setCachedGeneration(_content, _template, _parts, data),
        ])
        checkUsage(sessionId).then(setUsageStatus)
      } catch {
        // ignore storage failures
      }
      setEmailData(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Generation failed. Please try again.'
      setError(message)
    } finally {
      setIsLoading(false)
      setProgressState(prev => {
        if (prev === 'loading') {
          setTimeout(() => setProgressState('idle'), 400)
          return 'complete'
        }
        return 'idle'
      })
    }
  }

  function handleOnboardingComplete(tmpl: string, p: number, cnt: string) {
    setTemplate(tmpl as TemplateId)
    setParts(p as 1 | 2 | 3)
    setContent(cnt)
    setShowOnboarding(false)
    generate({ template: tmpl as TemplateId, parts: p as 1 | 2 | 3, content: cnt })
  }

  function handleOnboardingSkip() {
    setShowOnboarding(false)
  }

  function updateBlock(idx: number, blockContent: BlockContent) {
    setEmailData(prev => {
      if (!prev) return prev
      const blocks = prev.blocks.map((b, i) => i === idx ? { ...b, content: blockContent } : b)
      return { ...prev, blocks }
    })
  }

  function updateTopLevel(field: string, value: string) {
    setEmailData(prev => prev ? { ...prev, [field]: value } : prev)
  }

  function updateCTA(field: 'label' | 'url', value: string) {
    setEmailData(prev => prev ? { ...prev, cta: { ...prev.cta, [field]: value } } : prev)
  }

  function updateSignoff(field: 'closing' | 'name', value: string) {
    setEmailData(prev => prev ? { ...prev, signoff: { ...prev.signoff, [field]: value } } : prev)
  }

  return (
    <>
      {/* Mobile gate — builder is desktop-only */}
      <div
        style={{
          display: 'none',
        }}
        className="mobile-gate"
      >
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✉</div>
          <h2
            style={{
              fontFamily: 'var(--font-fraunces), Georgia, serif',
              fontSize: 24,
              fontWeight: 700,
              color: 'var(--ui-primary)',
              marginBottom: 12,
            }}
          >
            Dak works best on desktop
          </h2>
          <p style={{ fontSize: 14, color: 'var(--ui-text-secondary)', maxWidth: 320, margin: '0 auto' }}>
            The email builder requires a larger screen. Open Dak on your laptop or desktop to get started.
          </p>
        </div>
      </div>

      {/* Builder — desktop only */}
      <style>{`
        @media (max-width: 1023px) {
          .builder-shell { display: none !important; }
          .mobile-gate   { display: block !important; }
        }
      `}</style>

      <div
        className="builder-shell"
        style={{
          display: 'flex',
          height: 'calc(100vh - 56px)',
          overflow: 'hidden',
          background: 'var(--ui-bg)',
        }}
      >
        {/* Left panel — 280px */}
        <div
          style={{
            width: 280,
            flexShrink: 0,
            background: 'var(--ui-surface)',
            borderRight: '1px solid var(--ui-border)',
            overflowY: 'auto',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              color: 'var(--ui-text-muted)',
              textDecoration: 'none',
              fontFamily: 'var(--font-inter), Arial, sans-serif',
            }}
          >
            ← Home
          </Link>

          <TemplateSelector selected={template} onChange={setTemplate} />
          <SplitSelector value={parts} onChange={setParts} hasGenerated={!!emailData} />
          <ContentInput
            content={content}
            onChange={setContent}
            onGenerate={() => generate()}
            disabled={isLoading}
            usageStatus={usageStatus}
          />

          {error && (
            <div
              style={{
                padding: '10px 12px',
                background: 'var(--ui-accent-light)',
                border: '1px solid var(--ui-accent)',
                borderRadius: 6,
                fontSize: 12,
                color: 'var(--ui-accent)',
              }}
            >
              {error}
              <button
                onClick={() => generate()}
                style={{
                  display: 'block',
                  marginTop: 6,
                  fontSize: 11,
                  color: 'var(--ui-primary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Try again
              </button>
            </div>
          )}
        </div>

        {/* Centre — fluid */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: 'var(--ui-preview-bg)',
          }}
        >
          <div className="perf-row" />
          <div
            ref={previewWrapRef}
            className="preview-wrap"
            style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '32px 24px 48px',
              position: 'relative',
            }}
          >
          {/* Progress bar — pinned to top of preview column */}
          {progressState !== 'idle' && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                overflow: 'hidden',
                zIndex: 10,
              }}
            >
              <div
                key={progressKey}
                style={{
                  height: '100%',
                  background: 'var(--ui-primary)',
                  ...(progressState === 'loading'
                    ? { animation: 'dak-progress-fill 6s ease-out forwards' }
                    : { width: '100%', opacity: 0, transition: 'opacity 0.3s ease' }
                  ),
                }}
              />
            </div>
          )}
          {cacheNotice && (
            <div
              style={{
                marginBottom: 12,
                padding: '6px 14px',
                background: 'var(--ui-surface)',
                border: '1px solid var(--ui-border)',
                borderRadius: 20,
                fontSize: 12,
                color: 'var(--ui-text-secondary)',
                fontFamily: 'var(--font-inter), Arial, sans-serif',
              }}
            >
              {cacheNotice}
            </div>
          )}

          <div style={{ zoom: previewScale < 1 ? previewScale : undefined }}>
            {isLoading ? (
              <SkeletonLoader template={template} />
            ) : emailData ? (
              <EmailPreview
                emailData={emailData}
                parts={parts}
                logoBase64={logoBase64}
                onUpdateBlock={updateBlock}
                onUpdateTopLevel={updateTopLevel}
                onUpdateCTA={updateCTA}
                onUpdateSignoff={updateSignoff}
                onRegenerate={generate}
              />
            ) : (
              <div
                style={{
                  width: 800,
                  minWidth: 800,
                  background: '#fff',
                  borderRadius: 8,
                  padding: '80px 36px',
                  textAlign: 'center',
                  color: '#9ca3af',
                  fontFamily: 'var(--font-inter), Arial, sans-serif',
                  fontSize: 14,
                  border: '1px dashed var(--ui-border)',
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 16 }}>✉</div>
                <p style={{ fontSize: 15, fontWeight: 500, color: '#6b7280', marginBottom: 6 }}>
                  Your email will appear here
                </p>
                <p style={{ fontSize: 13, color: '#9ca3af' }}>
                  Choose a template, set your split, paste your content, and click Generate
                </p>
              </div>
            )}
          </div>
          </div>
          <div className="perf-row" />
        </div>

        {/* Right panel — 300px */}
        <div
          style={{
            width: 300,
            flexShrink: 0,
            background: 'var(--ui-surface)',
            borderLeft: '1px solid var(--ui-border)',
            overflowY: 'auto',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
          }}
        >
          <div
            data-tour="style-panel"
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--ui-text-secondary)',
              marginBottom: 16,
            }}
          >
            Style
          </div>

          <EditorSidebar
            disabled={!emailData && !isLoading}
            logoBase64={logoBase64}
            onImageUpload={setLogoBase64}
          />

          <div data-tour="export-panel" style={{ marginTop: 24 }}>
            <ExportPanel partCount={parts} disabled={!emailData || isLoading} />
          </div>
        </div>
      </div>

      {showOnboarding && (
        <OnboardingModal
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
    </>
  )
}
