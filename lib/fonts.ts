export interface FontOption {
  id: string
  label: string
  family: string
}

export const FONT_OPTIONS: FontOption[] = [
  { id: 'segoe',   label: 'Segoe UI', family: "'Segoe UI', Arial, sans-serif" },
  { id: 'inter',   label: 'Inter',    family: "'Inter', Arial, sans-serif" },
  { id: 'geist',   label: 'Geist',    family: "'Geist', Arial, sans-serif" },
  { id: 'georgia', label: 'Georgia',  family: "Georgia, 'Times New Roman', serif" },
]
