import type { EmailBlock, BlockType } from '@/types/email'

export function defaultBlock(type: BlockType, part: number): EmailBlock {
  switch (type) {
    case 'stats_bar':
      return { type, part, heading: null, content: { items: [
        { value: '—', label: 'Metric 1', sublabel: null },
        { value: '—', label: 'Metric 2', sublabel: null },
        { value: '—', label: 'Metric 3', sublabel: null },
      ]}}
    case 'process_flow':
      return { type, part, heading: 'How It Works', content: { steps: [
        { icon: '📌', title: 'Step One',   description: 'Describe this step.' },
        { icon: '📌', title: 'Step Two',   description: 'Describe this step.' },
        { icon: '📌', title: 'Step Three', description: 'Describe this step.' },
      ]}}
    case 'feature_list':
      return { type, part, heading: "What's New", content: { items: [
        { title: 'Feature name', description: 'Brief description.' },
        { title: 'Feature name', description: 'Brief description.' },
      ]}}
    case 'callout':
      return { type, part, heading: null, content: { text: 'Add your callout message here.' }}
    case 'dark_banner':
      return { type, part, heading: null, content: { items: [
        { value: '—', label: 'Highlight 1', sublabel: null },
        { value: '—', label: 'Highlight 2', sublabel: null },
      ]}}
    case 'before_after':
      return { type, part, heading: 'Before & After', content: {
        before: { value: 'Before', label: 'Previous', description: 'How it was' },
        after:  { value: 'After',  label: 'Now',      description: 'How it is' },
      }}
    case 'whats_next':
      return { type, part, heading: "What's Next", content: { style: 'bullets', items: [
        { title: 'Next step', description: 'What happens next.' },
      ]}}
    case 'changelog':
      return { type, part, heading: 'Changelog', content: { versions: [
        { label: 'v1.0', items: ['Initial release'] },
      ]}}
    case 'problem_table':
      return { type, part, heading: 'Problems Solved', content: { rows: [
        { problem: 'Problem', impact: 'Impact' },
      ]}}
    case 'data_table':
      return { type, part, heading: 'Data', content: {
        columns: ['Column 1', 'Column 2', 'Column 3'],
        rows: [{ cells: ['—', '—', '—'], highlight: null }],
      }}
  }
}
