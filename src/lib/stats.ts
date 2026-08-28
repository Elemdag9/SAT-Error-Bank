import type { Mistake } from './types'

export interface Stats {
  total: number
  byStatus: { New: number; Reviewing: number; Mastered: number }
  repeated: number
  bySection: { Math: number; 'Reading & Writing': number }
  byErrorType: Record<string, number>
  byTopic: Record<string, number>
  topErrorType: { name: string; count: number } | null
  topTopics: { name: string; count: number; pct: number }[]
}

export function computeStats(mistakes: Mistake[]): Stats {
  const byStatus = { New: 0, Reviewing: 0, Mastered: 0 }
  const bySection = { Math: 0, 'Reading & Writing': 0 }
  const byErrorType: Record<string, number> = {}
  const byTopic: Record<string, number> = {}
  let repeated = 0

  for (const m of mistakes) {
    byStatus[m.status]++
    bySection[m.section]++
    byErrorType[m.errorType] = (byErrorType[m.errorType] ?? 0) + 1
    if (m.topic.trim()) byTopic[m.topic.trim()] = (byTopic[m.topic.trim()] ?? 0) + 1
    if (m.reviewCount > 0) repeated++
  }

  let topErrorType: Stats['topErrorType'] = null
  for (const [name, count] of Object.entries(byErrorType)) {
    if (!topErrorType || count > topErrorType.count) topErrorType = { name, count }
  }

  const total = mistakes.length
  const topTopics = Object.entries(byTopic)
    .map(([name, count]) => ({ name, count, pct: total ? (count / total) * 100 : 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return { total, byStatus, repeated, bySection, byErrorType, byTopic, topErrorType, topTopics }
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function relativeTime(ts: number | null): string {
  if (!ts) return 'never'
  const diff = Date.now() - ts
  const day = 86400000
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < day) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < day * 7) return `${Math.floor(diff / day)}d ago`
  return formatDate(ts)
}
