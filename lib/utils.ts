import { EXERCISE_LIBRARY, INJURY_KEYWORDS, LOWER_MUSCLES, USER_PROFILE, type MuscleKey } from './constants'

export interface WorkoutSet {
  reps?: string
  weight?: string
  rir?: string
  type?: 'normal' | 'drop' | 'restpause'
  drops?: { weight: string; reps: string }[]
  pauseReps?: string
}

export interface Exercise {
  name: string
  muscles?: MuscleKey[]
  repRange?: string
  note?: string
  priority?: boolean
  elbowSafe?: boolean
  elbowModified?: boolean
  custom?: boolean
  swappedFrom?: string
  linkedTo?: 'superset' | 'compound' | null
  sets: WorkoutSet[]
}

export interface Workout {
  id: string
  date: string
  splitDay: string
  exercises: Exercise[]
  feel?: number
  notes?: string
}

export interface BodyEntry {
  date: string
  weight?: string
  bf?: string
  macros?: {
    calories?: string
    protein?: string
    carbs?: string
    fat?: string
  }
}

export interface RecoveryContext {
  active: boolean
  reason: string
  injuryDetail?: string
  startDate: string
}

export interface PhaseGoal {
  mode?: string
  targetRate?: string
  targetWeight?: string
  deadline?: string
  muscles?: string[]
  lift?: string
  targetReps?: string
  note?: string
}

export function today(): string {
  return new Date().toISOString().split('T')[0]
}

export function fmtDate(d: string): string {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })
}

export function totalSets(workout: Workout): number {
  return workout.exercises.reduce((s, ex) => s + (ex.sets?.length || 0), 0)
}

export function muscleVolume(workouts: Workout[], days = 7): Record<string, number> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const vol: Record<string, number> = {}
  workouts
    .filter(w => new Date(w.date) >= cutoff)
    .forEach(w => {
      w.exercises.forEach(ex => {
        const workedSets = (ex.sets || []).filter(s => s.reps && parseFloat(s.reps) > 0).length
        if (workedSets === 0) return
        let muscles: MuscleKey[] | null = ex.muscles && ex.muscles.length > 0 ? ex.muscles : null
        if (!muscles) {
          const lib = EXERCISE_LIBRARY.find(l => l.name === ex.name)
          muscles = lib ? lib.muscles : null
        }
        if (!muscles || muscles.length === 0) return
        const primary = muscles[0]
        vol[primary] = (vol[primary] || 0) + workedSets
      })
    })
  return vol
}

export function newSet(): WorkoutSet {
  return { reps: '', weight: '', rir: '1', type: 'normal', drops: [], pauseReps: '' }
}

export function newExercise(
  ex: Omit<Partial<Exercise>, 'sets'> & { name: string },
): Exercise {
  return { ...ex, sets: [newSet(), newSet(), newSet()] } as Exercise
}

export function parseRepRange(rangeStr?: string): { min: number; max: number } {
  if (!rangeStr) return { min: 8, max: 12 }
  const parts = rangeStr.split('-').map(Number)
  if (parts.length === 2) return { min: parts[0], max: parts[1] }
  return { min: parts[0], max: parts[0] }
}

export function suggestIncrement(weight: string | number, isLower = false): number | null {
  const raw = typeof weight === 'number' ? weight : parseFloat(weight)
  if (!raw || isNaN(raw)) return null
  const pct = raw * 0.025
  const rounded = Math.round(pct / 2.5) * 2.5
  if (isLower) return Math.max(10, Math.min(20, rounded))
  return Math.max(2.5, Math.min(10, rounded))
}

export function isLowerExercise(ex: { muscles?: MuscleKey[] }): boolean {
  return (ex.muscles || []).some(m => LOWER_MUSCLES.includes(m))
}

export function getInjuryKeywords(injuryText?: string): string[] {
  if (!injuryText) return []
  const lower = injuryText.toLowerCase()
  const matches: string[] = []
  Object.entries(INJURY_KEYWORDS).forEach(([bodyPart, keywords]) => {
    if (lower.includes(bodyPart)) matches.push(...keywords)
  })
  const words = lower.split(/[\s,/]+/).filter(w => w.length > 3)
  matches.push(...words)
  return [...new Set(matches)]
}

export function getExerciseRecoveryFlag(
  exName: string,
  recoveryContext: RecoveryContext | null | undefined,
): { type: 'caution' | 'avoid'; label: string; detail: string } | null {
  if (!recoveryContext || !recoveryContext.active) return null
  if (['cns', 'deload', 'illness', 'stress'].includes(recoveryContext.reason)) return null
  if (recoveryContext.reason === 'injury' && recoveryContext.injuryDetail) {
    const keywords = getInjuryKeywords(recoveryContext.injuryDetail)
    const nameLower = exName.toLowerCase()
    if (keywords.some(kw => nameLower.includes(kw))) {
      return { type: 'caution', label: '⚠ Monitor', detail: recoveryContext.injuryDetail }
    }
  }
  return null
}

export function sessionVolume(sets: WorkoutSet[]): number {
  return sets
    .filter(s => s.weight && s.reps)
    .reduce((sum, s) => sum + parseFloat(s.weight!) * parseFloat(s.reps!), 0)
}

interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

const ANTHROPIC_KEY = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY ?? ''

export async function callClaude(messages: ClaudeMessage[], onChunk: (text: string) => void): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      system: USER_PROFILE,
      messages,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API error ${res.status}: ${err}`)
  }
  const data = await res.json()
  const full = (data.content || []).map((b: { text?: string }) => b.text || '').join('')
  onChunk(full)
  return full
}

export async function callClaudeJSON<T = unknown>(prompt: string, systemPrompt: string): Promise<T> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  const data = await res.json()
  const text = (data.content || []).map((b: { text?: string }) => b.text || '').join('')
  const clean = text.replace(/^```json\s*/m, '').replace(/^```\s*/m, '').replace(/```\s*$/m, '').trim()
  return JSON.parse(clean) as T
}
