'use client'

import { useState, useRef } from 'react'
import { THEMES, applyTheme, updateCSSVar } from '@/lib/themes'
import { FONT_OPTIONS } from '@/lib/fonts'

interface Props {
  disabled: boolean
  logoBase64: string
  onImageUpload: (base64: string) => void
}

export function EditorSidebar({ disabled, logoBase64, onImageUpload }: Props) {
  const [activeTheme, setActiveTheme]     = useState('navy')
  const [primaryColor, setPrimaryColor]   = useState('#0a3d62')
  const [accentColor, setAccentColor]     = useState('#ff9900')
  const [activeFont, setActiveFont]       = useState('segoe')
  const [activeFontSize, setFontSize]     = useState<'S' | 'M' | 'L'>('M')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleThemeClick(themeId: string) {
    setActiveTheme(themeId)
    const t = THEMES.find(t => t.id === themeId)
    if (t) {
      setPrimaryColor(t.primaryStart)
      setAccentColor(t.accent)
    }
    applyTheme(themeId)
  }

  function handlePrimaryColor(value: string) {
    setPrimaryColor(value)
    updateCSSVar('--email-primary-start', value)
    updateCSSVar('--email-primary-end', value)
  }

  function handleAccentColor(value: string) {
    setAccentColor(value)
    updateCSSVar('--email-accent', value)
  }

  function handleFont(fontId: string) {
    setActiveFont(fontId)
    const opt = FONT_OPTIONS.find(f => f.id === fontId)
    if (opt) updateCSSVar('--email-font', opt.family)
  }

  function handleFontSize(size: 'S' | 'M' | 'L') {
    setFontSize(size)
    const map = { S: '13px', M: '15px', L: '17px' }
    updateCSSVar('--email-font-size', map[size])
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      onImageUpload(base64)
    }
    reader.readAsDataURL(file)
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--ui-text-secondary)',
    display: 'block',
    marginBottom: 8,
  }

  const sectionStyle: React.CSSProperties = {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottom: '1px dashed var(--ui-border)',
  }

  return (
    <div style={{ opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      {/* Theme switcher */}
      <div style={sectionStyle}>
        <span style={labelStyle}>Theme</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 8 }}>
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => handleThemeClick(t.id)}
              title={t.label}
              style={{
                padding: '8px 4px',
                border: `2px solid ${activeTheme === t.id ? 'var(--ui-primary)' : 'var(--ui-border)'}`,
                borderRadius: 8,
                background: t.emailBg !== '#ffffff' ? t.emailBg : 'var(--ui-surface)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: 20,
                  borderRadius: 4,
                  background: `linear-gradient(to right, ${t.primaryStart}, ${t.primaryEnd})`,
                }}
              />
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: t.accent,
                }}
              />
              <span style={{ fontSize: 9, color: 'var(--ui-text-secondary)' }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Primary colour */}
      <div style={sectionStyle}>
        <span style={labelStyle}>Primary colour</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="color"
            value={primaryColor}
            onChange={e => handlePrimaryColor(e.target.value)}
            style={{ width: 40, height: 32, border: 'none', cursor: 'pointer', borderRadius: 4 }}
          />
          <span style={{ fontSize: 12, color: 'var(--ui-text-secondary)', fontFamily: 'monospace' }}>
            {primaryColor}
          </span>
        </div>
      </div>

      {/* Accent colour */}
      <div style={sectionStyle}>
        <span style={labelStyle}>Accent colour</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="color"
            value={accentColor}
            onChange={e => handleAccentColor(e.target.value)}
            style={{ width: 40, height: 32, border: 'none', cursor: 'pointer', borderRadius: 4 }}
          />
          <span style={{ fontSize: 12, color: 'var(--ui-text-secondary)', fontFamily: 'monospace' }}>
            {accentColor}
          </span>
        </div>
      </div>

      {/* Font */}
      <div style={sectionStyle}>
        <span style={labelStyle}>Font</span>
        <select
          value={activeFont}
          onChange={e => handleFont(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 10px',
            border: '1px solid var(--ui-border)',
            borderRadius: 6,
            fontSize: 13,
            color: 'var(--ui-text-primary)',
            background: 'var(--ui-surface)',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          {FONT_OPTIONS.map(f => (
            <option key={f.id} value={f.id}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* Font size */}
      <div style={sectionStyle}>
        <span style={labelStyle}>Font size</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['S', 'M', 'L'] as const).map(s => (
            <button
              key={s}
              onClick={() => handleFontSize(s)}
              style={{
                flex: 1,
                padding: '7px',
                border: `2px solid ${activeFontSize === s ? 'var(--ui-primary)' : 'var(--ui-border)'}`,
                borderRadius: 6,
                background: activeFontSize === s ? 'var(--ui-primary)' : 'var(--ui-surface)',
                color: activeFontSize === s ? '#fff' : 'var(--ui-text-secondary)',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Image upload */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ ...labelStyle, marginBottom: 0 }}>Logo</span>
          {logoBase64 && (
            <button
              onClick={() => {
                onImageUpload('')
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              style={{
                fontSize: 11,
                color: 'var(--ui-accent)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                fontFamily: 'var(--font-inter), Arial, sans-serif',
              }}
            >
              ✕ Remove
            </button>
          )}
        </div>
        {logoBase64 ? (
          <div
            style={{
              padding: '8px',
              border: '1px solid var(--ui-border)',
              borderRadius: 6,
              background: 'var(--ui-bg)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <img
              src={logoBase64}
              alt="Logo preview"
              style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 4, flexShrink: 0 }}
            />
            <label
              style={{
                fontSize: 11,
                color: 'var(--ui-text-secondary)',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Replace
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        ) : (
          <label
            style={{
              display: 'block',
              padding: '10px',
              border: '1px dashed var(--ui-border)',
              borderRadius: 6,
              textAlign: 'center',
              cursor: 'pointer',
              fontSize: 12,
              color: 'var(--ui-text-secondary)',
            }}
          >
            Click to upload PNG / JPG / GIF
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </label>
        )}
        <p style={{ fontSize: 10, color: 'var(--ui-text-muted)', marginTop: 4 }}>
          Injected into the hero header
        </p>
      </div>
    </div>
  )
}
