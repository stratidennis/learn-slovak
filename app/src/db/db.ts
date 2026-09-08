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

class SlovakDB extends Dexie {
  cards!: Table<CardRow, string>
  reviews!: Table<ReviewRow, number>
  lemmas!: Table<LemmaRow, string>
  chunks!: Table<ChunkRow, string>
  settings!: Table<SettingRow, string>
  constructor() {
    super('learn-slovak')
    this.version(1).stores({
      cards: 'id, unitId, due',
      reviews: '++id, cardId, at',
      lemmas: 'lemma, status',
      chunks: 'id, unitId',
      settings: 'key',
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
  const [cards, reviews, lemmas, chunks, settings] = await Promise.all([
    db.cards.toArray(), db.reviews.toArray(), db.lemmas.toArray(), db.chunks.toArray(), db.settings.toArray()])
  return { version: 1, exportedAt: new Date().toISOString(), cards, reviews, lemmas, chunks, settings }
}
export async function importAll(data: Awaited<ReturnType<typeof exportAll>>) {
  await db.transaction('rw', [db.cards, db.reviews, db.lemmas, db.chunks, db.settings], async () => {
    await Promise.all([db.cards.clear(), db.reviews.clear(), db.lemmas.clear(), db.chunks.clear(), db.settings.clear()])
    await db.cards.bulkPut(data.cards); await db.reviews.bulkPut(data.reviews)
    await db.lemmas.bulkPut(data.lemmas); await db.chunks.bulkPut(data.chunks); await db.settings.bulkPut(data.settings)
  })
}
