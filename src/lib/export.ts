import type { Mistake } from './types'

export function exportJSON(mistakes: Mistake[]): string {
  return JSON.stringify(
    {
      app: 'sat-error-bank',
      version: 1,
      exportedAt: new Date().toISOString(),
      count: mistakes.length,
      mistakes,
    },
    null,
    2,
  )
}

export function parseJSONBackup(text: string): Mistake[] {
  const data = JSON.parse(text)
  const list = Array.isArray(data) ? data : data.mistakes
  if (!Array.isArray(list)) throw new Error('Invalid backup: no mistakes array found.')
  return list as Mistake[]
}

const CSV_HEADERS = [
  'Question',
  'Why Wrong',
  'Correct Answer',
  'How To Avoid',
  'Section',
  'Topic',
  'Error Type',
  'Status',
]

function csvEscape(value: string): string {
  const v = value ?? ''
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`
  return v
}

export function exportCSV(mistakes: Mistake[]): string {
  const rows = mistakes.map((m) =>
    [
      m.question,
      m.whyWrong,
      m.correctAnswer,
      m.howToAvoid,
      m.section,
      m.topic,
      m.errorType,
      m.status,
    ]
      .map(csvEscape)
      .join(','),
  )
  return [CSV_HEADERS.join(','), ...rows].join('\n')
}

export function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const AI_PROMPT_HEADER = `Convert these SAT mistakes into high-quality Anki flashcards.

The goal is not to memorize the original questions.

The goal is to prevent the same mistake from happening again.

For each mistake:

1. Identify the underlying concept.
2. Identify the reason for the mistake.
3. Create an active recall flashcard.
4. Create a concise answer.
5. Include the rule or strategy that prevents this mistake.

Avoid simply copying the original question.

Mistakes:
`

export function buildAIPrompt(mistakes: Mistake[]): string {
  const data = mistakes
    .map((m, i) => {
      return [
        `### Mistake ${i + 1}`,
        `Section: ${m.section}`,
        `Topic: ${m.topic || '(none)'}`,
        `Error type: ${m.errorType}`,
        `Question: ${m.question}`,
        `Why I got it wrong: ${m.whyWrong}`,
        `Correct answer: ${m.correctAnswer}`,
        `How to avoid it: ${m.howToAvoid}`,
        m.notes ? `Notes: ${m.notes}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n\n')
  return AI_PROMPT_HEADER + data
}
