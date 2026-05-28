'use client'

import { useState, useEffect, useRef } from 'react'

interface Props {
  partCount: 1 | 2 | 3
  disabled: boolean
  emailTitle?: string
}

export function ExportPanel({ partCount, disabled, emailTitle }: Props) {
  const [projectName, setProjectName]   = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const userEditedSubject               = useRef(false)
  const [status, setStatus]             = useState('')
  const [busy, setBusy]                 = useState(false)
  const [emlBusy, setEmlBusy]           = useState(false)
  const [emlHovered, setEmlHovered]     = useState(false)

  // Clipboard (Outlook paste) flow
  const [clipBlobs, setClipBlobs]     = useState<Blob[] | null>(null)
  const [clipStep, setClipStep]       = useState(0)   // 0 = not started, 1-based when active
  const [clipBusy, setClipBusy]       = useState(false)
  const [clipStatus, setClipStatus]   = useState('')

  useEffect(() => {
    if (!userEditedSubject.current && emailTitle) setEmailSubject(emailTitle)
  }, [emailTitle])

  const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.includes('Firefox')

  async function handleExport() {
    if (busy || disabled) return
    if (isFirefox) {
      setStatus('PNG export requires Chrome or Edge. Firefox does not support image capture.')
      return
    }
    setBusy(true)
    setStatus('')
    try {
      const { exportEmail } = await import('@/lib/capture')
      await exportEmail(partCount, projectName, setStatus)
    } catch (err) {
      console.error(err)
      setStatus('Export failed. Try again. If this persists, try Chrome or Edge.')
    } finally {
      setBusy(false)
    }
  }

  async function handleExportEml() {
    if (emlBusy || disabled) return
    if (isFirefox) {
      setStatus('EML export requires Chrome or Edge. Firefox does not support image capture.')
      return
    }
    setEmlBusy(true)
    setStatus('')
    try {
      const { exportEml } = await import('@/lib/capture')
      await exportEml(partCount, projectName, emailSubject, setStatus)
    } catch (err) {
      console.error(err)
      setStatus('EML export failed. Try again.')
    } finally {
      setEmlBusy(false)
    }
  }

  async function handleCopyForOutlook() {
    if (clipBusy || disabled) return
    if (isFirefox) {
      setClipStatus('Copy for Outlook requires Chrome or Edge.')
      return
    }
    setClipBusy(true)
    setClipBlobs(null)
    setClipStep(0)
    setClipStatus('')
    try {
      const { capturePartsAsBlobs } = await import('@/lib/capture')
      const blobs = await capturePartsAsBlobs(partCount, setClipStatus)
      // Copy the first part immediately (we have the user gesture here)
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blobs[0] })])
      setClipBlobs(blobs)
      setClipStep(1)
      setClipStatus('')
    } catch (err) {
      console.error(err)
      setClipStatus('Copy failed. Make sure you are on a supported browser (Chrome/Edge).')
    } finally {
      setClipBusy(false)
    }
  }

  async function handleCopyNext() {
    if (!clipBlobs || clipBusy) return
    const nextStep = clipStep + 1
    setClipBusy(true)
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': clipBlobs[nextStep - 1] })])
      setClipStep(nextStep)
    } catch {
      setClipStatus('Copy failed. Try again.')
    } finally {
      setClipBusy(false)
    }
  }

  function resetClip() {
    setClipBlobs(null)
    setClipStep(0)
    setClipStatus('')
  }

  const allCopied = clipBlobs !== null && clipStep >= partCount

  return (
    <div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--ui-text-secondary)',
          marginBottom: 10,
          borderTop: '1px dashed var(--ui-border)',
          paddingTop: 16,
        }}
      >
        Export
      </div>

      <div style={{ marginBottom: 10 }}>
        <label
          style={{
            display: 'block',
            fontSize: 11,
            color: 'var(--ui-text-secondary)',
            marginBottom: 6,
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Project name
        </label>
        <input
          type="text"
          value={projectName}
          onChange={e => setProjectName(e.target.value)}
          placeholder="coast-launch"
          style={{
            width: '100%',
            padding: '8px 10px',
            border: '1px solid var(--ui-border)',
            borderRadius: 6,
            fontSize: 13,
            color: 'var(--ui-text-primary)',
            background: 'var(--ui-surface)',
            outline: 'none',
          }}
        />
        <div style={{ fontSize: 10, color: 'var(--ui-text-muted)', marginTop: 4 }}>
          {partCount === 1
            ? 'Exports as: name_dak.png'
            : `Exports as: name_dak_part1.png … part${partCount}.png`}
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label
          style={{
            display: 'block',
            fontSize: 11,
            color: 'var(--ui-text-secondary)',
            marginBottom: 6,
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Email subject
        </label>
        <input
          type="text"
          value={emailSubject}
          onChange={e => { setEmailSubject(e.target.value); userEditedSubject.current = true }}
          placeholder="Launch: Project Name"
          style={{
            width: '100%',
            padding: '8px 10px',
            border: '1px solid var(--ui-border)',
            borderRadius: 6,
            fontSize: 13,
            color: 'var(--ui-text-primary)',
            background: 'var(--ui-surface)',
            outline: 'none',
          }}
        />
      </div>

      {/* Download PNGs */}
      <button
        onClick={handleExport}
        disabled={disabled || busy}
        style={{
          width: '100%',
          padding: '10px',
          background: disabled || busy ? '#ccc' : 'var(--ui-primary)',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 600,
          cursor: disabled || busy ? 'not-allowed' : 'pointer',
          transition: 'background 0.15s',
        }}
      >
        {busy ? 'Exporting...' : '↓ Download PNG'}
      </button>

      {/* Export as EML */}
      <button
        onClick={handleExportEml}
        disabled={disabled || emlBusy}
        onMouseEnter={() => setEmlHovered(true)}
        onMouseLeave={() => setEmlHovered(false)}
        style={{
          width: '100%',
          padding: '10px',
          marginTop: 8,
          background: disabled || emlBusy ? 'transparent' : emlHovered ? 'var(--ui-primary)' : 'transparent',
          color: disabled || emlBusy ? 'var(--ui-text-muted)' : emlHovered ? '#ffffff' : 'var(--ui-primary)',
          border: `1px solid ${disabled || emlBusy ? 'var(--ui-border)' : 'var(--ui-primary)'}`,
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 600,
          cursor: disabled || emlBusy ? 'not-allowed' : 'pointer',
          transition: 'background 0.15s, color 0.15s',
        }}
      >
        {emlBusy ? 'Building EML...' : '✉ Export as EML'}
      </button>

      {status && (
        <p
          style={{
            marginTop: 8,
            fontSize: 12,
            color: status.includes('failed') ? 'var(--ui-accent)' : 'var(--ui-text-secondary)',
            textAlign: 'center',
          }}
        >
          {status}
        </p>
      )}

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--ui-border)' }} />
        <span style={{ fontSize: 10, color: 'var(--ui-text-muted)', fontFamily: 'var(--font-inter), Arial, sans-serif' }}>or paste into Outlook</span>
        <div style={{ flex: 1, height: 1, background: 'var(--ui-border)' }} />
      </div>

      {/* Clipboard / Outlook flow */}
      {!clipStep ? (
        /* Step 0 — start button */
        <button
          onClick={handleCopyForOutlook}
          disabled={disabled || clipBusy}
          style={{
            width: '100%',
            padding: '10px',
            background: 'none',
            border: `1.5px solid ${disabled || clipBusy ? 'var(--ui-border)' : 'var(--ui-primary)'}`,
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            color: disabled || clipBusy ? 'var(--ui-text-muted)' : 'var(--ui-primary)',
            cursor: disabled || clipBusy ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
          }}
        >
          {clipBusy ? 'Capturing...' : '✉ Copy for Outlook'}
        </button>
      ) : (
        /* Step 1+ — guided paste flow */
        <div
          style={{
            border: '1px solid var(--ui-border)',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          {/* Progress dots */}
          {partCount > 1 && (
            <div style={{ display: 'flex', gap: 0 }}>
              {Array.from({ length: partCount }, (_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 3,
                    background: i < clipStep ? 'var(--ui-primary)' : 'var(--ui-border)',
                    transition: 'background 200ms',
                  }}
                />
              ))}
            </div>
          )}

          <div style={{ padding: '14px 14px 12px' }}>
            {allCopied ? (
              /* All done */
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>✓</div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ui-text-primary)', fontFamily: 'var(--font-inter), Arial, sans-serif', margin: '0 0 4px' }}>
                  All {partCount > 1 ? `${partCount} images` : 'image'} pasted
                </p>
                <p style={{ fontSize: 11, color: 'var(--ui-text-muted)', fontFamily: 'var(--font-inter), Arial, sans-serif', margin: '0 0 12px' }}>
                  Your email is ready to send
                </p>
                <button
                  onClick={resetClip}
                  style={{ fontSize: 11, color: 'var(--ui-text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                >
                  Start over
                </button>
              </div>
            ) : (
              /* Active step */
              <>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ui-text-primary)', fontFamily: 'var(--font-inter), Arial, sans-serif', margin: '0 0 3px' }}>
                  {partCount > 1 ? `Part ${clipStep} of ${partCount} copied` : 'Copied to clipboard'}
                </p>
                <p style={{ fontSize: 11, color: 'var(--ui-text-secondary)', fontFamily: 'var(--font-inter), Arial, sans-serif', margin: '0 0 12px', lineHeight: 1.5 }}>
                  Open Outlook, click in the email body, and press{' '}
                  <span style={{ fontWeight: 600 }}>Ctrl+V</span> to paste.
                  {partCount > 1 && ' Then come back for the next part.'}
                </p>
                {partCount > 1 && (
                  <button
                    onClick={handleCopyNext}
                    disabled={clipBusy}
                    style={{
                      width: '100%',
                      padding: '9px',
                      background: clipBusy ? '#ccc' : 'var(--ui-primary)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: clipBusy ? 'wait' : 'pointer',
                      fontFamily: 'var(--font-inter), Arial, sans-serif',
                    }}
                  >
                    {clipBusy ? 'Copying...' : `Copy Part ${clipStep + 1} →`}
                  </button>
                )}
                {partCount === 1 && (
                  <button
                    onClick={resetClip}
                    style={{ fontSize: 11, color: 'var(--ui-text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                  >
                    Copy again
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {clipStatus && (
        <p style={{ marginTop: 8, fontSize: 12, color: 'var(--ui-accent)', textAlign: 'center', fontFamily: 'var(--font-inter), Arial, sans-serif' }}>
          {clipStatus}
        </p>
      )}
    </div>
  )
}
