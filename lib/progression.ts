import { type MuscleKey, type PhaseId } from './constants'
import {
  isLowerExercise,
  parseRepRange,
  sessionVolume,
  suggestIncrement,
  type Exercise,
  type Workout,
  type WorkoutSet,
} from './utils'

export interface SetTarget {
  setNum: number
  suggestedWeight: number
  suggestedReps: number
  note: string
  type: 'weight' | 'reps' | 'hold' | 'backoff'
}

export interface ExerciseSummary {
  type: 'weight' | 'reps' | 'hold' | 'backoff'
  message: string
}

export function getSetTargets(
  lastSets: WorkoutSet[],
  repRange: string | undefined,
  _phase: PhaseId,
  muscles: MuscleKey[] | undefined,
): SetTarget[] {
  const working = lastSets.filter(s => s.reps && parseFloat(s.reps) > 0 && (!s.type || s.type === 'normal'))
  if (!working.length) return []
  const { min: repMin, max: repMax } = parseRepRange(repRange)
  const isLower = isLowerExercise({ muscles: muscles || [] })

  const set1Rir = parseFloat(working[0]?.rir !== undefined ? working[0].rir! : '2')
  const tooHeavy = set1Rir === 0

  const lastSet = working[working.length - 1]
  const lastSetRir = parseFloat(lastSet?.rir !== undefined ? lastSet.rir! : '2')
  const lastSetReps = parseFloat(lastSet?.reps || '0')
  const readyForWeight = lastSetReps >= repMax && lastSetRir <= 1 && !tooHeavy

  return working.map((s, i) => {
    const reps = parseFloat(s.reps || '0')
    const rir = parseFloat(s.rir !== undefined ? s.rir : '2')
    const weight = parseFloat(s.weight || '0')
    const isLast = i === working.length - 1
    const increment = suggestIncrement(weight, isLower)

    if (tooHeavy) {
      const backoff = Math.max(weight - 5, 0)
      return {
        setNum: i + 1, suggestedWeight: backoff, suggestedReps: reps,
        note: i === 0 ? `Drop to ${backoff}lbs — set 1 was ${set1Rir} RIR, too heavy` : `${backoff}lbs × ${reps}`,
        type: 'backoff' as const,
      }
    }

    if (readyForWeight) {
      const newWeight = increment ? weight + increment : weight
      return {
        setNum: i + 1, suggestedWeight: newWeight, suggestedReps: repMin,
        note: isLast ? `Add weight — last set hit ${repMax} @ ${lastSetRir} RIR` : `${newWeight}lbs × ${repMin}`,
        type: 'weight' as const,
      }
    }

    if (reps < repMax) {
      const target = Math.min(repMax, reps + 1)
      return {
        setNum: i + 1, suggestedWeight: weight, suggestedReps: target,
        note: i === 0 ? `Push for ${target} (hit ${reps} @ ${rir} RIR last time)` : `Aim ${target} reps`,
        type: 'reps' as const,
      }
    }

    if (reps >= repMax && rir >= 2 && isLast) {
      return {
        setNum: i + 1, suggestedWeight: weight, suggestedReps: reps,
        note: `${reps} reps but ${rir} RIR — push closer to failure`,
        type: 'hold' as const,
      }
    }

    return {
      setNum: i + 1, suggestedWeight: weight, suggestedReps: reps,
      note: `Hold ${reps}`,
      type: 'hold' as const,
    }
  })
}

export function getExerciseSummary(
  lastSets: WorkoutSet[],
  repRange: string | undefined,
  phase: PhaseId,
  muscles: MuscleKey[] | undefined,
): ExerciseSummary | null {
  const working = lastSets.filter(s => s.reps && parseFloat(s.reps) > 0 && (!s.type || s.type === 'normal'))
  if (!working.length) return null
  const { min: repMin, max: repMax } = parseRepRange(repRange)
  const isLower = isLowerExercise({ muscles: muscles || [] })

  const set1Rir = parseFloat(working[0]?.rir !== undefined ? working[0].rir! : '2')
  const lastSet = working[working.length - 1]
  const lastRir = parseFloat(lastSet?.rir !== undefined ? lastSet.rir! : '2')
  const lastReps = parseFloat(lastSet?.reps || '0')
  const baseWeight = parseFloat(working[0]?.weight || '0')
  const tooHeavy = set1Rir === 0
  const readyForWeight = lastReps >= repMax && lastRir <= 1 && !tooHeavy
  const increment = suggestIncrement(baseWeight, isLower)

  if (phase === 'recovery') {
    return { type: 'hold', message: `Hold at ${baseWeight}lbs — recovery phase.` }
  }
  if (tooHeavy) {
    return { type: 'backoff', message: `⚠ Set 1 was ${set1Rir} RIR — too heavy. Drop ~5lbs so fatigue builds naturally across sets.` }
  }
  if (readyForWeight) {
    const newW = increment ? baseWeight + increment : baseWeight
    return { type: 'weight', message: `Last set hit ${repMax} reps @ ${lastRir} RIR — time to add weight. Try ${newW}lbs × ${repMin} next session.` }
  }
  if (lastReps >= repMax && lastRir >= 2) {
    return { type: 'hold', message: `Last set: ${lastReps} reps @ ${lastRir} RIR — load may be too light. Push harder before adding weight.` }
  }
  const pushCount = working.filter(s => parseFloat(s.reps!) < repMax).length
  if (pushCount > 0) {
    return { type: 'reps', message: `Accumulating — push ${pushCount} set${pushCount > 1 ? 's' : ''} for +1 rep at ${baseWeight}lbs. Last set: ${lastReps} @ ${lastRir} RIR.` }
  }
  return { type: 'hold', message: `Hold at ${baseWeight}lbs — monitoring last-set RIR before weight jump.` }
}

export function getLastSession(workouts: Workout[], splitDay: string): Workout | null {
  return [...workouts]
    .filter(w => w.splitDay === splitDay)
    .sort((a, b) => b.date.localeCompare(a.date))[0] || null
}

export interface ProgressionEntry {
  summary: ExerciseSummary | null
  setTargets: SetTarget[]
  lastSets: WorkoutSet[]
}

export function buildProgressionMap(lastSession: Workout | null, phase: PhaseId): Record<string, ProgressionEntry> {
  if (!lastSession) return {}
  const map: Record<string, ProgressionEntry> = {}
  lastSession.exercises.forEach(ex => {
    const working = (ex.sets || []).filter(s => s.reps && parseFloat(s.reps) > 0)
    if (!working.length) return
    const summary = getExerciseSummary(working, ex.repRange, phase, ex.muscles)
    const setTargets = getSetTargets(working, ex.repRange, phase, ex.muscles)
    if (summary || setTargets.length) {
      map[ex.name] = { summary, setTargets, lastSets: ex.sets }
    }
  })
  return map
}

export function calcDeloadLevel(energy: number, motivation: number, physical: number): 0 | 1 | 2 | 3 {
  const avg = (energy + motivation + physical) / 3
  if (avg >= 3.5) return 0
  if (avg >= 2.8) return 1
  if (avg >= 2.0) return 2
  return 3
}

export function isSkippable(ex: Exercise): boolean {
  const secondary = ['calves', 'front_delts', 'glutes']
  return !ex.priority && (ex.muscles || []).some(m => secondary.includes(m))
}

export interface AutoRegEntry {
  skip: boolean
  adjWeight: number | null
  adjReps: number
  deloadLevel: number
  note: string
}

export function buildAutoRegMap(
  exercises: Exercise[],
  lastSession: Workout | null,
  deloadLevel: number,
): Record<string, AutoRegEntry> {
  if (deloadLevel === 0) return {}
  const loadPcts = [1, 0.9, 0.8, 0.7]
  const loadPct = loadPcts[deloadLevel]

  const map: Record<string, AutoRegEntry> = {}
  exercises.forEach(ex => {
    const lastEx = lastSession?.exercises?.find(e => e.name === ex.name)
    const lastSets = lastEx?.sets?.filter(s => s.reps && s.weight) || []
    const lastWeight = lastSets.length ? parseFloat(lastSets[lastSets.length - 1].weight!) : null
    const { min: repMin, max: repMax } = parseRepRange(ex.repRange)
    const midReps = Math.round((repMin + repMax) / 2)
    const skip = deloadLevel >= 2 && isSkippable(ex)

    const adjWeight = lastWeight ? Math.round((lastWeight * loadPct) / 2.5) * 2.5 : null

    map[ex.name] = {
      skip,
      adjWeight,
      adjReps: midReps,
      deloadLevel,
      note: skip
        ? '⚑ Consider skipping — secondary muscle, save energy for priorities'
        : adjWeight
          ? `Auto-reg: ${adjWeight}lbs × ${midReps} reps (${Math.round((1 - loadPct) * 100)}% reduction)`
          : `Auto-reg: aim for ${midReps} reps — middle of range today`,
    }
  })
  return map
}

export interface ProgramSwitchAnalysis {
  verdict: 'green' | 'yellow' | 'red' | 'insufficient'
  summary?: string
  reasoning?: string
  top3?: { name: string; weightDelta: number; repDelta: number; lastWeight: number; lastReps: number; sessions: number }[]
  improving?: { name: string; weightDelta: number; repDelta: number; sessions: number }[]
  stagnant?: { name: string; weightDelta: number; repDelta: number; sessions: number }[]
  total?: number
  sessionsPerWeek?: number
  avgFeel?: number
  roughSessions?: number
  sessions: number
}

export function analyzeProgramSwitch(workouts: Workout[], phase: PhaseId): ProgramSwitchAnalysis {
  const now = new Date()
  const cutoff = new Date(now.getTime() - 6 * 7 * 24 * 60 * 60 * 1000)
  const recent = workouts.filter(w => new Date(w.date) >= cutoff)

  if (recent.length < 4) {
    return { verdict: 'insufficient', sessions: recent.length }
  }

  const weeks = 6
  const sessionsPerWeek = recent.length / weeks

  const exerciseHistory: Record<string, { date: string; avgWeight: number; avgReps: number }[]> = {}
  recent.forEach(w => {
    w.exercises.forEach(ex => {
      const workingSets = (ex.sets || []).filter(s => s.weight && s.reps)
      if (!workingSets.length) return
      const avgWeight = workingSets.reduce((s, x) => s + parseFloat(x.weight!), 0) / workingSets.length
      const avgReps = workingSets.reduce((s, x) => s + parseFloat(x.reps!), 0) / workingSets.length
      if (!exerciseHistory[ex.name]) exerciseHistory[ex.name] = []
      exerciseHistory[ex.name].push({ date: w.date, avgWeight, avgReps })
    })
  })

  const trends: { name: string; weightDelta: number; repDelta: number; improving: boolean; stagnant: boolean; sessions: number; lastWeight: number; lastReps: number }[] = []
  Object.entries(exerciseHistory).forEach(([name, sessions]) => {
    if (sessions.length < 3) return
    sessions.sort((a, b) => a.date.localeCompare(b.date))
    const first = sessions[0].avgWeight
    const last = sessions[sessions.length - 1].avgWeight
    const firstReps = sessions[0].avgReps
    const lastReps = sessions[sessions.length - 1].avgReps
    const weightDelta = last - first
    const repDelta = lastReps - firstReps
    const improving = weightDelta > 0 || repDelta >= 1
    const stagnant = Math.abs(weightDelta) < 2.5 && Math.abs(repDelta) < 1 && sessions.length >= 4
    trends.push({ name, weightDelta, repDelta, improving, stagnant, sessions: sessions.length, lastWeight: last, lastReps })
  })

  const improving = trends.filter(t => t.improving && !t.stagnant)
  const stagnant = trends.filter(t => t.stagnant)
  const total = trends.length

  const feels = recent.map(w => w.feel).filter(Boolean) as number[]
  const avgFeel = feels.length ? feels.reduce((s, f) => s + f, 0) / feels.length : 3
  const roughSessions = feels.filter(f => f <= 2).length

  const top3 = [...improving]
    .sort((a, b) => b.weightDelta - a.weightDelta)
    .slice(0, 3)

  const cutAdjusted = phase === 'cut'

  let verdict: ProgramSwitchAnalysis['verdict']
  let summary: string
  let reasoning: string

  if (total === 0) {
    verdict = 'insufficient'
    summary = 'Not enough logged weight data to assess progress.'
    reasoning = 'Log weights consistently for a few more sessions before making a program decision.'
  } else if (cutAdjusted && avgFeel >= 2.5) {
    verdict = 'green'
    summary = `You're on a cut — strength holding at ${Math.round(sessionsPerWeek * 10) / 10} sessions/week avg. Cut-phase stagnation is expected, not a program problem.`
    reasoning = 'Switching during a cut rarely produces better results and adds unnecessary adjustment fatigue.'
  } else if (improving.length >= total * 0.6 && avgFeel >= 2.5) {
    verdict = 'green'
    summary = `${improving.length} of ${total} tracked lifts are progressing over 6 weeks. Avg session feel: ${Math.round(avgFeel * 10) / 10}/5.`
    reasoning = 'The program is working. Switching now would interrupt real momentum.'
  } else if (stagnant.length >= total * 0.6 && roughSessions >= 3) {
    verdict = 'red'
    summary = `${stagnant.length} of ${total} lifts have stalled over 6 weeks. ${roughSessions} sessions rated feel 1-2. Avg feel: ${Math.round(avgFeel * 10) / 10}/5.`
    reasoning = 'This looks like genuine stagnation backed by poor session quality. A change may be warranted.'
  } else {
    verdict = 'yellow'
    summary = `Mixed picture — ${improving.length} lifts progressing, ${stagnant.length} stalled. ${sessionsPerWeek < 2 ? 'Consistency is low — only ' + Math.round(sessionsPerWeek * 10) / 10 + ' sessions/week avg.' : ''}`
    reasoning = 'A deload week might break the plateau without discarding what is working.'
  }

  return { verdict, summary, reasoning, top3, improving, stagnant, total, sessionsPerWeek, avgFeel, roughSessions, sessions: recent.length }
}

export interface TrendingLiftSession {
  date: string
  avgWeight: number
  avgReps: number
  volume: number
  setCount: number
}

export interface TrendingLift {
  name: string
  streak: number
  sparkData: number[]
  latestVol: number
  volChange: number
  weightGain: number
  sessions: number
  history: TrendingLiftSession[]
}

export function buildTrendingLifts(workouts: Workout[]): TrendingLift[] {
  const exerciseTimeline: Record<string, { date: string; volume: number; avgWeight: number; avgReps: number; setCount: number }[]> = {}

  workouts.forEach(w => {
    w.exercises.forEach(ex => {
      const workingSets = (ex.sets || []).filter(s => s.weight && s.reps)
      if (!workingSets.length) return
      const vol = sessionVolume(workingSets)
      const avgW = workingSets.reduce((s, x) => s + parseFloat(x.weight!), 0) / workingSets.length
      const avgR = workingSets.reduce((s, x) => s + parseFloat(x.reps!), 0) / workingSets.length
      if (!exerciseTimeline[ex.name]) exerciseTimeline[ex.name] = []
      exerciseTimeline[ex.name].push({ date: w.date, volume: vol, avgWeight: avgW, avgReps: avgR, setCount: workingSets.length })
    })
  })

  const results: TrendingLift[] = []

  Object.entries(exerciseTimeline).forEach(([name, sessions]) => {
    if (sessions.length < 3) return
    sessions.sort((a, b) => a.date.localeCompare(b.date))

    let streak = 1
    let graceUsed = false

    for (let i = sessions.length - 1; i > 0; i--) {
      const curr = sessions[i]
      const prev = sessions[i - 1]
      const dayGap = (new Date(curr.date).getTime() - new Date(prev.date).getTime()) / (1000 * 60 * 60 * 24)
      if (dayGap > 21) break

      const volUp = curr.volume > prev.volume
      const weightUp = curr.avgWeight > prev.avgWeight
      const repsBig = curr.avgReps >= prev.avgReps + 2
      const improvingNow = volUp || weightUp || repsBig
      const flat = !improvingNow && Math.abs(curr.volume - prev.volume) / (prev.volume || 1) < 0.03

      if (improvingNow) {
        streak++
      } else if (flat && !graceUsed) {
        graceUsed = true
        streak++
      } else {
        break
      }
    }

    if (streak < 3) return

    const sparkData = sessions.slice(-6).map(s => s.volume)
    const latestVol = sessions[sessions.length - 1].volume
    const prevVol = sessions[sessions.length - 2]?.volume || latestVol
    const volChange = latestVol - prevVol
    const latestW = sessions[sessions.length - 1].avgWeight
    const firstW = sessions[sessions.length - streak]?.avgWeight || latestW
    const weightGain = latestW - firstW

    const history = sessions.slice(-8).map(s => ({
      date: s.date,
      avgWeight: s.avgWeight,
      avgReps: s.avgReps,
      volume: s.volume,
      setCount: s.setCount,
    }))

    results.push({ name, streak, sparkData, latestVol, volChange, weightGain, sessions: sessions.length, history })
  })

  results.sort((a, b) => b.streak - a.streak || b.volChange - a.volChange)
  return results.slice(0, 5)
}
