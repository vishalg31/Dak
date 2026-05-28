export interface StatsItem {
  value: string
  label: string
  sublabel: string | null
}

export interface ProblemRow {
  problem: string
  impact: string
}

export interface FeatureItem {
  title: string
  description: string
}

export interface ProcessStep {
  icon: string
  title: string
  description: string
}

export interface WhatsNextItem {
  title: string
  description: string
}

export interface ChangelogVersion {
  label: string
  items: string[]
}

export interface DataTableRow {
  cells: string[]
  highlight: string | null
}

export type BlockType =
  | 'stats_bar'
  | 'problem_table'
  | 'feature_list'
  | 'process_flow'
  | 'dark_banner'
  | 'before_after'
  | 'callout'
  | 'whats_next'
  | 'changelog'
  | 'data_table'

export interface BlockStyle {
  bg?: string
  rowBg?: string
  borderColor?: string
  borderStyle?: 'solid' | 'dashed' | 'none'
}

export interface StatsBarContent { items: StatsItem[]; style?: BlockStyle }

export interface ProblemVariant { label: string; rows: ProblemRow[] }
export interface ProblemTableContent {
  rows?: ProblemRow[]
  activeVariant?: number
  variants?: ProblemVariant[]
}

export interface FeatureVariant { label: string; items: FeatureItem[] }
export interface FeatureListContent {
  items?: FeatureItem[]
  activeVariant?: number
  variants?: FeatureVariant[]
}

export interface ProcessFlowContent { steps: ProcessStep[]; style?: BlockStyle }
export interface DarkBannerContent { items: StatsItem[] }
export interface BeforeAfterContent {
  before: { value: string; label: string; description: string }
  after: { value: string; label: string; description: string }
}
export interface CalloutContent { text: string; highlight?: string }

export interface WhatsNextVariant { label: string; style: 'bullets' | 'timeline'; items: WhatsNextItem[] }
export interface WhatsNextContent {
  style?: 'bullets' | 'timeline'
  items?: WhatsNextItem[]
  activeVariant?: number
  variants?: WhatsNextVariant[]
}

export interface ChangelogContent { versions: ChangelogVersion[] }
export interface DataTableContent { columns: string[]; rows: DataTableRow[] }

export type BlockContent =
  | StatsBarContent
  | ProblemTableContent
  | FeatureListContent
  | ProcessFlowContent
  | DarkBannerContent
  | BeforeAfterContent
  | CalloutContent
  | WhatsNextContent
  | ChangelogContent
  | DataTableContent

export interface EmailBlock {
  type: BlockType
  part: number
  heading: string | null
  content: BlockContent
  style?: BlockStyle
}

export interface EmailData {
  emoji: string
  title: string
  subtitle: string
  pillBadge: string
  greeting: string
  intro: string
  blocks: EmailBlock[]
  cta: { label: string; url: string; part: number; hidden?: boolean }
  signoff: { closing: string; name: string; part: number }
}
