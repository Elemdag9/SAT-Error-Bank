import { useEffect, useRef, useState } from 'react'
import type { ErrorType, Mistake, Section, Status } from '../lib/types'
import { ERROR_TYPES, SECTIONS } from '../lib/types'
import { useCtrlEnter } from '../lib/useKeys'

interface MistakeFormProps {
  initial?: Mistake | null
  onSubmit: (data: {
    question: string
    whyWrong: string
    correctAnswer: string
    howToAvoid: string
    section: Section
    topic: string
    errorType: ErrorType
    status: Status
    notes: string
  }) => void
  onCancel: () => void
}

const empty = {
  question: '',
  whyWrong: '',
  correctAnswer: '',
  howToAvoid: '',
  section: 'Math' as Section,
  topic: '',
  errorType: 'Concept Gap' as ErrorType,
  notes: '',
}

export function MistakeForm({ initial, onSubmit, onCancel }: MistakeFormProps) {
  const [form, setForm] = useState(() =>
    initial
      ? {
          question: initial.question,
          whyWrong: initial.whyWrong,
          correctAnswer: initial.correctAnswer,
          howToAvoid: initial.howToAvoid,
          section: initial.section,
          topic: initial.topic,
          errorType: initial.errorType,
          notes: initial.notes,
        }
      : empty,
  )
  const [error, setError] = useState('')
  const firstRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    firstRef.current?.focus()
  }, [])

  const submit = () => {
    if (!form.question.trim() || !form.whyWrong.trim() || !form.correctAnswer.trim() || !form.howToAvoid.trim()) {
      setError('Question, Why Wrong, Correct Answer, and How To Avoid are required.')
      return
    }
    onSubmit({
      ...form,
      topic: form.topic.trim(),
      notes: form.notes.trim(),
      status: initial?.status ?? 'New',
    })
  }

  useCtrlEnter(submit)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className="space-y-4"
    >
      <div>
        <label className="label">Question</label>
        <textarea
          ref={firstRef}
          className="input min-h-[90px] resize-y font-mono text-[13px] leading-relaxed"
          value={form.question}
          onChange={(e) => setForm({ ...form, question: e.target.value })}
          placeholder="Paste or type the question here..."
        />
      </div>

      <div>
        <label className="label">Why did I get it wrong?</label>
        <textarea
          className="input min-h-[70px] resize-y"
          value={form.whyWrong}
          onChange={(e) => setForm({ ...form, whyWrong: e.target.value })}
          placeholder="What was the mistake? Be honest and specific."
        />
      </div>

      <div>
        <label className="label">Correct answer</label>
        <textarea
          className="input min-h-[60px] resize-y"
          value={form.correctAnswer}
          onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}
          placeholder="The correct answer and why it's right."
        />
      </div>

      <div>
        <label className="label">How can I avoid this mistake next time?</label>
        <textarea
          className="input min-h-[60px] resize-y"
          value={form.howToAvoid}
          onChange={(e) => setForm({ ...form, howToAvoid: e.target.value })}
          placeholder="The rule, check, or habit that prevents this error."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="label">Section</label>
          <select
            className="input"
            value={form.section}
            onChange={(e) => setForm({ ...form, section: e.target.value as Section })}
          >
            {SECTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Topic</label>
          <input
            className="input"
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            placeholder="e.g. Algebra, Grammar"
            list="topic-suggestions"
          />
          <datalist id="topic-suggestions">
            <option value="Algebra" />
            <option value="Advanced Math" />
            <option value="Problem Solving" />
            <option value="Geometry" />
            <option value="Statistics" />
            <option value="Grammar" />
            <option value="Transitions" />
            <option value="Main Idea" />
            <option value="Evidence" />
            <option value="Vocabulary" />
            <option value="Rhetorical Synthesis" />
          </datalist>
        </div>
        <div>
          <label className="label">Error type</label>
          <select
            className="input"
            value={form.errorType}
            onChange={(e) => setForm({ ...form, errorType: e.target.value as ErrorType })}
          >
            {ERROR_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Notes (optional)</label>
        <textarea
          className="input min-h-[50px] resize-y"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Anything extra — context, test number, source..."
        />
      </div>

      {error && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 pt-1">
        <span className="text-xs text-ink-400">
          <kbd className="rounded border border-ink-200 px-1.5 py-0.5 font-mono text-[11px] dark:border-ink-700">
            ⌘/Ctrl + Enter
          </kbd>{' '}
          to save
        </span>
        <div className="flex gap-2">
          <button type="button" className="btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {initial ? 'Save changes' : 'Add mistake'}
          </button>
        </div>
      </div>
    </form>
  )
}
