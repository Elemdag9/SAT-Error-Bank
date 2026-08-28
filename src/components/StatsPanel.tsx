import type { Stats } from '../lib/stats'

export function StatsPanel({ stats }: { stats: Stats }) {
  const cards = [
    { label: 'Total', value: stats.total, accent: 'text-ink-900 dark:text-ink-100' },
    { label: 'New', value: stats.byStatus.New, accent: 'text-blue-600 dark:text-blue-300' },
    { label: 'Reviewing', value: stats.byStatus.Reviewing, accent: 'text-amber-600 dark:text-amber-300' },
    { label: 'Mastered', value: stats.byStatus.Mastered, accent: 'text-emerald-600 dark:text-emerald-300' },
    { label: 'Repeated', value: stats.repeated, accent: 'text-rose-600 dark:text-rose-300' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((c) => (
        <div key={c.label} className="card px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500 dark:text-ink-400">{c.label}</p>
          <p className={`mt-1 text-2xl font-semibold tabular-nums ${c.accent}`}>{c.value}</p>
        </div>
      ))}
    </div>
  )
}

export function PatternsPanel({ stats }: { stats: Stats }) {
  const mathPct = stats.total ? Math.round((stats.bySection.Math / stats.total) * 100) : 0
  const rwPct = 100 - mathPct

  const errorEntries = Object.entries(stats.byErrorType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  const maxError = errorEntries[0]?.[1] ?? 1

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <div className="card p-4">
        <h3 className="mb-3 text-sm font-semibold text-ink-700 dark:text-ink-200">Error patterns</h3>
        {stats.topErrorType ? (
          <p className="mb-3 text-sm text-ink-600 dark:text-ink-400">
            Your most common mistake type is{' '}
            <span className="font-medium text-ink-900 dark:text-ink-100">{stats.topErrorType.name}</span>.
          </p>
        ) : (
          <p className="text-sm text-ink-400">No data yet.</p>
        )}
        <div className="space-y-1.5">
          {errorEntries.map(([name, count]) => (
            <div key={name} className="flex items-center gap-2">
              <span className="w-32 shrink-0 truncate text-xs text-ink-600 dark:text-ink-400">{name}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                <div
                  className="h-full rounded-full bg-ink-400 dark:bg-ink-500"
                  style={{ width: `${(count / maxError) * 100}%` }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-xs tabular-nums text-ink-500">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <h3 className="mb-3 text-sm font-semibold text-ink-700 dark:text-ink-200">Section & topics</h3>
        <div className="mb-4 flex h-3 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
          <div className="h-full bg-indigo-400 dark:bg-indigo-500" style={{ width: `${mathPct}%` }} />
          <div className="h-full bg-emerald-400 dark:bg-emerald-500" style={{ width: `${rwPct}%` }} />
        </div>
        <p className="mb-3 text-sm text-ink-600 dark:text-ink-400">
          <span className="font-medium text-indigo-600 dark:text-indigo-300">Math {mathPct}%</span>
          {' · '}
          <span className="font-medium text-emerald-600 dark:text-emerald-300">Reading & Writing {rwPct}%</span>
        </p>
        {stats.topTopics.length > 0 ? (
          <div className="space-y-1.5">
            {stats.topTopics.map((t) => (
              <div key={t.name} className="flex items-center justify-between text-xs">
                <span className="truncate text-ink-600 dark:text-ink-400">{t.name}</span>
                <span className="ml-2 shrink-0 text-ink-500">
                  {t.count} · {t.pct.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-400">Add topics to see which ones trip you up most.</p>
        )}
      </div>
    </div>
  )
}
