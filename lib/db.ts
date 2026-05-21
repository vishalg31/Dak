import Dexie, { type Table } from 'dexie'

export interface GenerationRecord {
  hash:      string
  data:      unknown
  title:     string
  emoji:     string
  template:  string
  parts:     number
  content:   string   // original textarea input — needed for full restore
  createdAt: number
}

export interface UsageCounter {
  sessionId: string
  count:     number
  date:      string   // YYYY-MM-DD UTC
}

class DakDB extends Dexie {
  generations!:  Table<GenerationRecord>
  usageCounters!: Table<UsageCounter>

  constructor() {
    super('dak-db')
    this.version(1).stores({
      generations:   'hash, createdAt',
      usageCounters: 'sessionId',
    })
  }
}

export const db = new DakDB()
