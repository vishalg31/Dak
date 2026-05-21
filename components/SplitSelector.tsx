'use client'

interface Props {
  value: 1 | 2 | 3
  onChange: (v: 1 | 2 | 3) => void
  hasGenerated: boolean
}

const OPTIONS: { value: 1 | 2 | 3; label: string; desc: string }[] = [
  { value: 1, label: '1 Image',  desc: 'Short email' },
  { value: 2, label: '2 Images', desc: 'Standard (default)' },
  { value: 3, label: '3 Images', desc: 'Long, deep detail' },
]

export function SplitSelector({ value, onChange, hasGenerated }: Props) {
  function handleChange(next: 1 | 2 | 3) {
    if (next === value) return
    if (
      hasGenerated &&
      !confirm('Changing the split will regenerate your email. Your edits will be lost. Continue?')
    ) {
      return
    }
    onChange(next)
  }

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
          2
        </span>
        How many images?
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        {OPTIONS.map(opt => {
          const isSelected = value === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => handleChange(opt.value)}
              style={{
                flex: 1,
                padding: '10px 6px',
                border: `2px solid ${isSelected ? 'var(--ui-primary)' : 'var(--ui-border)'}`,
                borderRadius: 8,
                background: isSelected ? 'var(--ui-primary)' : 'var(--ui-surface)',
                color: isSelected ? '#fff' : 'var(--ui-text-secondary)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700 }}>{opt.value}</div>
              <div style={{ fontSize: 10, marginTop: 2, opacity: 0.8 }}>{opt.desc}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
