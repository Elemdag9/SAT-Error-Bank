export type Section = 'Math' | 'Reading & Writing'

export type ErrorType =
  | 'Concept Gap'
  | 'Misread Question'
  | 'Careless Mistake'
  | 'Reasoning Error'
  | 'Time Pressure'
  | 'Vocabulary / Language'
  | 'Forgot Rule / Formula'
  | 'Guessed'
  | 'Trap Answer'
  | 'Other'

export type Status = 'New' | 'Reviewing' | 'Mastered'

export const SECTIONS: Section[] = ['Math', 'Reading & Writing']

export const ERROR_TYPES: ErrorType[] = [
  'Concept Gap',
  'Misread Question',
  'Careless Mistake',
  'Reasoning Error',
  'Time Pressure',
  'Vocabulary / Language',
  'Forgot Rule / Formula',
  'Guessed',
  'Trap Answer',
  'Other',
]

export const STATUSES: Status[] = ['New', 'Reviewing', 'Mastered']

export interface Mistake {
  id: string
  question: string
  whyWrong: string
  correctAnswer: string
  howToAvoid: string
  createdAt: number
  updatedAt: number
  section: Section
  topic: string
  errorType: ErrorType
  status: Status
  reviewCount: number
  lastReviewedAt: number | null
  notes: string
}

export type MistakeInput = Omit<Mistake, 'id' | 'createdAt' | 'updatedAt' | 'reviewCount' | 'lastReviewedAt' | 'status'> & {
  id?: string
  status?: Status
  reviewCount?: number
  lastReviewedAt?: number | null
  createdAt?: number
  updatedAt?: number
}

export const ERROR_TYPE_COLORS: Record<ErrorType, string> = {
  'Concept Gap': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  'Misread Question': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  'Careless Mistake': 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
  'Reasoning Error': 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200',
  'Time Pressure': 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
  'Vocabulary / Language': 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200',
  'Forgot Rule / Formula': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200',
  Guessed: 'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-200',
  'Trap Answer': 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-200',
  Other: 'bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200',
}

export const STATUS_COLORS: Record<Status, string> = {
  New: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  Reviewing: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  Mastered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
}

export const SECTION_COLORS: Record<Section, string> = {
  Math: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200',
  'Reading & Writing': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
}
