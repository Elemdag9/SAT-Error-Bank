import type { Mistake, MistakeInput } from './types'

const DB_NAME = 'sat-error-bank'
const DB_VERSION = 1
const STORE = 'mistakes'

let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE, mode)
        const store = transaction.objectStore(STORE)
        const request = fn(store)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      }),
  )
}

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10)
}

export function normalizeMistake(input: MistakeInput): Mistake {
  const now = Date.now()
  return {
    id: input.id ?? uid(),
    question: input.question,
    whyWrong: input.whyWrong,
    correctAnswer: input.correctAnswer,
    howToAvoid: input.howToAvoid,
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
    section: input.section,
    topic: input.topic,
    errorType: input.errorType,
    status: input.status ?? 'New',
    reviewCount: input.reviewCount ?? 0,
    lastReviewedAt: input.lastReviewedAt ?? null,
    notes: input.notes,
  }
}

export async function getAllMistakes(): Promise<Mistake[]> {
  const all = await tx<Mistake[]>('readonly', (s) => s.getAll() as IDBRequest<Mistake[]>)
  return all.sort((a, b) => b.createdAt - a.createdAt)
}

export async function putMistake(m: Mistake): Promise<void> {
  await tx('readwrite', (s) => s.put(m))
}

export async function putMistakes(list: Mistake[]): Promise<void> {
  const db = await openDB()
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite')
    const store = transaction.objectStore(STORE)
    for (const m of list) store.put(m)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

export async function deleteMistake(id: string): Promise<void> {
  await tx('readwrite', (s) => s.delete(id))
}

export async function clearAllMistakes(): Promise<void> {
  await tx('readwrite', (s) => s.clear())
}
