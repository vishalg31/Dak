import Link from 'next/link'
import { RecentEmails } from '@/components/RecentEmails'
import { HomepageUsage } from '@/components/HomepageUsage'

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: 'calc(100vh - 56px - 80px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 24px 80px',
        background: 'var(--ui-bg)',
      }}
    >
      {/* Wordmark + postmark */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-fraunces), Georgia, serif',
              fontSize: 56,
              fontWeight: 700,
              fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 1",
              color: 'var(--ui-primary)',
              letterSpacing: '-1px',
              lineHeight: 1,
            }}
          >
            Dak
          </span>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '2px solid var(--ui-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginBottom: -8,
            }}
          >
            <span style={{ fontSize: 14, color: 'var(--ui-accent)' }}>✉</span>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <h1
        style={{
          fontFamily: 'var(--font-fraunces), Georgia, serif',
          fontSize: 'clamp(22px, 4vw, 32px)',
          fontWeight: 600,
          color: 'var(--ui-text-primary)',
          textAlign: 'center',
          marginBottom: 12,
          lineHeight: 1.3,
        }}
      >
        Beautiful internal emails.{' '}
        <span style={{ color: 'var(--ui-primary)', fontStyle: 'italic' }}>One paste away.</span>
      </h1>

      {/* Subtext */}
      <p
        style={{
          fontSize: 16,
          color: 'var(--ui-text-secondary)',
          textAlign: 'center',
          maxWidth: 460,
          lineHeight: 1.6,
          marginBottom: 40,
        }}
      >
        Paste your raw content. Pick a template. Export Outlook-ready images in seconds.
      </p>

      {/* Example cards */}
      <div
        style={{
          display: 'flex',
          gap: 20,
          marginBottom: 48,
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        {[
          { label: 'Launch Email', color: '#0a3d62', rotate: '-2deg' },
          { label: 'Progress Update', color: '#232f3e', rotate: '0deg' },
          { label: 'Launch Email', color: '#1e1b4b', rotate: '2deg' },
        ].map((ex, i) => (
          <div
            key={i}
            style={{
              width: 180,
              height: 240,
              background: '#fff',
              borderRadius: 8,
              boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
              transform: `rotate(${ex.rotate})`,
              overflow: 'hidden',
              border: '1px solid var(--ui-border)',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                background: `linear-gradient(135deg, ${ex.color}, ${ex.color}cc)`,
                height: 80,
                padding: '14px 12px',
              }}
            >
              <div style={{ width: 100, height: 10, background: 'rgba(255,255,255,0.3)', borderRadius: 4, marginBottom: 8 }} />
              <div style={{ width: 70, height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 4 }} />
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {[1, 2, 3].map(j => (
                  <div key={j} style={{ flex: 1, height: 36, background: '#f0f4f8', borderRadius: 4 }} />
                ))}
              </div>
              {[90, 70, 80, 60].map((w, j) => (
                <div key={j} style={{ width: `${w}%`, height: 6, background: '#e8e8e8', borderRadius: 3, marginBottom: 6 }} />
              ))}
              <div
                style={{
                  fontSize: 9,
                  color: '#888',
                  marginTop: 10,
                  textAlign: 'center',
                  fontStyle: 'italic',
                }}
              >
                {ex.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Usage indicator */}
      <HomepageUsage />

      {/* CTA */}
      <Link
        href="/create"
        style={{
          display: 'inline-block',
          background: 'var(--ui-primary)',
          color: '#fff',
          padding: '14px 36px',
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 600,
          textDecoration: 'none',
          marginBottom: 20,
          transition: 'background 0.2s',
        }}
      >
        Create your email →
      </Link>

      {/* Footer nudge */}
      <p
        style={{
          fontSize: 13,
          color: 'var(--ui-text-muted)',
          textAlign: 'center',
        }}
      >
        Free. No signup. No Outlook formatting hell.
      </p>

      {/* Recent emails — client component, only renders if IndexedDB has entries */}
      <RecentEmails />
    </main>
  )
}
