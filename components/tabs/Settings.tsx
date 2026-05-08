'use client'

import { useState } from 'react'
import {
  PHASES,
  RECOVERY_REASONS,
  SPLIT_ORDER,
  type ExerciseTemplate,
  type PhaseId,
} from '@/lib/constants'
import { callClaudeJSON, fmtDate, muscleVolume, type RecoveryContext, type Workout } from '@/lib/utils'
import { analyzeProgramSwitch, type ProgramSwitchAnalysis } from '@/lib/progression'
import CustomSplitBuilder, { type CoachSplit } from '@/components/shared/CustomSplitBuilder'
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
  onDeleteCustomExercise,
  splitOrder,
  onSplitOrder,
  activeCoachSplit,
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
  onDeleteCustomExercise: (name: string) => void
  splitOrder: string[] | null
  onSplitOrder: (order: string[] | null) => void
  activeCoachSplit: CoachSplit | null
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: editingGoals || currentGoal ? 12 : 0 }}>
          <div className="card-title" style={{ marginBottom: 0, color: currentGoal ? 'var(--accent)' : 'var(--text2)' }}>
            {phase === 'cut' ? '🎯 Cut Goal' : phase === 'build' ? '🎯 Build Goal' : phase === 'maintenance' ? '🎯 Maintenance Goal' : '🎯 Recovery Goal'}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {currentGoal && !editingGoals && <button className="btn btn-secondary btn-sm" style={{ fontSize: 11 }} onClick={openGoals}>Edit</button>}
            {!currentGoal && !editingGoals && <button className="btn btn-secondary btn-sm" style={{ fontSize: 11 }} onClick={openGoals}>Set Goal</button>}
            {editingGoals && <button className="btn btn-secondary btn-sm" style={{ fontSize: 11 }} onClick={() => setEditingGoals(false)}>Cancel</button>}
          </div>
        </div>

        {currentGoal && !editingGoals && (() => {
          const g = currentGoal
          if (phase === 'cut') return (
            <div style={{ display: 'grid', gap: 6 }}>
              {g.mode === 'rate' && <div style={{ fontSize: 13, color: 'var(--text2)' }}>Target rate: <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{g.targetRate} lbs/week</span></div>}
              {g.mode === 'deadline' && <>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>Goal weight: <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{g.targetWeight} lbs</span></div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>Deadline: <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{g.deadline}</span></div>
              </>}
              {g.note && <div style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }}>{g.note}</div>}
              <button className="btn btn-secondary btn-sm" style={{ fontSize: 11, marginTop: 4, color: 'var(--red)', borderColor: 'var(--red)', alignSelf: 'flex-start' }} onClick={clearGoals}>Clear Goal</button>
            </div>
          )
          if (phase === 'build') return (
            <div style={{ display: 'grid', gap: 6 }}>
              {g.mode === 'overall' && <div style={{ fontSize: 13, color: 'var(--text2)' }}>Mode: <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Overall growth</span></div>}
              {g.mode === 'priority' && <div style={{ fontSize: 13, color: 'var(--text2)' }}>Priority: <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{(g.muscles || []).map(m => m.replace('_', ' ')).join(', ')}</span></div>}
              {g.mode === 'strength' && <div style={{ fontSize: 13, color: 'var(--text2)' }}>Strength goal: <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{g.lift} — {g.targetWeight}lbs × {g.targetReps} reps</span></div>}
              {g.note && <div style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }}>{g.note}</div>}
              <button className="btn btn-secondary btn-sm" style={{ fontSize: 11, marginTop: 4, color: 'var(--red)', borderColor: 'var(--red)', alignSelf: 'flex-start' }} onClick={clearGoals}>Clear Goal</button>
            </div>
          )
          return <div style={{ fontSize: 13, color: 'var(--text3)' }}>Goal set.</div>
        })()}

        {editingGoals && (
          <div>
            {phase === 'cut' && (
              <div style={{ display: 'grid', gap: 14 }}>
                <div>
                  <div className="macro-lbl" style={{ marginBottom: 8 }}>Mode</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[{ id: 'rate', label: 'Rate of loss' }, { id: 'deadline', label: 'Deadline + target weight' }].map(m => (
                      <div key={m.id} onClick={() => setGoalDraft(d => ({ ...d, mode: m.id }))}
                        style={{ padding: '8px 14px', borderRadius: 5, cursor: 'pointer', fontSize: 13,
                          border: `1px solid ${goalDraft.mode === m.id ? 'var(--accent)' : 'var(--border)'}`,
                          background: goalDraft.mode === m.id ? '#0a1400' : 'var(--surface2)',
                          color: goalDraft.mode === m.id ? 'var(--accent)' : 'var(--text2)' }}>
                        {m.label}
                      </div>
                    ))}
                  </div>
                </div>

                {goalDraft.mode === 'rate' && (
                  <div>
                    <div className="macro-lbl" style={{ marginBottom: 6 }}>Target rate of loss (lbs/week)</div>
                    <input className="inp inp-sm" style={{ width: 120 }} placeholder="e.g. 1.5"
                      value={goalDraft.targetRate || ''} onChange={e => setGoalDraft(d => ({ ...d, targetRate: e.target.value }))} />
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>0.5–1% of bodyweight/week is the natural range. Above 1% risks muscle loss.</div>
                  </div>
                )}

                {goalDraft.mode === 'deadline' && (
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <div className="macro-lbl" style={{ marginBottom: 6 }}>Goal weight (lbs)</div>
                      <input className="inp inp-sm" style={{ width: 110 }} placeholder="e.g. 175"
                        value={goalDraft.targetWeight || ''} onChange={e => setGoalDraft(d => ({ ...d, targetWeight: e.target.value }))} />
                    </div>
                    <div>
                      <div className="macro-lbl" style={{ marginBottom: 6 }}>Deadline</div>
                      <input type="date" className="inp" style={{ width: 160 }}
                        value={goalDraft.deadline || ''} onChange={e => setGoalDraft(d => ({ ...d, deadline: e.target.value }))} />
                    </div>
                  </div>
                )}

                <div>
                  <div className="macro-lbl" style={{ marginBottom: 6 }}>Notes (optional)</div>
                  <input className="inp" placeholder="e.g. aggressive cut for summer, pool season deadline"
                    value={goalDraft.note || ''} onChange={e => setGoalDraft(d => ({ ...d, note: e.target.value }))} />
                </div>
              </div>
            )}

            {phase === 'build' && (
              <div style={{ display: 'grid', gap: 14 }}>
                <div>
                  <div className="macro-lbl" style={{ marginBottom: 8 }}>Mode</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[{ id: 'overall', label: 'Overall growth' }, { id: 'priority', label: 'Priority muscle(s)' }, { id: 'strength', label: 'Strength goal' }].map(m => (
                      <div key={m.id} onClick={() => setGoalDraft(d => ({ ...d, mode: m.id, muscles: [], lift: '', targetWeight: '', targetReps: '' }))}
                        style={{ padding: '8px 14px', borderRadius: 5, cursor: 'pointer', fontSize: 13,
                          border: `1px solid ${goalDraft.mode === m.id ? 'var(--accent)' : 'var(--border)'}`,
                          background: goalDraft.mode === m.id ? '#0a1400' : 'var(--surface2)',
                          color: goalDraft.mode === m.id ? 'var(--accent)' : 'var(--text2)' }}>
                        {m.label}
                      </div>
                    ))}
                  </div>
                </div>

                {goalDraft.mode === 'priority' && (
                  <div>
                    <div className="macro-lbl" style={{ marginBottom: 8 }}>Select priority muscles (up to 2)</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {GOAL_MUSCLES.map(m => {
                        const selected = (goalDraft.muscles || []).includes(m)
                        const maxed = (goalDraft.muscles || []).length >= 2 && !selected
                        return (
                          <div key={m} onClick={() => {
                            if (maxed) return
                            setGoalDraft(d => ({
                              ...d,
                              muscles: selected ? d.muscles!.filter(x => x !== m) : [...(d.muscles || []), m],
                            }))
                          }} style={{
                            padding: '5px 12px', borderRadius: 4, cursor: maxed ? 'default' : 'pointer', fontSize: 12,
                            border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                            background: selected ? '#0a1400' : 'var(--surface2)',
                            color: selected ? 'var(--accent)' : maxed ? 'var(--text3)' : 'var(--text2)',
                            textTransform: 'capitalize',
                          }}>{m.replace('_', ' ')}</div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {goalDraft.mode === 'strength' && (
                  <div style={{ display: 'grid', gap: 10 }}>
                    <div>
                      <div className="macro-lbl" style={{ marginBottom: 6 }}>Target lift</div>
                      <input className="inp" placeholder="e.g. Hack Squat, Incline DB Press"
                        value={goalDraft.lift || ''} onChange={e => setGoalDraft(d => ({ ...d, lift: e.target.value }))} />
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div>
                        <div className="macro-lbl" style={{ marginBottom: 6 }}>Target weight (lbs)</div>
                        <input className="inp inp-sm" style={{ width: 110 }} placeholder="e.g. 315"
                          value={goalDraft.targetWeight || ''} onChange={e => setGoalDraft(d => ({ ...d, targetWeight: e.target.value }))} />
                      </div>
                      <div>
                        <div className="macro-lbl" style={{ marginBottom: 6 }}>Target reps</div>
                        <input className="inp inp-sm" style={{ width: 90 }} placeholder="e.g. 8"
                          value={goalDraft.targetReps || ''} onChange={e => setGoalDraft(d => ({ ...d, targetReps: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <div className="macro-lbl" style={{ marginBottom: 6 }}>Notes (optional)</div>
                  <input className="inp" placeholder="e.g. focus on back and arms this block"
                    value={goalDraft.note || ''} onChange={e => setGoalDraft(d => ({ ...d, note: e.target.value }))} />
                </div>
              </div>
            )}

            {(phase === 'maintenance' || phase === 'recovery') && (
              <div>
                <div className="macro-lbl" style={{ marginBottom: 6 }}>Goal note</div>
                <input className="inp" placeholder={phase === 'maintenance' ? 'e.g. establish baseline, nail consistency' : 'e.g. full elbow recovery, no time pressure'}
                  value={goalDraft.note || ''} onChange={e => setGoalDraft(d => ({ ...d, note: e.target.value }))} />
              </div>
            )}

            <div className="btn-row" style={{ marginTop: 14 }}>
              <button className="btn btn-primary btn-sm"
                disabled={phase === 'cut' ? !goalDraft.mode : phase === 'build' ? !goalDraft.mode : false}
                onClick={saveGoals}>Save Goal</button>
              {currentGoal && <button className="btn btn-secondary btn-sm" style={{ color: 'var(--red)', borderColor: 'var(--red)' }} onClick={clearGoals}>Clear</button>}
            </div>
          </div>
        )}

        {!currentGoal && !editingGoals && (
          <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 8 }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div className="card-title" style={{ marginBottom: 0 }}>Split Order</div>
              {splitOrder && (
                <button className="btn btn-secondary btn-sm" style={{ fontSize: 11 }} onClick={() => onSplitOrder(null)}>Reset</button>
              )}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>Drag the days into the order you train them. Reflected in the Log tab.</div>
            {order.map((day, idx) => (
              <SplitDayRow key={day} day={day} index={idx} total={order.length} onMove={moveDay} />
            ))}
          </div>
        )
      })()}

      {recoveryContext?.active && (
        <div className="card" style={{ borderColor: 'var(--accent2)', background: '#1a0d00' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="card-title" style={{ marginBottom: 4, color: 'var(--accent2)' }}>
                {RECOVERY_REASONS.find(r => r.id === recoveryContext.reason)?.icon || '⚡'} Recovery Mode Active
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>
                {RECOVERY_REASONS.find(r => r.id === recoveryContext.reason)?.label || recoveryContext.reason}
                {recoveryContext.injuryDetail && <span style={{ color: 'var(--accent2)', marginLeft: 6 }}>— {recoveryContext.injuryDetail}</span>}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Since {recoveryContext.startDate}</div>
            </div>
            <button className="btn btn-secondary btn-sm" style={{ fontSize: 11 }} onClick={() => onRecoveryContext(null)}>
              Clear
            </button>
          </div>
        </div>
      )}

      {showRecoveryModal && (
        <div className="card" style={{ borderColor: 'var(--accent2)', background: '#1a0d00' }}>
          <div className="card-title" style={{ color: 'var(--accent2)' }}>What&apos;s driving this recovery phase?</div>
          <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
            {RECOVERY_REASONS.map(r => (
              <div
                key={r.id}
                onClick={() => setRcReason(r.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 6, cursor: 'pointer',
                  border: `1px solid ${rcReason === r.id ? 'var(--accent2)' : 'var(--border)'}`,
                  background: rcReason === r.id ? '#2d1a00' : 'var(--surface2)',
                }}
              >
                <span style={{ fontSize: 18 }}>{r.icon}</span>
                <span style={{ fontSize: 13, color: rcReason === r.id ? 'var(--accent2)' : 'var(--text2)', fontWeight: rcReason === r.id ? 600 : 400 }}>{r.label}</span>
              </div>
            ))}
          </div>

          {rcReason === 'injury' && (
            <div style={{ marginBottom: 16 }}>
              <div className="macro-lbl" style={{ marginBottom: 6 }}>What specifically? (used to flag exercises)</div>
              <input
                className="inp"
                placeholder="e.g. left elbow, right knee, lower back..."
                value={rcDetail}
                onChange={e => setRcDetail(e.target.value)}
              />
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
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
        <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8 }}>
          <div><strong style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)', letterSpacing: 1 }}>Goal:</strong> 80s/90s era classic physique — proportional, full muscle bellies</div>
          <div><strong style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)', letterSpacing: 1 }}>Rep Range:</strong> 8-12 compounds · 12-20 isolation · 0-1 RIR</div>
          <div><strong style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)', letterSpacing: 1 }}>Volume Target:</strong> 16-24 sets/muscle/week across both sessions</div>
          <div><strong style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)', letterSpacing: 1 }}>Frequency:</strong> 2x/week per muscle group</div>
          <div><strong style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)', letterSpacing: 1 }}>Priority:</strong> Back, Chest, Quads ★, Side Delts, Arms</div>
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            <strong style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)', letterSpacing: 1 }}>
              Split:{activeCoachSplit ? ` ${activeCoachSplit.name}` : ''}
            </strong>
            <div style={{ marginTop: 4, display: 'grid', gap: 3 }}>
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
                  <div key={`${day}-${i}`} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--text3)', width: 28, letterSpacing: 1 }}>{day}</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: label === 'Rest' ? 'var(--text3)' : 'var(--accent)' }}>{label}</span>
                    {detail && <span style={{ fontSize: 12, color: 'var(--text3)' }}>{detail}</span>}
                  </div>
                ))
              })()}
            </div>
          </div>
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3, lineHeight: 1.6 }}>
              {recoveryContext?.active && recoveryContext.injuryDetail ? `⚠ Active issue: ${recoveryContext.injuryDetail}` : 'No active injuries logged.'}
            </div>
          </div>
          <div><strong style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)', letterSpacing: 1 }}>Rest:</strong> 1.5-2 min between sets (flexible)</div>
        </div>
      </div>

      <div className="card" style={{ borderColor: switchStep ? 'var(--accent2)' : 'var(--border)' }}>
        <div className="card-title">Program Management</div>

        {!switchStep && (
          <div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.6 }}>
              Thinking about switching programs? The app will analyse your last 6 weeks of data first and give you an honest read before anything changes.
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
              <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 6, padding: '12px 14px', marginBottom: 12 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: 2, color: c.text, marginBottom: 6 }}>{c.label}</div>
                <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 6, lineHeight: 1.6 }}>{analysis.summary}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{analysis.reasoning}</div>
                <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>📅 {analysis.sessions} sessions analysed</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>📊 {Math.round((analysis.sessionsPerWeek || 0) * 10) / 10} sessions/wk avg</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>💭 {Math.round((analysis.avgFeel || 0) * 10) / 10}/5 avg feel</span>
                </div>
              </div>

              {(analysis.top3?.length ?? 0) > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: 1, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>Top Progressing Lifts</div>
                  {analysis.top3!.map((t, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 13, color: 'var(--text)' }}>{t.name}</span>
                      <span style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                        {t.weightDelta > 0 ? `+${Math.round(t.weightDelta)}lbs` : ''}{t.repDelta >= 1 ? ` +${Math.round(t.repDelta)} reps` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="btn-row" style={{ flexWrap: 'wrap' }}>
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
            <div style={{ background: '#0a0f00', border: '1px solid var(--accent)', borderRadius: 6, padding: '12px 14px', marginBottom: 12 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: 2, color: 'var(--accent)', marginBottom: 6 }}>BEFORE YOU GO</div>
              {(analysis.top3?.length ?? 0) > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>These lifts are still moving — you&apos;d be walking away from:</div>
                  {analysis.top3!.map((t, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 13, color: 'var(--text)' }}>{t.name}</span>
                      <span style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                        {t.weightDelta > 0 ? `+${Math.round(t.weightDelta)}lbs` : ''}{t.repDelta >= 1 ? ` +${Math.round(t.repDelta)} reps` : ''} over 6 weeks
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
                A deload week (60-70% loads, same structure) often breaks a mental rut without losing the program momentum you&apos;ve built.
              </div>
            </div>
            <div className="btn-row" style={{ flexWrap: 'wrap' }}>
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
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div className="loading-dots" style={{ justifyContent: 'center', marginBottom: 12 }}><span /><span /><span /></div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, letterSpacing: 2, color: 'var(--accent)', textTransform: 'uppercase' }}>Analysing your data...</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>Reviewing volume, lagging muscles, consistency, and any active injury constraints</div>
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
            <div style={{ background: '#050f00', border: '1px solid var(--accent)', borderRadius: 6, padding: '12px 14px', marginBottom: 14 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, letterSpacing: 2, color: 'var(--accent)', marginBottom: 6 }}>✦ COACH RECOMMENDATION: {coachSplit.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{coachSplit.rationale}</div>
            </div>

            {(coachSplit.days || []).map((day, di) => (
              <div key={di} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <div>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 900, color: 'var(--accent)', letterSpacing: 1, textTransform: 'uppercase', marginRight: 8 }}>{day.label}</span>
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>{day.focus}</span>
                  </div>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-display)', color: 'var(--text3)', letterSpacing: 1 }}>{day.suggestedDay}</span>
                </div>
                {day.note && <div style={{ fontSize: 11, color: 'var(--accent2)', marginBottom: 8, fontStyle: 'italic' }}>{day.note}</div>}
                <div style={{ display: 'grid', gap: 4 }}>
                  {(day.exercises || []).map((ex, ei) => (
                    <div key={ei} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, color: 'var(--text)' }}>{ex.name}</span>
                        {ex.priority && <span style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: 1, color: '#f5a742', background: '#2d1a00', padding: '1px 5px', borderRadius: 3 }}>PRIORITY</span>}
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-display)', whiteSpace: 'nowrap' }}>{ex.sets}×{ex.repRange}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 12 }}>
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
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.6 }}>
              Your current program will be archived with all its history intact. Give the new program a name to begin.
            </div>
            <input
              className="inp"
              placeholder="New program name (e.g. Upper/Lower, Full Body, PPL v2)"
              value={newProgramName}
              onChange={e => setNewProgramName(e.target.value)}
              style={{ marginBottom: 12, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: 1 }}
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
            style={{
              all: 'unset', cursor: 'pointer', width: '100%',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
            aria-expanded={showLibrary}
          >
            <div className="card-title" style={{ marginBottom: 0 }}>
              My Exercise Library
              <span style={{ marginLeft: 8, fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: 1, color: 'var(--text3)' }}>
                {customExercises.length}
              </span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-display)', letterSpacing: 1 }}>
              {showLibrary ? '▾' : '▸'}
            </span>
          </button>

          {showLibrary && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'grid', gap: 6 }}>
                {customExercises.map((ex, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>{ex.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                        {ex.muscles?.map(m => m.replace('_', ' ')).join(', ')} · {ex.repRange}
                      </div>
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: 11, color: 'var(--red)', borderColor: 'var(--red)' }}
                      onClick={() => onDeleteCustomExercise(ex.name)}
                    >Remove</button>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>
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
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{p.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{fmtDate(p.startDate)} — {fmtDate(p.endDate)} · {p.sessionCount} sessions</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
