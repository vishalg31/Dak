'use client'

interface Props {
  emoji: string
  title: string
  subtitle: string
  pillBadge: string
  logoBase64?: string
  onUpdate: (fields: { emoji?: string; title?: string; subtitle?: string; pillBadge?: string }) => void
}

export function HeroHeader({ emoji, title, subtitle, pillBadge, logoBase64, onUpdate }: Props) {
  return (
    <div
      className="email-block"
      style={{
        background: 'linear-gradient(135deg, var(--email-primary-start), var(--email-primary-end))',
        borderRadius: 8,
        padding: '32px 36px',
        marginBottom: 24,
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {logoBase64 && (
        <img
          src={logoBase64}
          alt="Logo"
          style={{ width: 48, height: 48, objectFit: 'contain', marginBottom: 12, display: 'block' }}
        />
      )}

      {/* Pill badge — inline-flex wrapper keeps the contentEditable span vertically centred */}
      {pillBadge && (
        <div style={{ marginBottom: 10 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--email-accent)',
              background: 'rgba(255,255,255,0.12)',
              borderRadius: 20,
              padding: '4px 10px',
              lineHeight: 1,
            }}
          >
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={e => onUpdate({ pillBadge: e.currentTarget.textContent ?? '' })}
              style={{ outline: 'none', cursor: 'text', lineHeight: 1 }}
            >
              {pillBadge}
            </span>
          </span>
        </div>
      )}

      {/* Emoji + title — flex row, reliable in html2canvas */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span
          contentEditable
          suppressContentEditableWarning
          onBlur={e => onUpdate({ emoji: e.currentTarget.textContent ?? '' })}
          style={{ fontSize: 28, lineHeight: 1, flexShrink: 0, cursor: 'text', outline: 'none' }}
        >
          {emoji}
        </span>
        <span
          contentEditable
          suppressContentEditableWarning
          onBlur={e => onUpdate({ title: e.currentTarget.textContent ?? '' })}
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.25,
            fontFamily: 'var(--email-font)',
            cursor: 'text',
            outline: 'none',
          }}
        >
          {title}
        </span>
      </div>

      {/* Subtitle */}
      <p
        contentEditable
        suppressContentEditableWarning
        onBlur={e => onUpdate({ subtitle: e.currentTarget.textContent ?? '' })}
        style={{
          fontSize: 15,
          color: 'rgba(255,255,255,0.8)',
          lineHeight: 1.5,
          margin: 0,
          fontFamily: 'var(--email-font)',
          cursor: 'text',
          outline: 'none',
        }}
      >
        {subtitle}
      </p>
    </div>
  )
}
