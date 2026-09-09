import Dexie, { type Table } from 'dexie'
import type { Card as FsrsCard } from 'ts-fsrs'

export type CardRow = {
  id: string            // sentence id, e.g. "tat:408366"
  unitId: string
  mode: 'listen_type'
  lemmas: string[]
  fsrs: FsrsCard
  due: number           // ms epoch, indexed
  reps: number
  lapses: number
  createdAt: number
}
export type ReviewRow = { id?: number; cardId: string; at: number; rating: number; tier: 'exact' | 'diacritics' | 'wrong'; typed: string; ms: number }
export type LemmaRow = { lemma: string; status: 'learning' | 'known'; firstSeen: number; good: number; bad: number }
export type ChunkRow = { id: string; unitId: string; seen: number; lastAt: number }
export type SettingRow = { key: string; value: unknown }
export type ItemStateRow = { id: string; unitId: string; kind: string; stage: number; streak: number; seen: number; lastAt: number; stageAtDayStart: number; dayKey: string }
export type SessionRow = { id?: number; unitId: string; lessonId?: string; mode?: 'lesson' | 'practice'; at: number; steps: number; correct: number; advanced: number }

class SlovakDB extends Dexie {
  cards!: Table<CardRow, string>
  reviews!: Table<ReviewRow, number>
  lemmas!: Table<LemmaRow, string>
  chunks!: Table<ChunkRow, string>
  settings!: Table<SettingRow, string>
  items!: Table<ItemStateRow, string>
  sessions!: Table<SessionRow, number>
  constructor() {
    super('learn-slovak')
    this.version(1).stores({
      cards: 'id, unitId, due',
      reviews: '++id, cardId, at',
      lemmas: 'lemma, status',
      chunks: 'id, unitId',
      settings: 'key',
    })
    // v2: per-item mastery for the lesson engine (curriculum/LEARNING-ENGINE.md §2) + session log
    this.version(2).stores({
      cards: 'id, unitId, due',
      reviews: '++id, cardId, at',
      lemmas: 'lemma, status',
      chunks: 'id, unitId',
      settings: 'key',
      items: 'id, unitId, stage, lastAt',
      sessions: '++id, unitId, at',
    })
  }
}
export const db = new SlovakDB()

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const row = await db.settings.get(key)
  return row ? (row.value as T) : fallback
}
export const setSetting = (key: string, value: unknown) => db.settings.put({ key, value })

/** Everything the learner owns, as one JSON blob. No account, no cloud — this is the backup. */
export async function exportAll() {
  const [cards, reviews, lemmas, chunks, settings, items, sessions] = await Promise.all([
    db.cards.toArray(), db.reviews.toArray(), db.lemmas.toArray(), db.chunks.toArray(), db.settings.toArray(), db.items.toArray(), db.sessions.toArray()])
  return { version: 2, exportedAt: new Date().toISOString(), cards, reviews, lemmas, chunks, settings, items, sessions }
}
export async function importAll(data: Awaited<ReturnType<typeof exportAll>>) {
  await db.transaction('rw', [db.cards, db.reviews, db.lemmas, db.chunks, db.settings, db.items, db.sessions], async () => {
    await Promise.all([db.cards.clear(), db.reviews.clear(), db.lemmas.clear(), db.chunks.clear(), db.settings.clear(), db.items.clear(), db.sessions.clear()])
    await db.cards.bulkPut(data.cards); await db.reviews.bulkPut(data.reviews)
    await db.lemmas.bulkPut(data.lemmas); await db.chunks.bulkPut(data.chunks); await db.settings.bulkPut(data.settings)
    if (data.items) await db.items.bulkPut(data.items); if (data.sessions) await db.sessions.bulkPut(data.sessions)
  })
}
