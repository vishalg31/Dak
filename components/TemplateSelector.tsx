'use client'

export type TemplateId = 'launch' | 'progress'

interface Props {
  selected: TemplateId
  onChange: (t: TemplateId) => void
}

const TEMPLATES = [
  {
    id: 'launch' as TemplateId,
    icon: '🚀',
    label: 'Launch Email',
    desc: 'New tool, system, or feature going live',
    gradientStart: '#0a3d62',
    gradientEnd: '#1a6fa0',
    accent: '#ff9900',
  },
  {
    id: 'progress' as TemplateId,
    icon: '📊',
    label: 'Progress Update',
    desc: 'Adoption metrics, results, what changed',
    gradientStart: '#232f3e',
    gradientEnd: '#37475a',
    accent: '#ff9900',
  },
]

export function TemplateSelector({ selected, onChange }: Props) {
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
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span
          className="stamp-step active"
          style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
        >
          1
        </span>
        Choose template
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {TEMPLATES.map(t => {
          const isSelected = selected === t.id
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                border: `2px solid ${isSelected ? 'var(--ui-primary)' : 'var(--ui-border)'}`,
                borderRadius: 8,
                background: isSelected ? 'var(--ui-accent-light)' : 'var(--ui-surface)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              {/* Mini theme swatch */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: `linear-gradient(135deg, ${t.gradientStart}, ${t.gradientEnd})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                {t.icon}
              </div>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--ui-text-primary)',
                    marginBottom: 2,
                    fontFamily: 'var(--font-fraunces), Georgia, serif',
                  }}
                >
                  {t.label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ui-text-secondary)' }}>
                  {t.desc}
                </div>
              </div>

              {isSelected && (
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: 'var(--ui-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path d="M1 3l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
