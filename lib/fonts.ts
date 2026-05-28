export interface FontOption {
  id: string
  label: string
  family: string
}

export const FONT_OPTIONS: FontOption[] = [
  { id: 'segoe',       label: 'Segoe UI',        family: "'Segoe UI', Arial, sans-serif" },
  { id: 'inter',       label: 'Inter',            family: "'Inter', Arial, sans-serif" },
  { id: 'geist',       label: 'Geist',            family: "'Geist', Arial, sans-serif" },
  { id: 'roboto',      label: 'Roboto',           family: "'Roboto', Arial, sans-serif" },
  { id: 'opensans',    label: 'Open Sans',        family: "'Open Sans', Arial, sans-serif" },
  { id: 'lato',        label: 'Lato',             family: "'Lato', Arial, sans-serif" },
  { id: 'montserrat',  label: 'Montserrat',       family: "'Montserrat', Arial, sans-serif" },
  { id: 'dmsans',      label: 'DM Sans',          family: "'DM Sans', Arial, sans-serif" },
  { id: 'playfair',    label: 'Playfair Display', family: "'Playfair Display', Georgia, serif" },
  { id: 'sourceserif', label: 'Source Serif 4',   family: "'Source Serif 4', Georgia, serif" },
  { id: 'fraunces',    label: 'Fraunces',         family: "'Fraunces', Georgia, serif" },
  { id: 'georgia',     label: 'Georgia',          family: "Georgia, 'Times New Roman', serif" },
]
