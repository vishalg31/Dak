import { db } from './db'

// Same hash algorithm as Tailor (lib/utils.ts hashString)
export function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

// ── File extraction cache (sessionStorage — tab-scoped, no persistence needed) ─

function fileKey(file: File): string {
  return `dak_file_${hashString(file.name + file.size + file.lastModified)}`
}

export function getCachedFile(file: File): string | null {
  try {
    return sessionStorage.getItem(fileKey(file))
  } catch {
    return null
  }
}

export function setCachedFile(file: File, text: string): void {
  try {
    sessionStorage.setItem(fileKey(file), text)
  } catch {}
}

// ── Generation cache (IndexedDB — persists across sessions) ──────────────────

const MAX_GEN_ENTRIES = 5

export function genHash(text: string, template: string, parts: number): string {
  return hashString(text + template + String(parts))
}

export async function getCachedGeneration(
  text: string,
  template: string,
  parts: number,
): Promise<unknown | null> {
  try {
    const record = await db.generations.get(genHash(text, template, parts))
    return record?.data ?? null
  } catch {
    return null
  }
}

export async function updateCachedGenerationByHash(hash: string, data: unknown): Promise<void> {
  try {
    const d = data as { title?: string; emoji?: string }
    await db.generations.update(hash, {
      data,
      title: d.title ?? 'Untitled',
      emoji: d.emoji ?? '✉',
    })
  } catch {}
}

export async function setCachedGeneration(
  text: string,
  template: string,
  parts: number,
  data: unknown,
): Promise<void> {
  try {
    const hash  = genHash(text, template, parts)
    const count = await db.generations.count()

    if (count >= MAX_GEN_ENTRIES) {
      const oldest = await db.generations.orderBy('createdAt').first()
      if (oldest) await db.generations.delete(oldest.hash)
    }

    const d = data as { title?: string; emoji?: string }
    await db.generations.put({
      hash,
      data,
      title:     d.title    ?? 'Untitled',
      emoji:     d.emoji    ?? '✉',
      template,
      parts,
      content:   text,
      createdAt: Date.now(),
    })
  } catch {}
}
