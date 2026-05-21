'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

export function NavBar() {
  const [visible, setVisible] = useState(true)
  const lastY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (y < 60) {
        setVisible(true)
      } else if (y > lastY.current) {
        setVisible(false)
      } else {
        setVisible(true)
      }
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
    <style>{`
      .dak-nav-link:hover { color: var(--ui-primary) !important; }
    `}</style>
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--ui-surface)',
        borderBottom: '1px solid var(--ui-border)',
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.25s ease',
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: '0 24px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="dak-wordmark">Dak</span>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#C0392B',
              display: 'inline-block',
              marginBottom: 5,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontWeight: 400,
              color: 'var(--ui-text-muted)',
              fontFamily: 'var(--font-inter), Arial, sans-serif',
              marginLeft: 2,
            }}
          >
            by Vishal Builds
          </span>
        </Link>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link
              href="/"
              className="dak-nav-link"
              style={{
                fontSize: 13,
                color: 'var(--ui-text-secondary)',
                textDecoration: 'none',
                fontFamily: 'var(--font-inter), Arial, sans-serif',
                fontWeight: 500,
                transition: 'color 150ms',
              }}
            >
              Home
            </Link>
            <a
              href="https://www.vishalbuilds.com/#projects"
              target="_blank"
              rel="noreferrer"
              className="dak-nav-link"
              style={{
                fontSize: 13,
                color: 'var(--ui-text-secondary)',
                textDecoration: 'none',
                fontFamily: 'var(--font-inter), Arial, sans-serif',
                fontWeight: 500,
                transition: 'color 150ms',
              }}
            >
              Products
            </a>
          </nav>

          {/* Privacy badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 11,
              color: 'var(--ui-text-muted)',
              fontFamily: 'var(--font-inter), Arial, sans-serif',
              background: 'var(--ui-bg)',
              border: '1px solid var(--ui-border)',
              borderRadius: 20,
              padding: '3px 10px',
              whiteSpace: 'nowrap',
            }}
          >
            <svg width="8" height="10" viewBox="0 0 10 12" fill="none">
              <path d="M5 0L0 2.18v3.27C0 8.49 2.13 11.28 5 12c2.87-.72 5-3.51 5-6.55V2.18L5 0z" fill="currentColor" opacity="0.45" />
            </svg>
            No data stored
          </span>
        </div>
      </div>
    </header>
    </>
  )
}
