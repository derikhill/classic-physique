'use client'

import { useEffect, useState } from 'react'
import { PHASES, type ExerciseTemplate, type PhaseId } from '@/lib/constants'
import {
  deleteWorkout as dbDeleteWorkout,
  getBodyEntries,
  getSettings,
  getWorkouts,
  saveWorkout,
  signOut,
  updateSettings,
  updateWorkout as dbUpdateWorkout,
  upsertBodyEntry,
} from '@/lib/db'
import type { BodyEntry, PhaseGoal, RecoveryContext, Workout } from '@/lib/utils'

import Dashboard from './tabs/Dashboard'
import LogWorkout from './tabs/LogWorkout'
import History from './tabs/History'
import BodyTracker, { type MacroTargets } from './tabs/BodyTracker'
import AICoach from './tabs/AICoach'
import SettingsTab from './tabs/Settings'
import type { CoachSplit } from './shared/CustomSplitBuilder'

type WorkoutRow = {
  id: string
  date: string
  split_day: string
  exercises: Workout['exercises']
  feel: number | null
  notes: string | null
}

type BodyRow = {
  date: string
  weight: string | null
  bf: string | null
  kcal: string | null
  protein: string | null
  carbs: string | null
  fat: string | null
}

type SettingsRow = {
  phase?: PhaseId | null
  split_order?: string[] | null
  active_coach_split?: CoachSplit | null
  phase_goals?: Record<string, PhaseGoal> | null
  recovery_context?: RecoveryContext | null
  macro_targets?: MacroTargets | null
  custom_exercises?: ExerciseTemplate[] | null
  archived_programs?: ArchivedProgram[] | null
  current_program_name?: string | null
  last_checkin?: string | null
}

interface ArchivedProgram {
  name: string
  startDate: string
  endDate: string
  sessionCount: number
  archivedAt: number
}

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'log',       label: 'Log' },
  { id: 'history',   label: 'History' },
  { id: 'body',      label: 'Body' },
  { id: 'coach',     label: 'Coach' },
  { id: 'settings',  label: 'Settings' },
]

function rowToWorkout(r: WorkoutRow): Workout {
  return {
    id: r.id,
    date: r.date,
    splitDay: r.split_day,
    exercises: r.exercises || [],
    feel: r.feel ?? undefined,
    notes: r.notes ?? undefined,
  }
}

function rowToBodyEntry(r: BodyRow): BodyEntry {
  const macros = (r.kcal || r.protein || r.carbs || r.fat)
    ? {
        calories: r.kcal ?? undefined,
        protein: r.protein ?? undefined,
        carbs: r.carbs ?? undefined,
        fat: r.fat ?? undefined,
      }
    : undefined
  return {
    date: r.date,
    weight: r.weight ?? undefined,
    bf: r.bf ?? undefined,
    macros,
  }
}

export default function AppShell() {
  const [tab, setTab] = useState('dashboard')
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [phase, setPhase] = useState<PhaseId>('recovery')
  const [archivedPrograms, setArchivedPrograms] = useState<ArchivedProgram[]>([])
  const [bodyEntries, setBodyEntries] = useState<BodyEntry[]>([])
  const [activeCoachSplit, setActiveCoachSplit] = useState<CoachSplit | null>(null)
  const [recoveryContext, setRecoveryContext] = useState<RecoveryContext | null>(null)
  const [phaseGoals, setPhaseGoals] = useState<Record<string, PhaseGoal>>({})
  const [customExercises, setCustomExercises] = useState<ExerciseTemplate[]>([])
  const [splitOrder, setSplitOrder] = useState<string[] | null>(null)
  const [macroTargets, setMacroTargets] = useState<MacroTargets>({})
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null)
  const [currentProgramName, setCurrentProgramName] = useState<string>('P/P/L · Upper/Lower')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const [wRows, bRows, settings] = await Promise.all([
          getWorkouts() as Promise<WorkoutRow[]>,
          getBodyEntries() as Promise<BodyRow[]>,
          getSettings().catch(() => null) as Promise<SettingsRow | null>,
        ])
        if (!alive) return
        setWorkouts((wRows || []).map(rowToWorkout))
        // bodyEntries sorted ascending by date for charting
        setBodyEntries((bRows || []).map(rowToBodyEntry).sort((a, b) => a.date.localeCompare(b.date)))
        if (settings) {
          if (settings.phase) setPhase(settings.phase)
          if (settings.split_order) setSplitOrder(settings.split_order)
          if (settings.active_coach_split) setActiveCoachSplit(settings.active_coach_split)
          if (settings.phase_goals) setPhaseGoals(settings.phase_goals)
          if (settings.recovery_context) setRecoveryContext(settings.recovery_context)
          if (settings.macro_targets) setMacroTargets(settings.macro_targets)
          if (settings.custom_exercises) setCustomExercises(settings.custom_exercises)
          if (settings.archived_programs) setArchivedPrograms(settings.archived_programs)
          if (settings.current_program_name) setCurrentProgramName(settings.current_program_name)
          if (settings.last_checkin) setLastCheckIn(settings.last_checkin)
        }
      } finally {
        if (alive) setLoaded(true)
      }
    })()
    return () => { alive = false }
  }, [])

  const handlePhaseChange = async (p: PhaseId) => {
    setPhase(p)
    await updateSettings({ phase: p })
  }

  const handleSaveWorkout = async (workout: Omit<Workout, 'id'>): Promise<boolean> => {
    try {
      const inserted = (await saveWorkout(workout)) as WorkoutRow
      setWorkouts(prev => [...prev, rowToWorkout(inserted)])
      return true
    } catch (e) {
      console.error('saveWorkout failed', e)
      return false
    }
  }

  const handleDelete = async (id: string) => {
    await dbDeleteWorkout(id)
    setWorkouts(prev => prev.filter(w => w.id !== id))
  }

  const handleUpdate = async (updatedWorkout: Workout) => {
    await dbUpdateWorkout(updatedWorkout.id, updatedWorkout)
    setWorkouts(prev => prev.map(w => (w.id === updatedWorkout.id ? updatedWorkout : w)))
  }

  const handleBodyEntry = async (entries: BodyEntry[]) => {
    for (const entry of entries) {
      await upsertBodyEntry({
        date: entry.date,
        weight: entry.weight,
        bf: entry.bf,
        kcal: entry.macros?.calories,
        protein: entry.macros?.protein,
        carbs: entry.macros?.carbs,
        fat: entry.macros?.fat,
      })
    }
    setBodyEntries(prev => {
      const map = new Map(prev.map(e => [e.date, e]))
      entries.forEach(entry => {
        const existing = map.get(entry.date)
        map.set(entry.date, { ...(existing || {}), ...entry, macros: { ...(existing?.macros || {}), ...(entry.macros || {}) } })
      })
      return [...map.values()].sort((a, b) => a.date.localeCompare(b.date))
    })
  }

  const handleSplitOrder = async (order: string[] | null) => {
    setSplitOrder(order)
    await updateSettings({ split_order: order })
  }

  const handleSaveCustomExercise = async (ex: ExerciseTemplate) => {
    if (customExercises.some(e => e.name.toLowerCase() === ex.name.toLowerCase())) return
    const updated = [...customExercises, { ...ex, custom: true }]
    setCustomExercises(updated)
    await updateSettings({ custom_exercises: updated })
  }

  const handleDeleteCustomExercise = async (name: string) => {
    const updated = customExercises.filter(e => e.name !== name)
    setCustomExercises(updated)
    await updateSettings({ custom_exercises: updated })
  }

  const handlePhaseGoals = async (goals: Record<string, PhaseGoal>) => {
    setPhaseGoals(goals)
    await updateSettings({ phase_goals: goals })
  }

  const handleRecoveryContext = async (ctx: RecoveryContext | null) => {
    setRecoveryContext(ctx)
    await updateSettings({ recovery_context: ctx })
  }

  const handleSaveMacroTargets = async (targets: MacroTargets) => {
    setMacroTargets(targets)
    await updateSettings({ macro_targets: targets })
  }

  const handleLastCheckIn = async (iso: string) => {
    setLastCheckIn(iso)
    await updateSettings({ last_checkin: iso })
  }

  const handleSwitchProgram = async (newName: string, coachSplit: CoachSplit | null = null) => {
    const sorted = [...workouts].sort((a, b) => a.date.localeCompare(b.date))
    const archive: ArchivedProgram = {
      name: currentProgramName,
      startDate: sorted[0]?.date || new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      sessionCount: workouts.length,
      archivedAt: Date.now(),
    }
    const updatedArchive = [...archivedPrograms, archive]
    setArchivedPrograms(updatedArchive)
    setCurrentProgramName(newName)
    await updateSettings({ archived_programs: updatedArchive, current_program_name: newName })

    if (coachSplit) {
      setActiveCoachSplit(coachSplit)
      await updateSettings({ active_coach_split: coachSplit })
    }
  }

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/login'
  }

  if (!loaded) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a0a' }}>
      <div className="loading-dots"><span /><span /><span /></div>
    </div>
  )

  const currentPhase = PHASES.find(p => p.id === phase)

  return (
    <div className="app">
      <nav className="nav">
        <div className="nav-brand">CLASSIC PHYSIQUE</div>
        <div className="nav-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`nav-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="phase-badge" style={{ borderColor: currentPhase?.color, color: currentPhase?.color }}>{currentPhase?.label}</div>
          <button className="btn-swap" onClick={handleSignOut} title="Sign out">⎋</button>
        </div>
      </nav>
      {tab === 'dashboard' && <Dashboard workouts={workouts} phase={phase} onNavigate={setTab} />}
      {tab === 'log' && (
        <LogWorkout
          workouts={workouts}
          onSave={handleSaveWorkout}
          phase={phase}
          activeCoachSplit={activeCoachSplit}
          recoveryContext={recoveryContext}
          customExercises={customExercises}
          onSaveCustomExercise={handleSaveCustomExercise}
          splitOrder={splitOrder}
        />
      )}
      {tab === 'history' && <History workouts={workouts} onDelete={handleDelete} onUpdate={handleUpdate} />}
      {tab === 'body' && (
        <BodyTracker
          bodyEntries={bodyEntries}
          onSave={handleBodyEntry}
          phase={phase}
          workouts={workouts}
          phaseGoals={phaseGoals}
          macroTargets={macroTargets}
          onSaveMacroTargets={handleSaveMacroTargets}
        />
      )}
      {tab === 'coach' && (
        <AICoach
          workouts={workouts}
          phase={phase}
          bodyEntries={bodyEntries}
          recoveryContext={recoveryContext}
          phaseGoals={phaseGoals}
          macroTargets={macroTargets}
          lastCheckIn={lastCheckIn}
          onLastCheckIn={handleLastCheckIn}
        />
      )}
      {tab === 'settings' && (
        <SettingsTab
          phase={phase}
          onPhaseChange={handlePhaseChange}
          workouts={workouts}
          onSwitchProgram={handleSwitchProgram}
          archivedPrograms={archivedPrograms}
          recoveryContext={recoveryContext}
          onRecoveryContext={handleRecoveryContext}
          phaseGoals={phaseGoals}
          onPhaseGoals={handlePhaseGoals}
          customExercises={customExercises}
          onDeleteCustomExercise={handleDeleteCustomExercise}
          splitOrder={splitOrder}
          onSplitOrder={handleSplitOrder}
          activeCoachSplit={activeCoachSplit}
        />
      )}
    </div>
  )
}
