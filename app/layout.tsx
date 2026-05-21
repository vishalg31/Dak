import { Inter, Fraunces, Geist } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { NavBar } from '@/components/NavBar'
import './globals.css'

const fraunces = Fraunces({
  subsets:   ['latin'],
  variable:  '--font-fraunces',
  axes:      ['opsz', 'SOFT', 'WONK'],
})

const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-inter',
  weight:   ['400', '500', '600', '700'],
})

const geist = Geist({
  subsets:  ['latin'],
  variable: '--font-geist',
  weight:   ['400', '500', '600', '700'],
})

export const metadata = {
  title:       'Dak: Beautiful internal emails. One paste away.',
  description: 'Paste your raw content. Pick a template. Export Outlook-ready images in seconds.',
  openGraph: {
    title:       'Dak: Beautiful internal emails. One paste away.',
    description: 'Paste your raw content. Pick a template. Export Outlook-ready images in seconds.',
    url:         'https://dak.vishalbuilds.com',
    siteName:    'Dak',
    images: [
      {
        url:    '/og.png',
        width:  1200,
        height: 630,
        alt:    'Dak email builder',
      },
    ],
    type: 'website',
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Dak: Beautiful internal emails. One paste away.',
    description: 'Paste your raw content. Pick a template. Export Outlook-ready images in seconds.',
    images:      ['/og.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${geist.variable}`}>
      <body>
        <NavBar />

        {children}
        <Analytics />

        {/* Hidden capture stage — never visible to users */}
        <div
          id="capture-stage"
          style={{
            position: 'fixed',
            top: -99999,
            left: 0,
            width: 800,
            zIndex: -1,
            background: '#ffffff',
            overflow: 'hidden',
          }}
        />

        <footer className="site-footer">
          <p className="site-footer-credit">Made by Vishal.</p>
          <p>
            <a href="https://vishalbuilds.com" target="_blank" rel="noreferrer">Website</a>
            {' · '}
            <a href="mailto:vgvishal31@gmail.com">Email</a>
          </p>
        </footer>
      </body>
    </html>
  )
}
