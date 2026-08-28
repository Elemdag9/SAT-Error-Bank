import type { Mistake } from '../lib/types'
import { ERROR_TYPE_COLORS, SECTION_COLORS, STATUS_COLORS } from '../lib/types'
import { formatDate, relativeTime } from '../lib/stats'

interface MistakeTableProps {
  mistakes: Mistake[]
  onOpen: (m: Mistake) => void
  onToggleSelect?: (id: string) => void
  selectedIds?: Set<string>
  selectionMode?: boolean
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-yellow-200 px-0.5 dark:bg-yellow-500/40">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

export function MistakeTable({ mistakes, onOpen, onToggleSelect, selectedIds, selectionMode, query = '' }: MistakeTableProps & { query?: string }) {
  if (mistakes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 py-16 text-center dark:border-ink-700">
        <p className="text-sm text-ink-500">No mistakes found.</p>
        <p className="mt-1 text-xs text-ink-400">Add your first mistake to start building your error bank.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {mistakes.map((m) => (
        <div
          key={m.id}
          className={`card group cursor-pointer transition-colors hover:border-ink-300 dark:hover:border-ink-600 ${
            m.reviewCount > 0 ? 'ring-1 ring-rose-200 dark:ring-rose-900/50' : ''
          }`}
          onClick={() => (selectionMode ? onToggleSelect?.(m.id) : onOpen(m))}
        >
          <div className="flex items-start gap-3 px-4 py-3">
            {selectionMode && (
              <input
                type="checkbox"
                checked={selectedIds?.has(m.id) ?? false}
                onChange={() => onToggleSelect?.(m.id)}
                onClick={(e) => e.stopPropagation()}
                className="mt-1 h-4 w-4 rounded border-ink-300 text-ink-900 focus:ring-ink-400 dark:border-ink-600 dark:bg-ink-800"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <p className="line-clamp-2 text-sm font-medium text-ink-900 dark:text-ink-100">
                  <Highlight text={m.question} query={query} />
                </p>
                <div className="flex shrink-0 items-center gap-1.5">
                  {m.reviewCount > 0 && (
                    <span className="badge bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200" title={`Repeated ${m.reviewCount} time(s)`}>
                  ×{m.reviewCount}
                    </span>
                  )}
                </div>
              </div>
              <p className="mt-1 line-clamp-1 text-xs text-ink-500 dark:text-ink-400">
                <Highlight text={m.whyWrong} query={query} />
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className={`badge ${SECTION_COLORS[m.section]}`}>{m.section}</span>
                <span className={`badge ${ERROR_TYPE_COLORS[m.errorType]}`}>{m.errorType}</span>
                <span className={`badge ${STATUS_COLORS[m.status]}`}>{m.status}</span>
                {m.topic && (
                  <span className="badge bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300">{m.topic}</span>
                )}
                <span className="ml-auto text-[11px] text-ink-400">{formatDate(m.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function MistakeDetail({ mistake, onClose, onEdit, onDelete, onMarkRepeated }: {
  mistake: Mistake
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  onMarkRepeated: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`badge ${SECTION_COLORS[mistake.section]}`}>{mistake.section}</span>
        <span className={`badge ${ERROR_TYPE_COLORS[mistake.errorType]}`}>{mistake.errorType}</span>
        <span className={`badge ${STATUS_COLORS[mistake.status]}`}>{mistake.status}</span>
        {mistake.topic && (
          <span className="badge bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300">{mistake.topic}</span>
        )}
        {mistake.reviewCount > 0 && (
          <span className="badge bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200">
            Repeated ×{mistake.reviewCount}
          </span>
        )}
      </div>

      <Field label="Question">
        <p className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-ink-800 dark:text-ink-200">
          {mistake.question}
        </p>
      </Field>
      <Field label="Why I got it wrong">
        <p className="whitespace-pre-wrap text-sm text-ink-700 dark:text-ink-300">{mistake.whyWrong}</p>
      </Field>
      <Field label="Correct answer">
        <p className="whitespace-pre-wrap text-sm text-ink-700 dark:text-ink-300">{mistake.correctAnswer}</p>
      </Field>
      <Field label="How to avoid it">
        <p className="whitespace-pre-wrap text-sm text-ink-700 dark:text-ink-300">{mistake.howToAvoid}</p>
      </Field>
      {mistake.notes && (
        <Field label="Notes">
          <p className="whitespace-pre-wrap text-sm text-ink-600 dark:text-ink-400">{mistake.notes}</p>
        </Field>
      )}

      <div className="grid grid-cols-2 gap-3 border-t border-ink-200 pt-3 text-xs text-ink-500 dark:border-ink-800 dark:text-ink-400 sm:grid-cols-3">
        <div>
          <span className="label mb-0.5">Created</span>
          {formatDate(mistake.createdAt)}
        </div>
        <div>
          <span className="label mb-0.5">Updated</span>
          {relativeTime(mistake.updatedAt)}
        </div>
        <div>
          <span className="label mb-0.5">Last reviewed</span>
          {relativeTime(mistake.lastReviewedAt)}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink-200 pt-4 dark:border-ink-800">
        <button
          onClick={onMarkRepeated}
          className="btn-outline text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-900/30"
        >
          I made this mistake again
        </button>
        <div className="flex gap-2">
          <button onClick={onDelete} className="btn-ghost text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-900/30">
            Delete
          </button>
          <button onClick={onEdit} className="btn-outline">
            Edit
          </button>
          <button onClick={onClose} className="btn-primary">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="label">{label}</span>
      {children}
    </div>
  )
}
