'use client'

import { useState } from 'react'
import {
  PHASES,
  RECOVERY_REASONS,
  SPLIT,
  SPLIT_ORDER,
  type ExerciseTemplate,
  type PhaseId,
} from '@/lib/constants'
import { callClaudeJSON, fmtDate, muscleVolume, type RecoveryContext, type Workout } from '@/lib/utils'
import { analyzeProgramSwitch, type ProgramSwitchAnalysis } from '@/lib/progression'
import CustomSplitBuilder, { type CoachSplit } from '@/components/shared/CustomSplitBuilder'
import CustomLibraryRow from '@/components/shared/CustomLibraryRow'
import ProgramEditor from '@/components/shared/ProgramEditor'
import SplitDayRow from '@/components/shared/SplitDayRow'

interface PhaseGoal {
  mode?: string
  targetRate?: string
  targetWeight?: string
  deadline?: string
  muscles?: string[]
  lift?: string
  targetReps?: string
  note?: string
}

interface ArchivedProgram {
  name: string
  startDate: string
  endDate: string
  sessionCount: number
  archivedAt: number
}

const VERDICT_COLORS = {
  green:        { bg: '#0a1400', border: 'var(--accent)',  text: 'var(--accent)',  label: 'PROGRAM WORKING' },
  yellow:       { bg: '#1a1400', border: 'var(--accent2)', text: 'var(--accent2)', label: 'MIXED SIGNALS'    },
  red:          { bg: '#1a0000', border: 'var(--red)',     text: 'var(--red)',     label: 'STAGNATION'       },
  insufficient: { bg: '#111',    border: 'var(--border)',  text: 'var(--text2)',   label: 'NEED MORE DATA'   },
} as const

const GOAL_MUSCLES = ['chest', 'back', 'quads', 'hamstrings', 'glutes', 'side_delts', 'front_delts', 'rear_delts', 'biceps', 'triceps', 'calves']

interface BuilderDay {
  name: string
  exercises: { name: string; repRange: string; muscles: string[] }[]
}

export default function Settings({
  phase,
  onPhaseChange,
  workouts,
  onSwitchProgram,
  archivedPrograms,
  recoveryContext,
  onRecoveryContext,
  phaseGoals,
  onPhaseGoals,
  customExercises,
  onSaveCustomExercise,
  onDeleteCustomExercise,
  onUpdateCustomExercise,
  splitOrder,
  onSplitOrder,
  activeCoachSplit,
  onUpdateCoachSplit,
  currentProgramName,
}: {
  phase: PhaseId
  onPhaseChange: (p: PhaseId) => void
  workouts: Workout[]
  onSwitchProgram: (newName: string, coachSplit?: CoachSplit | null) => void
  archivedPrograms: ArchivedProgram[]
  recoveryContext: RecoveryContext | null
  onRecoveryContext: (ctx: RecoveryContext | null) => void
  phaseGoals: Record<string, PhaseGoal>
  onPhaseGoals: (goals: Record<string, PhaseGoal>) => void
  customExercises: ExerciseTemplate[]
  onSaveCustomExercise: (ex: ExerciseTemplate) => void
  onDeleteCustomExercise: (name: string) => void
  onUpdateCustomExercise: (name: string, patch: Partial<ExerciseTemplate>) => void
  splitOrder: string[] | null
  onSplitOrder: (order: string[] | null) => void
  activeCoachSplit: CoachSplit | null
  onUpdateCoachSplit: (split: CoachSplit) => void
  currentProgramName: string
}) {
  const [switchStep, setSwitchStep] = useState<null | 'result' | 'deload_offer' | 'coach_generating' | 'coach_review' | 'name_new' | 'build'>(null)
  const [builderDays, setBuilderDays] = useState<BuilderDay[]>([])
  const [builderName, setBuilderName] = useState('')
  const [analysis, setAnalysis] = useState<ProgramSwitchAnalysis | null>(null)
  const [newProgramName, setNewProgramName] = useState('')
  const [coachSplit, setCoachSplit] = useState<CoachSplit | null>(null)
  const [, setCoachError] = useState<string | null>(null)

  const [editingGoals, setEditingGoals] = useState(false)
  const [goalDraft, setGoalDraft] = useState<PhaseGoal>({})

  const openGoals = () => {
    setGoalDraft(phaseGoals[phase] || {})
    setEditingGoals(true)
  }
  const saveGoals = () => {
    onPhaseGoals({ ...phaseGoals, [phase]: goalDraft })
    setEditingGoals(false)
  }
  const clearGoals = () => {
    const updated = { ...phaseGoals }
    delete updated[phase]
    onPhaseGoals(updated)
    setEditingGoals(false)
  }
  const currentGoal = phaseGoals[phase]

  const [showLibrary, setShowLibrary] = useState(false)

  const [showRecoveryModal, setShowRecoveryModal] = useState(false)
  const [rcReason, setRcReason] = useState('')
  const [rcDetail, setRcDetail] = useState('')

  const handlePhaseClick = (pid: PhaseId) => {
    if (pid === 'recovery' && phase !== 'recovery') {
      setRcReason(''); setRcDetail('')
      setShowRecoveryModal(true)
    } else {
      if (pid !== 'recovery') onRecoveryContext(null)
      onPhaseChange(pid)
    }
  }

  const confirmRecovery = () => {
    onRecoveryContext({
      active: true,
      reason: rcReason,
      injuryDetail: rcReason === 'injury' ? rcDetail : '',
      startDate: new Date().toISOString().split('T')[0],
    })
    onPhaseChange('recovery')
    setShowRecoveryModal(false)
  }

  const startSwitch = () => {
    const result = analyzeProgramSwitch(workouts, phase)
    setAnalysis(result)
    setSwitchStep('result')
  }

  const requestCoachSplit = async () => {
    setSwitchStep('coach_generating')
    setCoachError(null)

    const vol7 = muscleVolume(workouts, 7)
    const vol14 = muscleVolume(workouts, 14)
    const vol28 = muscleVolume(workouts, 28)

    const dayCount: Record<string, number> = {}
    workouts.forEach(w => {
      const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(w.date).getDay()]
      dayCount[dow] = (dayCount[dow] || 0) + 1
    })

    const volVals = Object.values(vol28).filter(v => v > 0)
    const volAvg = volVals.length ? volVals.reduce((s, v) => s + v, 0) / volVals.length : 0
    const lagging = Object.entries(vol28).filter(([, v]) => v < volAvg * 0.6).map(([m]) => m)

    const prompt = `You are an expert bodybuilding coach. Based on this athlete's data, design a new weekly training split.

CURRENT PHASE: ${phase}
TRAINING DAYS/WEEK (from history): ${JSON.stringify(dayCount)}
MUSCLE VOLUME — LAST 7 DAYS: ${JSON.stringify(vol7)}
MUSCLE VOLUME — LAST 14 DAYS: ${JSON.stringify(vol14)}
MUSCLE VOLUME — LAST 28 DAYS: ${JSON.stringify(vol28)}
LAGGING MUSCLES (below average volume): ${lagging.join(', ') || 'none identified'}
INJURY/CONSTRAINTS: Use the recovery context above if present, otherwise assume no active injuries.
GOAL: Classic physique — proportional, full muscle bellies, 80s/90s aesthetic. Priority: Back, Chest, Quads, Side Delts, Arms.
PHASE CONTEXT: ${phase === 'cut' ? 'Cutting — preserve muscle, moderate volume, avoid failure' : phase === 'build' ? 'Building — higher volume, progressive overload focus' : phase === 'recovery' ? 'Recovery — reduced intensity, joint-friendly exercise selection' : 'Maintenance — balanced volume, consistency focus'}

Design a 5-6 day split that:
1. Trains each muscle 2x/week
2. Addresses the lagging muscles with extra volume
3. Respects any active injury constraints from the recovery context
4. Fits the athlete's actual training days based on history
5. Uses the exercise library style: compounds 8-12 reps, isolation 12-20 reps

Return ONLY valid JSON in this exact structure (no markdown, no explanation):
{
  "name": "Split Name (e.g. Push/Pull/Legs or Upper/Lower)",
  "rationale": "2-3 sentence explanation of why this split suits this athlete's data",
  "days": [
    {
      "label": "Push",
      "suggestedDay": "Monday",
      "focus": "Chest / Front & Side Delts / Triceps",
      "note": "Brief session intent note",
      "exercises": [
        {
          "name": "Incline Barbell Press",
          "muscles": ["chest", "front_delts", "triceps"],
          "repRange": "8-12",
          "sets": 4,
          "priority": true,
          "note": "Lead compound — control the eccentric"
        }
      ]
    }
  ]
}`

    try {
      const result = await callClaudeJSON<CoachSplit>(prompt, 'You are an expert bodybuilding coach. Return only valid JSON.')
      setCoachSplit(result)
      setSwitchStep('coach_review')
    } catch {
      setCoachError('Failed to generate split — check connection and try again.')
      setSwitchStep('result')
    }
  }

  const buildSplitFromDefault = (): CoachSplit => {
    const order = splitOrder || SPLIT_ORDER
    return {
      name: currentProgramName,
      source: 'cloned-default',
      days: order.map(label => {
        const sd = SPLIT[label]
        return {
          label,
          focus: '',
          note: sd?.note || '',
          exercises: (sd?.exercises || []).map(ex => ({
            name: ex.name,
            muscles: ex.muscles,
            repRange: ex.repRange,
            sets: ex.sets || 3,
            priority: ex.priority || false,
            note: ex.note,
          })),
        }
      }),
    }
  }

  const acceptCoachSplit = () => {
    if (!coachSplit) return
    const name = coachSplit.name || newProgramName || 'Coach-Generated Split'
    onSwitchProgram(name, coachSplit)
    setSwitchStep(null)
    setAnalysis(null)
    setCoachSplit(null)
    setNewProgramName('')
  }

  return (
    <div className="page">
      <div className="card">
        <div className="card-title">Training Phase</div>
        <div className="phase-grid">
          {PHASES.map(p => (
            <div key={p.id} className={`phase-option ${phase === p.id ? 'selected' : ''}`} onClick={() => handlePhaseClick(p.id)}>
              <div className="phase-name" style={{ color: p.color }}>{p.label}</div>
              <div className="phase-desc">{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ borderColor: editingGoals ? 'var(--accent)' : currentGoal ? 'var(--accent)' : 'var(--border)', background: currentGoal && !editingGoals ? '#050f00' : 'var(--surface)' }}>
        <div className={`flex items-center justify-between ${editingGoals || currentGoal ? 'mb-3' : ''}`}>
          <div className="card-title mb-0" style={{ color: currentGoal ? 'var(--accent)' : 'var(--text2)' }}>
            {phase === 'cut' ? '🎯 Cut Goal' : phase === 'build' ? '🎯 Build Goal' : phase === 'maintenance' ? '🎯 Maintenance Goal' : '🎯 Recovery Goal'}
          </div>
          <div className="flex gap-1.5">
            {currentGoal && !editingGoals && <button className="btn btn-secondary btn-sm" onClick={openGoals}>Edit</button>}
            {!currentGoal && !editingGoals && <button className="btn btn-secondary btn-sm" onClick={openGoals}>Set Goal</button>}
            {editingGoals && <button className="btn btn-secondary btn-sm" onClick={() => setEditingGoals(false)}>Cancel</button>}
          </div>
        </div>

        {currentGoal && !editingGoals && (() => {
          const g = currentGoal
          if (phase === 'cut') return (
            <div className="grid gap-1.5">
              {g.mode === 'rate' && <div className="" style={{ color: 'var(--text2)' }}>Target rate: <span className="font-bold" style={{ color: 'var(--accent)' }}>{g.targetRate} lbs/week</span></div>}
              {g.mode === 'deadline' && <>
                <div className="" style={{ color: 'var(--text2)' }}>Goal weight: <span className="font-bold" style={{ color: 'var(--accent)' }}>{g.targetWeight} lbs</span></div>
                <div className="" style={{ color: 'var(--text2)' }}>Deadline: <span className="font-bold" style={{ color: 'var(--accent)' }}>{g.deadline}</span></div>
              </>}
              {g.note && <div className="text-xs italic" style={{ color: 'var(--text3)' }}>{g.note}</div>}
              <button className="btn btn-secondary btn-sm mt-1 self-start text-[11px]" style={{ color: 'var(--red)', borderColor: 'var(--red)' }} onClick={clearGoals}>Clear Goal</button>
            </div>
          )
          if (phase === 'build') return (
            <div className="grid gap-1.5">
              {g.mode === 'overall' && <div className="" style={{ color: 'var(--text2)' }}>Mode: <span className="font-bold" style={{ color: 'var(--accent)' }}>Overall growth</span></div>}
              {g.mode === 'priority' && <div className="" style={{ color: 'var(--text2)' }}>Priority: <span className="font-bold" style={{ color: 'var(--accent)' }}>{(g.muscles || []).map(m => m.replace('_', ' ')).join(', ')}</span></div>}
              {g.mode === 'strength' && <div className="" style={{ color: 'var(--text2)' }}>Strength goal: <span className="font-bold" style={{ color: 'var(--accent)' }}>{g.lift} — {g.targetWeight}lbs × {g.targetReps} reps</span></div>}
              {g.note && <div className="text-xs italic" style={{ color: 'var(--text3)' }}>{g.note}</div>}
              <button className="btn btn-secondary btn-sm mt-1 self-start text-[11px]" style={{ color: 'var(--red)', borderColor: 'var(--red)' }} onClick={clearGoals}>Clear Goal</button>
            </div>
          )
          return <div className="text-lg" style={{ color: 'var(--text3)' }}>Goal set.</div>
        })()}

        {editingGoals && (
          <div>
            {phase === 'cut' && (
              <div className="grid gap-3.5">
                <div>
                  <div className="macro-lbl mb-2">Mode</div>
                  <div className="flex gap-2">
                    {[{ id: 'rate', label: 'Rate of loss' }, { id: 'deadline', label: 'Deadline + target weight' }].map(m => (
                      <div
                        key={m.id}
                        onClick={() => setGoalDraft(d => ({ ...d, mode: m.id }))}
                        className="cursor-pointer rounded-[5px] border px-3.5 py-2"
                        style={{
                          borderColor: goalDraft.mode === m.id ? 'var(--accent)' : 'var(--border)',
                          background: goalDraft.mode === m.id ? '#0a1400' : 'var(--surface2)',
                          color: goalDraft.mode === m.id ? 'var(--accent)' : 'var(--text2)',
                        }}
                      >
                        {m.label}
                      </div>
                    ))}
                  </div>
                </div>

                {goalDraft.mode === 'rate' && (
                  <div>
                    <div className="macro-lbl mb-1.5">Target rate of loss (lbs/week)</div>
                    <input className="inp inp-sm w-[120px]" placeholder="e.g. 1.5"
                      value={goalDraft.targetRate || ''} onChange={e => setGoalDraft(d => ({ ...d, targetRate: e.target.value }))} />
                    <div className="mt-1 text-[14px]" style={{ color: 'var(--text3)' }}>0.5–1% of bodyweight/week is the natural range. Above 1% risks muscle loss.</div>
                  </div>
                )}

                {goalDraft.mode === 'deadline' && (
                  <div className="flex flex-wrap gap-3">
                    <div>
                      <div className="macro-lbl mb-1.5">Goal weight (lbs)</div>
                      <input className="inp inp-sm w-[110px]" placeholder="e.g. 175"
                        value={goalDraft.targetWeight || ''} onChange={e => setGoalDraft(d => ({ ...d, targetWeight: e.target.value }))} />
                    </div>
                    <div>
                      <div className="macro-lbl mb-1.5">Deadline</div>
                      <input type="date" className="inp w-[160px]"
                        value={goalDraft.deadline || ''} onChange={e => setGoalDraft(d => ({ ...d, deadline: e.target.value }))} />
                    </div>
                  </div>
                )}

                <div>
                  <div className="macro-lbl mb-1.5">Notes (optional)</div>
                  <input className="inp" placeholder="e.g. aggressive cut for summer, pool season deadline"
                    value={goalDraft.note || ''} onChange={e => setGoalDraft(d => ({ ...d, note: e.target.value }))} />
                </div>
              </div>
            )}

            {phase === 'build' && (
              <div className="grid gap-3.5">
                <div>
                  <div className="macro-lbl mb-2">Mode</div>
                  <div className="flex flex-wrap gap-2">
                    {[{ id: 'overall', label: 'Overall growth' }, { id: 'priority', label: 'Priority muscle(s)' }, { id: 'strength', label: 'Strength goal' }].map(m => (
                      <div
                        key={m.id}
                        onClick={() => setGoalDraft(d => ({ ...d, mode: m.id, muscles: [], lift: '', targetWeight: '', targetReps: '' }))}
                        className="cursor-pointer rounded-[5px] border px-3.5 py-2 text-[14px]"
                        style={{
                          borderColor: goalDraft.mode === m.id ? 'var(--accent)' : 'var(--border)',
                          background: goalDraft.mode === m.id ? '#0a1400' : 'var(--surface2)',
                          color: goalDraft.mode === m.id ? 'var(--accent)' : 'var(--text2)',
                        }}
                      >
                        {m.label}
                      </div>
                    ))}
                  </div>
                </div>

                {goalDraft.mode === 'priority' && (
                  <div>
                    <div className="macro-lbl mb-2">Select priority muscles (up to 2)</div>
                    <div className="flex flex-wrap gap-1.5">
                      {GOAL_MUSCLES.map(m => {
                        const selected = (goalDraft.muscles || []).includes(m)
                        const maxed = (goalDraft.muscles || []).length >= 2 && !selected
                        return (
                          <div
                            key={m}
                            onClick={() => {
                              if (maxed) return
                              setGoalDraft(d => ({
                                ...d,
                                muscles: selected ? d.muscles!.filter(x => x !== m) : [...(d.muscles || []), m],
                              }))
                            }}
                            className={`rounded border px-3 py-[5px] text-sm capitalize ${maxed ? 'cursor-default' : 'cursor-pointer'}`}
                            style={{
                              borderColor: selected ? 'var(--accent)' : 'var(--border)',
                              background: selected ? '#0a1400' : 'var(--surface2)',
                              color: selected ? 'var(--accent)' : maxed ? 'var(--text3)' : 'var(--text2)',
                            }}
                          >{m.replace('_', ' ')}</div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {goalDraft.mode === 'strength' && (
                  <div className="grid gap-2.5">
                    <div>
                      <div className="macro-lbl mb-1.5">Target lift</div>
                      <input className="inp" placeholder="e.g. Hack Squat, Incline DB Press"
                        value={goalDraft.lift || ''} onChange={e => setGoalDraft(d => ({ ...d, lift: e.target.value }))} />
                    </div>
                    <div className="flex gap-3">
                      <div>
                        <div className="macro-lbl mb-1.5">Target weight (lbs)</div>
                        <input className="inp inp-sm w-[110px]" placeholder="e.g. 315"
                          value={goalDraft.targetWeight || ''} onChange={e => setGoalDraft(d => ({ ...d, targetWeight: e.target.value }))} />
                      </div>
                      <div>
                        <div className="macro-lbl mb-1.5">Target reps</div>
                        <input className="inp inp-sm w-[90px]" placeholder="e.g. 8"
                          value={goalDraft.targetReps || ''} onChange={e => setGoalDraft(d => ({ ...d, targetReps: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <div className="macro-lbl mb-1.5">Notes (optional)</div>
                  <input className="inp" placeholder="e.g. focus on back and arms this block"
                    value={goalDraft.note || ''} onChange={e => setGoalDraft(d => ({ ...d, note: e.target.value }))} />
                </div>
              </div>
            )}

            {(phase === 'maintenance' || phase === 'recovery') && (
              <div>
                <div className="macro-lbl mb-1.5">Goal note</div>
                <input className="inp" placeholder={phase === 'maintenance' ? 'e.g. establish baseline, nail consistency' : 'e.g. full elbow recovery, no time pressure'}
                  value={goalDraft.note || ''} onChange={e => setGoalDraft(d => ({ ...d, note: e.target.value }))} />
              </div>
            )}

            <div className="btn-row mt-3.5">
              <button className="btn btn-primary btn-sm"
                disabled={phase === 'cut' ? !goalDraft.mode : phase === 'build' ? !goalDraft.mode : false}
                onClick={saveGoals}>Save Goal</button>
              {currentGoal && <button className="btn btn-secondary btn-sm" style={{ color: 'var(--red)', borderColor: 'var(--red)' }} onClick={clearGoals}>Clear</button>}
            </div>
          </div>
        )}

        {!currentGoal && !editingGoals && (
          <div className="mt-2 text-[14px]" style={{ color: 'var(--text3)' }}>
            {phase === 'cut' ? 'Set a rate target or deadline to track your cut against a specific goal.' : phase === 'build' ? 'Set a build focus — overall growth, a priority muscle, or a strength target.' : 'Optional — add a note for what this phase is working toward.'}
          </div>
        )}
      </div>

      {!activeCoachSplit && (() => {
        const order = splitOrder || SPLIT_ORDER
        const moveDay = (idx: number, dir: number) => {
          const next = [...order]
          const target = idx + dir
          if (target < 0 || target >= next.length) return
          ;[next[idx], next[target]] = [next[target], next[idx]]
          onSplitOrder(next)
        }
        return (
          <div className="card">
            <div className="mb-1 flex items-center justify-between">
              <div className="card-title mb-0">Split Order</div>
              {splitOrder && (
                <button className="btn btn-secondary btn-sm" onClick={() => onSplitOrder(null)}>Reset</button>
              )}
            </div>
            <div className="mb-2.5 text-xs" style={{ color: 'var(--text3)' }}>Drag the days into the order you train them. Reflected in the Log tab.</div>
            {order.map((day, idx) => (
              <SplitDayRow key={day} day={day} index={idx} total={order.length} onMove={moveDay} />
            ))}
          </div>
        )
      })()}

      {recoveryContext?.active && (
        <div className="card" style={{ borderColor: 'var(--accent2)', background: '#1a0d00' }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="card-title mb-1" style={{ color: 'var(--accent2)' }}>
                {RECOVERY_REASONS.find(r => r.id === recoveryContext.reason)?.icon || '⚡'} Recovery Mode Active
              </div>
              <div className="" style={{ color: 'var(--text2)' }}>
                {RECOVERY_REASONS.find(r => r.id === recoveryContext.reason)?.label || recoveryContext.reason}
                {recoveryContext.injuryDetail && <span className="ml-1.5" style={{ color: 'var(--accent2)' }}>— {recoveryContext.injuryDetail}</span>}
              </div>
              <div className="mt-1 text-[14px]" style={{ color: 'var(--text3)' }}>Since {recoveryContext.startDate}</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => onRecoveryContext(null)}>
              Clear
            </button>
          </div>
        </div>
      )}

      {showRecoveryModal && (
        <div className="card" style={{ borderColor: 'var(--accent2)', background: '#1a0d00' }}>
          <div className="card-title" style={{ color: 'var(--accent2)' }}>What&apos;s driving this recovery phase?</div>
          <div className="mb-4 grid gap-2">
            {RECOVERY_REASONS.map(r => (
              <div
                key={r.id}
                onClick={() => setRcReason(r.id)}
                className="flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2.5"
                style={{
                  borderColor: rcReason === r.id ? 'var(--accent2)' : 'var(--border)',
                  background: rcReason === r.id ? '#2d1a00' : 'var(--surface2)',
                }}
              >
                <span className="text-lg">{r.icon}</span>
                <span
                  className={`text-[13px] ${rcReason === r.id ? 'font-semibold' : 'font-normal'}`}
                  style={{ color: rcReason === r.id ? 'var(--accent2)' : 'var(--text2)' }}
                >{r.label}</span>
              </div>
            ))}
          </div>

          {rcReason === 'injury' && (
            <div className="mb-4">
              <div className="macro-lbl mb-1.5">What specifically? (used to flag exercises)</div>
              <input
                className="inp"
                placeholder="e.g. left elbow, right knee, lower back..."
                value={rcDetail}
                onChange={e => setRcDetail(e.target.value)}
              />
              <div className="mt-1 text-[11px]" style={{ color: 'var(--text3)' }}>
                The app will auto-flag exercises that may aggravate this area.
              </div>
            </div>
          )}

          <div className="btn-row">
            <button
              className="btn btn-primary btn-sm"
              disabled={!rcReason}
              onClick={confirmRecovery}
            >Confirm Recovery Phase</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowRecoveryModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title">Your Profile</div>
        <div className="leading-loose" style={{ color: 'var(--text2)' }}>
          <div><strong className="tracking-[1px]" style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>Goal:</strong> 80s/90s era classic physique — proportional, full muscle bellies</div>
          <div><strong className="tracking-[1px]" style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>Rep Range:</strong> 8-12 compounds · 12-20 isolation · 0-1 RIR</div>
          <div><strong className="tracking-[1px]" style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>Volume Target:</strong> 16-24 sets/muscle/week across both sessions</div>
          <div><strong className="tracking-[1px]" style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>Frequency:</strong> 2x/week per muscle group</div>
          <div><strong className="tracking-[1px]" style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>Priority:</strong> Back, Chest, Quads ★, Side Delts, Arms</div>
          <div className="mt-2 border-t pt-2" style={{ borderColor: 'var(--border)' }}>
            <strong className="tracking-[1px]" style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
              Split:{activeCoachSplit ? ` ${activeCoachSplit.name}` : ''}
            </strong>
            <div className="mt-1 grid gap-[3px]">
              {(() => {
                const items = activeCoachSplit
                  ? activeCoachSplit.days.map((d, i) => ({
                      day: d.suggestedDay ? d.suggestedDay.slice(0, 3) : `${i + 1}`,
                      label: d.label,
                      detail: d.focus || '',
                    }))
                  : (splitOrder || SPLIT_ORDER).map((entry, i) => {
                      const [rawLabel, ...rest] = entry.split(' — ')
                      return {
                        day: `${i + 1}`,
                        label: (rawLabel || entry).trim(),
                        detail: rest.join(' — ').trim(),
                      }
                    })
                return items.map(({ day, label, detail }, i) => (
                  <div key={`${day}-${i}`} className="flex items-baseline gap-2">
                    <span className="w-7 font-bold tracking-[1px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--text3)' }}>{day}</span>
                    <span className="font-bold" style={{ fontFamily: 'var(--font-display)', color: label === 'Rest' ? 'var(--text3)' : 'var(--accent)' }}>{label}</span>
                    {detail && <span className="text-xs" style={{ color: 'var(--text3)' }}>{detail}</span>}
                  </div>
                ))
              })()}
            </div>
          </div>
          <div className="mt-2 border-t pt-2" style={{ borderColor: 'var(--border)' }}>
            <div className="mt-[3px] text-xs leading-[1.6]" style={{ color: 'var(--text3)' }}>
              {recoveryContext?.active && recoveryContext.injuryDetail ? `⚠ Active issue: ${recoveryContext.injuryDetail}` : 'No active injuries logged.'}
            </div>
          </div>
          <div><strong className="tracking-[1px]" style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>Rest:</strong> 1.5-2 min between sets (flexible)</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Current Program</div>
        <ProgramEditor
          split={activeCoachSplit || buildSplitFromDefault()}
          onChange={onUpdateCoachSplit}
          customExercises={customExercises}
          onSaveCustomExercise={onSaveCustomExercise}
        />
        {!activeCoachSplit && (
          <div className="mt-3 text-[11px] italic" style={{ color: 'var(--text3)' }}>
            You&apos;re viewing the built-in split. Your first edit will save a personal copy you can keep tuning.
          </div>
        )}
      </div>

      <div className="card" style={{ borderColor: switchStep ? 'var(--accent2)' : 'var(--border)' }}>
        <div className="card-title">Program Management</div>

        {!switchStep && (
          <div>
            <div className="mb-3 text-[13px] leading-[1.6]" style={{ color: 'var(--text2)' }}>
              Thinking about switching programs? The app will analyse your last 6 weeks of data first and give you an honest read before anything changes.
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-secondary" onClick={startSwitch} style={{ borderColor: 'var(--accent2)', color: 'var(--accent2)' }}>
                ⚑ Request Program Switch
              </button>
              <button className="btn btn-secondary" onClick={() => { setBuilderDays([{ name: '', exercises: [] }]); setBuilderName(''); setSwitchStep('build') }} style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                ✎ Build My Own
              </button>
            </div>
          </div>
        )}

        {switchStep === 'result' && analysis && (() => {
          const c = VERDICT_COLORS[analysis.verdict] || VERDICT_COLORS.insufficient
          return (
            <div>
              <div className="mb-3 rounded-md border px-3.5 py-3" style={{ background: c.bg, borderColor: c.border }}>
                <div className="mb-1.5 font-bold uppercase tracking-[2px]" style={{ fontFamily: 'var(--font-display)', color: c.text }}>{c.label}</div>
                <div className="mb-1.5 leading-[1.6]" style={{ color: 'var(--text)' }}>{analysis.summary}</div>
                <div className="text-sm leading-normal" style={{ color: 'var(--text2)' }}>{analysis.reasoning}</div>
                <div className="mt-2.5 flex flex-wrap gap-4">
                  <span className="text-[13px]" style={{ color: 'var(--text3)' }}>📅 {analysis.sessions} sessions analysed</span>
                  <span className="text-[13px]" style={{ color: 'var(--text3)' }}>📊 {Math.round((analysis.sessionsPerWeek || 0) * 10) / 10} sessions/wk avg</span>
                  <span className="text-[13px]" style={{ color: 'var(--text3)' }}>💭 {Math.round((analysis.avgFeel || 0) * 10) / 10}/5 avg feel</span>
                </div>
              </div>

              {(analysis.top3?.length ?? 0) > 0 && (
                <div className="mb-3">
                  <div className="mb-1.5 text-[12px] font-bold uppercase tracking-[1px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--text3)' }}>Top Progressing Lifts</div>
                  {analysis.top3!.map((t, i) => (
                    <div key={i} className="flex items-center justify-between border-b py-[5px]" style={{ borderColor: 'var(--border)' }}>
                      <span className="" style={{ color: 'var(--text)' }}>{t.name}</span>
                      <span className="text-sm font-bold" style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
                        {t.weightDelta > 0 ? `+${Math.round(t.weightDelta)}lbs` : ''}{t.repDelta >= 1 ? ` +${Math.round(t.repDelta)} reps` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="btn-row flex-wrap">
                <button className="btn btn-primary btn-sm" onClick={requestCoachSplit}>
                  ✦ Get Coach Recommendation
                </button>
                {(analysis.verdict === 'green' || analysis.verdict === 'yellow') && (
                  <button className="btn btn-secondary btn-sm" style={{ borderColor: 'var(--accent2)', color: 'var(--accent2)' }} onClick={() => setSwitchStep('deload_offer')}>
                    Still want to switch
                  </button>
                )}
                {(analysis.verdict === 'red' || analysis.verdict === 'insufficient') && (
                  <button className="btn btn-secondary btn-sm" style={{ borderColor: 'var(--red)', color: 'var(--red)' }} onClick={() => setSwitchStep('name_new')}>
                    Switch manually
                  </button>
                )}
                <button className="btn btn-secondary btn-sm" onClick={() => { setSwitchStep(null); setAnalysis(null) }}>Cancel</button>
              </div>
            </div>
          )
        })()}

        {switchStep === 'deload_offer' && analysis && (
          <div>
            <div className="mb-3 rounded-md border px-3.5 py-3" style={{ background: '#0a0f00', borderColor: 'var(--accent)' }}>
              <div className="mb-1.5 text-xs font-bold uppercase tracking-[2px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>BEFORE YOU GO</div>
              {(analysis.top3?.length ?? 0) > 0 && (
                <div className="mb-2.5">
                  <div className="mb-2 text-[13px]" style={{ color: 'var(--text2)' }}>These lifts are still moving — you&apos;d be walking away from:</div>
                  {analysis.top3!.map((t, i) => (
                    <div key={i} className="flex justify-between border-b py-1" style={{ borderColor: 'var(--border)' }}>
                      <span className="text-[13px]" style={{ color: 'var(--text)' }}>{t.name}</span>
                      <span className="text-xs font-bold" style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
                        {t.weightDelta > 0 ? `+${Math.round(t.weightDelta)}lbs` : ''}{t.repDelta >= 1 ? ` +${Math.round(t.repDelta)} reps` : ''} over 6 weeks
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="text-[13px] leading-[1.6]" style={{ color: 'var(--text2)' }}>
                A deload week (60-70% loads, same structure) often breaks a mental rut without losing the program momentum you&apos;ve built.
              </div>
            </div>
            <div className="btn-row flex-wrap">
              <button className="btn btn-primary btn-sm" onClick={() => { setSwitchStep(null); setAnalysis(null); onPhaseChange('recovery') }}>
                Take a deload week
              </button>
              <button className="btn btn-secondary btn-sm" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }} onClick={requestCoachSplit}>
                ✦ Get coach recommendation
              </button>
              <button className="btn btn-secondary btn-sm" style={{ borderColor: 'var(--red)', color: 'var(--red)' }} onClick={() => setSwitchStep('name_new')}>
                Switch manually
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => { setSwitchStep(null); setAnalysis(null) }}>Cancel</button>
            </div>
          </div>
        )}

        {switchStep === 'coach_generating' && (
          <div className="py-6 text-center">
            <div className="loading-dots mb-3 justify-center"><span /><span /><span /></div>
            <div className="text-[13px] font-bold uppercase tracking-[2px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>Analysing your data...</div>
            <div className="mt-1.5 text-xs" style={{ color: 'var(--text3)' }}>Reviewing volume, lagging muscles, consistency, and any active injury constraints</div>
          </div>
        )}

        {switchStep === 'build' && (
          <CustomSplitBuilder
            days={builderDays}
            name={builderName}
            onNameChange={setBuilderName}
            onDaysChange={setBuilderDays}
            customExercises={customExercises}
            onSave={(split) => {
              onSwitchProgram(split.name, split)
              setSwitchStep(null)
              setBuilderDays([])
              setBuilderName('')
            }}
            onCancel={() => setSwitchStep(null)}
          />
        )}

        {switchStep === 'coach_review' && coachSplit && (
          <div>
            <div className="mb-3.5 rounded-md border px-3.5 py-3" style={{ background: '#050f00', borderColor: 'var(--accent)' }}>
              <div className="mb-1.5 text-[13px] font-bold uppercase tracking-[2px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>✦ COACH RECOMMENDATION: {coachSplit.name}</div>
              <div className="text-[13px] leading-[1.6]" style={{ color: 'var(--text2)' }}>{coachSplit.rationale}</div>
            </div>

            {(coachSplit.days || []).map((day, di) => (
              <div key={di} className="mb-2 rounded-md border px-3 py-2.5" style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <div>
                    <span className="mr-2 text-[15px] font-black uppercase tracking-[1px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>{day.label}</span>
                    <span className="text-[11px]" style={{ color: 'var(--text3)' }}>{day.focus}</span>
                  </div>
                  <span className="text-[11px] tracking-[1px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--text3)' }}>{day.suggestedDay}</span>
                </div>
                {day.note && <div className="mb-2 text-[11px] italic" style={{ color: 'var(--accent2)' }}>{day.note}</div>}
                <div className="grid gap-1">
                  {(day.exercises || []).map((ex, ei) => (
                    <div key={ei} className="flex items-center justify-between border-b py-1" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[13px]" style={{ color: 'var(--text)' }}>{ex.name}</span>
                        {ex.priority && <span className="rounded-[3px] px-[5px] py-px text-[10px] font-bold tracking-[1px]" style={{ fontFamily: 'var(--font-display)', color: '#f5a742', background: '#2d1a00' }}>PRIORITY</span>}
                      </div>
                      <span className="whitespace-nowrap text-[11px]" style={{ color: 'var(--text3)', fontFamily: 'var(--font-display)' }}>{ex.sets}×{ex.repRange}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="mb-3 text-[11px]" style={{ color: 'var(--text3)' }}>
              Accepting this will archive your current program and load this split as the new active program.
            </div>
            <div className="btn-row">
              <button className="btn btn-primary btn-sm" onClick={acceptCoachSplit}>Accept &amp; Load Program</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setSwitchStep('name_new')}>Switch manually instead</button>
              <button className="btn btn-secondary btn-sm" onClick={() => { setSwitchStep(null); setAnalysis(null); setCoachSplit(null) }}>Cancel</button>
            </div>
          </div>
        )}

        {switchStep === 'name_new' && (
          <div>
            <div className="mb-3 text-[13px] leading-[1.6]" style={{ color: 'var(--text2)' }}>
              Your current program will be archived with all its history intact. Give the new program a name to begin.
            </div>
            <input
              className="inp mb-3 font-bold tracking-[1px]"
              placeholder="New program name (e.g. Upper/Lower, Full Body, PPL v2)"
              value={newProgramName}
              onChange={e => setNewProgramName(e.target.value)}
              style={{ fontFamily: 'var(--font-display)' }}
            />
            <div className="btn-row">
              <button
                className="btn btn-primary btn-sm"
                disabled={!newProgramName.trim()}
                onClick={() => { onSwitchProgram(newProgramName.trim()); setSwitchStep(null); setAnalysis(null); setNewProgramName('') }}
              >
                Archive &amp; Start New
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => { setSwitchStep(null); setAnalysis(null) }}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {customExercises?.length > 0 && (
        <div className="card">
          <button
            onClick={() => setShowLibrary(s => !s)}
            className="flex w-full cursor-pointer items-center justify-between border-0 bg-transparent p-0 text-inherit"
            aria-expanded={showLibrary}
          >
            <div className="card-title mb-0">
              My Exercise Library
              <span className="ml-2 text-[11px] font-bold tracking-[1px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--text3)' }}>
                {customExercises.length}
              </span>
            </div>
            <span className="text-xs tracking-[1px]" style={{ color: 'var(--text3)', fontFamily: 'var(--font-display)' }}>
              {showLibrary ? '▾' : '▸'}
            </span>
          </button>

          {showLibrary && (
            <div className="mt-3">
              <div className="grid gap-1.5">
                {customExercises.map((ex, i) => (
                  <CustomLibraryRow
                    key={ex.name + i}
                    exercise={ex}
                    onUpdate={onUpdateCustomExercise}
                    onDelete={onDeleteCustomExercise}
                  />
                ))}
              </div>
              <div className="mt-2 text-[11px]" style={{ color: 'var(--text3)' }}>
                These appear in the exercise picker alongside the built-in library.
              </div>
            </div>
          )}
        </div>
      )}

      {archivedPrograms?.length > 0 && (
        <div className="card">
          <div className="card-title">Past Programs</div>
          {archivedPrograms.map((p, i) => (
            <div key={i} className="flex items-center justify-between border-b py-2" style={{ borderColor: 'var(--border)' }}>
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{p.name}</div>
                <div className="text-xs" style={{ color: 'var(--text3)' }}>{fmtDate(p.startDate)} — {fmtDate(p.endDate)} · {p.sessionCount} sessions</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
