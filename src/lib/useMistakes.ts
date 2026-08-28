import { useCallback, useEffect, useState } from 'react'
import type { Mistake, MistakeInput } from './types'
import {
  clearAllMistakes,
  deleteMistake,
  getAllMistakes,
  normalizeMistake,
  putMistake,
  putMistakes,
} from './db'

export function useMistakes() {
  const [mistakes, setMistakes] = useState<Mistake[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const all = await getAllMistakes()
    setMistakes(all)
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const addMistake = useCallback(
    async (input: MistakeInput) => {
      const m = normalizeMistake(input)
      await putMistake(m)
      setMistakes((prev) => [m, ...prev])
      return m
    },
    [],
  )

  const updateMistake = useCallback(
    async (id: string, patch: Partial<MistakeInput>) => {
      setMistakes((prev) => {
        const existing = prev.find((m) => m.id === id)
        if (!existing) return prev
        const updated: Mistake = {
          ...existing,
          ...patch,
          updatedAt: Date.now(),
        } as Mistake
        putMistake(updated)
        return prev.map((m) => (m.id === id ? updated : m))
      })
    },
    [],
  )

  const removeMistake = useCallback(async (id: string) => {
    await deleteMistake(id)
    setMistakes((prev) => prev.filter((m) => m.id !== id))
  }, [])

  const markRepeated = useCallback(async (id: string) => {
    setMistakes((prev) => {
      const existing = prev.find((m) => m.id === id)
      if (!existing) return prev
      const updated: Mistake = {
        ...existing,
        reviewCount: existing.reviewCount + 1,
        lastReviewedAt: Date.now(),
        status: existing.status === 'Mastered' ? 'Reviewing' : existing.status,
        updatedAt: Date.now(),
      }
      putMistake(updated)
      return prev.map((m) => (m.id === id ? updated : m))
    })
  }, [])

  const setReviewStatus = useCallback(async (id: string, status: Mistake['status']) => {
    setMistakes((prev) => {
      const existing = prev.find((m) => m.id === id)
      if (!existing) return prev
      const updated: Mistake = {
        ...existing,
        status,
        lastReviewedAt: Date.now(),
        updatedAt: Date.now(),
      }
      putMistake(updated)
      return prev.map((m) => (m.id === id ? updated : m))
    })
  }, [])

  const replaceAll = useCallback(async (list: MistakeInput[]) => {
    const normalized = list.map((i) => normalizeMistake(i))
    await clearAllMistakes()
    await putMistakes(normalized)
    setMistakes(normalized.sort((a, b) => b.createdAt - a.createdAt))
  }, [])

  const mergeAll = useCallback(async (list: MistakeInput[]) => {
    const incoming = list.map((i) => normalizeMistake(i))
    await putMistakes(incoming)
    await refresh()
  }, [refresh])

  return {
    mistakes,
    loading,
    addMistake,
    updateMistake,
    removeMistake,
    markRepeated,
    setReviewStatus,
    replaceAll,
    mergeAll,
    refresh,
  }
}
