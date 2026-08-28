import { useMemo, useRef, useState } from 'react'
import { MistakeDetail, MistakeTable } from './components/MistakeTable'
import { MistakeForm } from './components/MistakeForm'
import { Modal } from './components/Modal'
import { PatternsPanel, StatsPanel } from './components/StatsPanel'
import { ReviewMode } from './components/ReviewMode'
import { useMistakes } from './lib/useMistakes'
import { useTheme } from './lib/useTheme'
import { useEscape } from './lib/useKeys'
import { buildAIPrompt, downloadFile, exportCSV, exportJSON, parseJSONBackup } from './lib/export'
import { computeStats } from './lib/stats'
import type { ErrorType, Mistake, Section, Status } from './lib/types'
import { ERROR_TYPES, SECTIONS, STATUSES } from './lib/types'

type SortKey = 'newest' | 'oldest' | 'repeated' | 'reviewed'
type View = 'dashboard' | 'review'

export default function App() {
  const {
    mistakes,
    loading,
    addMistake,
    updateMistake,
    removeMistake,
    markRepeated,
    setReviewStatus,
    replaceAll,
    mergeAll,
  } = useMistakes()
  const { theme, toggle } = useTheme()

  const [view, setView] = useState<View>('dashboard')
  const [query, setQuery] = useState('')
  const [sectionFilter, setSectionFilter] = useState<'All' | Section>('All')
  const [errorFilter, setErrorFilter] = useState<'All' | ErrorType>('All')
  const [statusFilter, setStatusFilter] = useState<'All' | Status>('All')
  const [sort, setSort] = useState<SortKey>('newest')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Mistake | null>(null)
  const [detail, setDetail] = useState<Mistake | null>(null)

  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [aiOpen, setAiOpen] = useState(false)
  const [aiCopied, setAiCopied] = useState(false)

  const [importOpen, setImportOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge')
  const [importError, setImportError] = useState('')

  const stats = useMemo(() => computeStats(mistakes), [mistakes])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = mistakes.filter((m) => {
      if (sectionFilter !== 'All' && m.section !== sectionFilter) return false
      if (errorFilter !== 'All' && m.errorType !== errorFilter) return false
      if (statusFilter !== 'All' && m.status !== statusFilter) return false
      if (q) {
        const hay = [m.question, m.whyWrong, m.correctAnswer, m.howToAvoid, m.topic, m.notes]
          .join(' ')
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'oldest':
          return a.createdAt - b.createdAt
        case 'repeated':
          return b.reviewCount - a.reviewCount || b.createdAt - a.createdAt
        case 'reviewed':
          return (b.lastReviewedAt ?? 0) - (a.lastReviewedAt ?? 0)
        default:
          return b.createdAt - a.createdAt
      }
    })
    return list
  }, [mistakes, query, sectionFilter, errorFilter, statusFilter, sort])

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (m: Mistake) => {
    setEditing(m)
    setFormOpen(true)
    setDetail(null)
  }

  useEscape(() => {
    if (formOpen) setFormOpen(false)
    else if (aiOpen) setAiOpen(false)
    else if (importOpen) setImportOpen(false)
    else if (detail) setDetail(null)
  })

  const handleAddOrUpdate = async (data: Parameters<typeof addMistake>[0]) => {
    if (editing) {
      await updateMistake(editing.id, data)
    } else {
      await addMistake(data)
    }
    setFormOpen(false)
    setEditing(null)
  }

  const handleDelete = async () => {
    if (!detail) return
    if (!confirm('Delete this mistake? This cannot be undone.')) return
    await removeMistake(detail.id)
    setDetail(null)
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectedMistakes = useMemo(
    () => mistakes.filter((m) => selectedIds.has(m.id)),
    [mistakes, selectedIds],
  )

  const aiPrompt = useMemo(() => {
    const targets = selectionMode && selectedMistakes.length > 0 ? selectedMistakes : filtered
    return buildAIPrompt(targets)
  }, [selectionMode, selectedMistakes, filtered])

  const copyAI = async () => {
    try {
      await navigator.clipboard.writeText(aiPrompt)
      setAiCopied(true)
      setTimeout(() => setAiCopied(false), 2000)
    } catch {
      setAiCopied(false)
    }
  }

  const handleExportCSV = () => {
    downloadFile(`sat-errors-${new Date().toISOString().slice(0, 10)}.csv`, exportCSV(mistakes), 'text/csv')
  }
  const handleExportJSON = () => {
    downloadFile(`sat-errors-${new Date().toISOString().slice(0, 10)}.json`, exportJSON(mistakes), 'application/json')
  }

  const fileInputRef = useRef<HTMLInputElement>(null)
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setImportText(String(reader.result ?? ''))
      setImportOpen(true)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const confirmImport = async () => {
    setImportError('')
    try {
      const list = parseJSONBackup(importText)
      if (importMode === 'replace') await replaceAll(list)
      else await mergeAll(list)
      setImportOpen(false)
      setImportText('')
    } catch (err) {
      setImportError((err as Error).message || 'Could not parse backup file.')
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-ink-200 bg-ink-50/80 backdrop-blur-md dark:border-ink-800 dark:bg-ink-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900 text-white dark:bg-ink-100 dark:text-ink-900">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2 2 7l10 5 10-5-10-5Z" />
                <path d="m2 17 10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-semibold leading-tight text-ink-900 dark:text-ink-100">SAT Error Bank</h1>
              <p className="text-[11px] leading-tight text-ink-500 dark:text-ink-400">
                {mistakes.length} mistake{mistakes.length === 1 ? '' : 's'} · offline
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="hidden items-center rounded-lg border border-ink-200 p-0.5 dark:border-ink-700 sm:flex">
              <button
                onClick={() => setView('dashboard')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  view === 'dashboard'
                    ? 'bg-ink-900 text-white dark:bg-ink-100 dark:text-ink-900'
                    : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setView('review')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  view === 'review'
                    ? 'bg-ink-900 text-white dark:bg-ink-100 dark:text-ink-900'
                    : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800'
                }`}
              >
                Review
              </button>
            </div>
            <button onClick={toggle} className="btn-ghost px-2" title="Toggle theme" aria-label="Toggle theme">
              {theme === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {view === 'review' ? (
          <ReviewMode
            mistakes={mistakes}
            onExit={() => setView('dashboard')}
            onMark={(id, status) => setReviewStatus(id, status)}
            onRepeat={(id) => markRepeated(id)}
          />
        ) : (
          <>
            {/* Stats */}
            <section className="mb-6 space-y-3">
              <StatsPanel stats={stats} />
              <PatternsPanel stats={stats} />
            </section>

            {/* Toolbar */}
            <section className="mb-4 space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                  <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <input
                    className="input pl-9"
                    placeholder="Search mistakes..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={openAdd} className="btn-primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Add Mistake
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select className="input w-auto py-1.5 text-xs" value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value as 'All' | Section)}>
                  <option value="All">All sections</option>
                  {SECTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <select className="input w-auto py-1.5 text-xs" value={errorFilter} onChange={(e) => setErrorFilter(e.target.value as 'All' | ErrorType)}>
                  <option value="All">All error types</option>
                  {ERROR_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <select className="input w-auto py-1.5 text-xs" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'All' | Status)}>
                  <option value="All">All statuses</option>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <select className="input w-auto py-1.5 text-xs" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="repeated">Most repeated</option>
                  <option value="reviewed">Recently reviewed</option>
                </select>

                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectionMode((s) => !s)
                      if (selectionMode) setSelectedIds(new Set())
                    }}
                    className={selectionMode ? 'btn-primary py-1.5 text-xs' : 'btn-outline py-1.5 text-xs'}
                  >
                    {selectionMode ? `Selecting (${selectedIds.size})` : 'Select'}
                  </button>
                  <button onClick={() => setAiOpen(true)} className="btn-outline py-1.5 text-xs">
                    Copy for AI
                  </button>
                  <div className="relative">
                    <button className="btn-outline py-1.5 text-xs" onClick={() => fileInputRef.current?.click()}>
                      Import
                    </button>
                    <input ref={fileInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleFileImport} />
                  </div>
                  <button onClick={handleExportCSV} className="btn-outline py-1.5 text-xs">CSV</button>
                  <button onClick={handleExportJSON} className="btn-outline py-1.5 text-xs">JSON</button>
                </div>
              </div>
            </section>

            {/* Table */}
            <section>
              {loading ? (
                <div className="py-20 text-center text-sm text-ink-400">Loading your error bank...</div>
              ) : (
                <MistakeTable
                  mistakes={filtered}
                  onOpen={setDetail}
                  onToggleSelect={toggleSelect}
                  selectedIds={selectedIds}
                  selectionMode={selectionMode}
                  query={query}
                />
              )}
            </section>
          </>
        )}
      </main>

      {/* Add/Edit Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit mistake' : 'Add mistake'}
        size="xl"
      >
        <MistakeForm
          initial={editing}
          onSubmit={handleAddOrUpdate}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Mistake details" size="lg">
        {detail && (
          <MistakeDetail
            mistake={mistakes.find((m) => m.id === detail.id) ?? detail}
            onClose={() => setDetail(null)}
            onEdit={() => openEdit(detail)}
            onDelete={handleDelete}
            onMarkRepeated={() => {
              markRepeated(detail.id)
            }}
          />
        )}
      </Modal>

      {/* AI Modal */}
      <Modal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        title="Copy for AI"
        size="lg"
        footer={
          <>
            <button onClick={() => setAiOpen(false)} className="btn-ghost">Close</button>
            <button onClick={copyAI} className="btn-primary">
              {aiCopied ? 'Copied!' : 'Copy to clipboard'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-ink-600 dark:text-ink-400">
            {selectionMode && selectedMistakes.length > 0
              ? `Using ${selectedMistakes.length} selected mistake(s).`
              : `Using ${filtered.length} mistake(s) matching current filters.`}{' '}
            Paste into ChatGPT, Claude, or Gemini to generate Anki flashcards.
          </p>
          <pre className="max-h-[50vh] overflow-auto rounded-lg border border-ink-200 bg-ink-50 p-3 text-xs leading-relaxed text-ink-700 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-300">
            {aiPrompt}
          </pre>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Import backup"
        size="md"
        footer={
          <>
            <button onClick={() => setImportOpen(false)} className="btn-ghost">Cancel</button>
            <button onClick={confirmImport} className="btn-primary">Import</button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-ink-600 dark:text-ink-400">
            Found a backup file. Choose how to import it:
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setImportMode('merge')}
              className={`flex-1 rounded-lg border p-3 text-left transition-colors ${
                importMode === 'merge'
                  ? 'border-ink-900 bg-ink-50 dark:border-ink-100 dark:bg-ink-800'
                  : 'border-ink-200 dark:border-ink-700'
              }`}
            >
              <p className="text-sm font-medium text-ink-900 dark:text-ink-100">Merge</p>
              <p className="text-xs text-ink-500">Add new and overwrite duplicates by ID.</p>
            </button>
            <button
              onClick={() => setImportMode('replace')}
              className={`flex-1 rounded-lg border p-3 text-left transition-colors ${
                importMode === 'replace'
                  ? 'border-ink-900 bg-ink-50 dark:border-ink-100 dark:bg-ink-800'
                  : 'border-ink-200 dark:border-ink-700'
              }`}
            >
              <p className="text-sm font-medium text-ink-900 dark:text-ink-100">Replace</p>
              <p className="text-xs text-ink-500">Delete everything and restore from backup.</p>
            </button>
          </div>
          {importError && (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
              {importError}
            </p>
          )}
        </div>
      </Modal>
    </div>
  )
}
