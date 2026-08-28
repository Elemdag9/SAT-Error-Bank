import { useMemo, useState } from 'react'
import type { Mistake } from '../lib/types'
import { ERROR_TYPE_COLORS, SECTION_COLORS, STATUS_COLORS } from '../lib/types'

interface ReviewModeProps {
  mistakes: Mistake[]
  onExit: () => void
  onMark: (id: string, status: Mistake['status']) => void
  onRepeat: (id: string) => void
}

function rank(m: Mistake): number {
  let score = 0
  if (m.reviewCount > 0) score += 1000
  score += Math.min(500, m.reviewCount * 100)
  score -= Math.floor((Date.now() - m.createdAt) / 86400000)
  if (m.status === 'Reviewing') score += 200
  if (m.status === 'New') score += 100
  return score
}

export function ReviewMode({ mistakes, onExit, onMark, onRepeat }: ReviewModeProps) {
  const queue = useMemo(() => {
    const reviewable = mistakes.filter((m) => m.status !== 'Mastered')
    return [...reviewable].sort((a, b) => rank(b) - rank(a))
  }, [mistakes])

  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)

  const current = queue[index]

  const next = () => {
    setRevealed(false)
    setIndex((i) => Math.min(i + 1, queue.length))
  }

  const handleMark = (status: Mistake['status']) => {
    if (!current) return
    onMark(current.id, status)
    next()
  }

  const handleRepeat = () => {
    if (!current) return
    onRepeat(current.id)
    next()
  }

  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-semibold text-ink-800 dark:text-ink-100">All caught up</p>
        <p className="mt-1 text-sm text-ink-500">No mistakes left to review right now.</p>
        <button onClick={onExit} className="btn-primary mt-6">
          Back to dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-500 dark:text-ink-400">
          Review · {index + 1} of {queue.length}
        </span>
        <button onClick={onExit} className="btn-ghost text-xs">
          Exit review
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-1.5 border-b border-ink-200 px-5 py-3 dark:border-ink-800">
          <span className={`badge ${SECTION_COLORS[current.section]}`}>{current.section}</span>
          <span className={`badge ${ERROR_TYPE_COLORS[current.errorType]}`}>{current.errorType}</span>
          {current.topic && (
            <span className="badge bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300">{current.topic}</span>
          )}
          {current.reviewCount > 0 && (
            <span className="badge bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200">
              Repeated ×{current.reviewCount}
            </span>
          )}
        </div>

        <div className="px-5 py-5">
          <span className="label">Question</span>
          <p className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-ink-900 dark:text-ink-100">
            {current.question}
          </p>

          {!revealed ? (
            <button onClick={() => setRevealed(true)} className="btn-outline mt-6 w-full py-3 text-sm">
              Reveal explanation
            </button>
          ) : (
            <div className="mt-5 space-y-4 animate-fade-in">
              <div className="rounded-lg bg-ink-50 p-3 dark:bg-ink-800/50">
                <span className="label mb-1">Why I got it wrong</span>
                <p className="whitespace-pre-wrap text-sm text-ink-700 dark:text-ink-300">{current.whyWrong}</p>
              </div>
              <div className="rounded-lg bg-ink-50 p-3 dark:bg-ink-800/50">
                <span className="label mb-1">Correct answer</span>
                <p className="whitespace-pre-wrap text-sm text-ink-700 dark:text-ink-300">{current.correctAnswer}</p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
                <span className="label mb-1 text-emerald-700 dark:text-emerald-300">How to avoid it</span>
                <p className="whitespace-pre-wrap text-sm text-emerald-900 dark:text-emerald-200">{current.howToAvoid}</p>
              </div>
              {current.notes && (
                <div className="rounded-lg bg-ink-50 p-3 dark:bg-ink-800/50">
                  <span className="label mb-1">Notes</span>
                  <p className="whitespace-pre-wrap text-sm text-ink-600 dark:text-ink-400">{current.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                  onClick={handleRepeat}
                  className="btn-outline border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-300 dark:hover:bg-rose-900/30"
                >
                  Still Weak
                </button>
                <button
                  onClick={() => handleMark('Reviewing')}
                  className="btn-outline border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-900/50 dark:text-amber-300 dark:hover:bg-amber-900/30"
                >
                  Understood
                </button>
                <button
                  onClick={() => handleMark('Mastered')}
                  className="btn-outline border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/50 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
                >
                  Mastered
                </button>
              </div>
              <p className="text-center text-[11px] text-ink-400">
                <span className={`badge ${STATUS_COLORS[current.status]}`}>Currently: {current.status}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex justify-between">
        <button onClick={onExit} className="btn-ghost text-xs">
          Exit
        </button>
        {revealed && (
          <button onClick={next} className="btn-ghost text-xs">
            Skip →
          </button>
        )}
      </div>
    </div>
  )
}
