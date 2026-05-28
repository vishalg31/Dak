export interface Theme {
  id: string
  label: string
  primaryStart: string
  primaryEnd: string
  accent: string
  cardBg: string
  emailBg: string
  textColor: string
}

export const THEMES: Theme[] = [
  {
    id: 'navy',
    label: 'Navy',
    primaryStart: '#0a3d62',
    primaryEnd: '#1a6fa0',
    accent: '#ff9900',
    cardBg: '#f0f4f8',
    emailBg: '#ffffff',
    textColor: '#1a1a2e',
  },
  {
    id: 'charcoal',
    label: 'Charcoal',
    primaryStart: '#232f3e',
    primaryEnd: '#37475a',
    accent: '#ff9900',
    cardBg: '#f0f4f8',
    emailBg: '#ffffff',
    textColor: '#1a1a2e',
  },
  {
    id: 'indigo',
    label: 'Indigo',
    primaryStart: '#1e1b4b',
    primaryEnd: '#1d4ed8',
    accent: '#0d9488',
    cardBg: '#f8f7ff',
    emailBg: '#ffffff',
    textColor: '#1a1a2e',
  },
  {
    id: 'editorial',
    label: 'Editorial',
    primaryStart: '#2A241B',
    primaryEnd: '#3d3526',
    accent: '#E1A4C2',
    cardBg: '#ECE6D2',
    emailBg: '#F2EEDF',
    textColor: '#1a1a2e',
  },
  {
    id: 'apex',
    label: 'Apex',
    primaryStart: '#1C2333',
    primaryEnd: '#2D3748',
    accent: '#F5A623',
    cardBg: '#EDE9DC',
    emailBg: '#F7F5EF',
    textColor: '#1a1a2e',
  },
]

export function applyTheme(themeId: string): void {
  const theme = THEMES.find(t => t.id === themeId)
  if (!theme) return
  updateCSSVar('--email-primary-start', theme.primaryStart)
  updateCSSVar('--email-primary-end',   theme.primaryEnd)
  updateCSSVar('--email-accent',        theme.accent)
  updateCSSVar('--email-card-bg',       theme.cardBg)
  updateCSSVar('--email-bg',            theme.emailBg)
  updateCSSVar('--email-text',          theme.textColor)
}

export function updateCSSVar(key: string, value: string): void {
  const root = document.getElementById('email-preview-root')
  if (!root) return
  root.style.setProperty(key, value)
}
