'use client'

import { useState } from 'react'
import {
  CHECKIN_ENERGY,
  CHECKIN_MOTIVATION,
  CHECKIN_PHYSICAL,
  FEEL_LABELS,
  SPLIT,
  SPLIT_ORDER,
  SUGGESTION_COLORS,
  type ExerciseTemplate,
} from '@/lib/constants'
import {
  getExerciseRecoveryFlag,
  isLowerExercise,
  newExercise,
  newSet,
  parseRepRange,
  suggestIncrement,
  today,
  type Exercise,
  type RecoveryContext,
  type Workout,
} from '@/lib/utils'
import {
  buildAutoRegMap,
  buildProgressionMap,
  calcDeloadLevel,
  getLastSession,
  type AutoRegEntry,
  type SetTarget,
} from '@/lib/progression'
import type { CoachSplit } from '@/components/shared/CustomSplitBuilder'
import ExercisePickerModal from '@/components/shared/ExercisePickerModal'

function PairedWithLabel({ linkType, partnerName }: { linkType: 'superset' | 'compound'; partnerName: string }) {
  const color = linkType === 'superset' ? 'var(--accent2)' : '#42c8f5'
  const typeLabel = linkType === 'superset' ? 'Superset' : 'Compound Set'
  return (
    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed var(--border)', display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: 1, color }}>{typeLabel}</span>
      <span style={{ fontSize: 11, color: 'var(--text3)' }}>paired with</span>
      <span style={{ fontSize: 11, color, fontWeight: 600 }}>{partnerName}</span>
    </div>
  )
}

function MoveBtn({ disabled, onClick, label }: { disabled: boolean; onClick: () => void; label: 'up' | 'dn' }) {
  return (
    <button className="btn-move" disabled={disabled} onClick={onClick}>
      {label === 'up' ? '▲' : '▼'}
    </button>
  )
}

function LinkControl({
  ei, ex, exercises, onLink, onUnlink,
}: {
  ei: number
  ex: Exercise
  exercises: Exercise[]
  onLink: (ei: number, type: 'superset' | 'compound') => void
  onUnlink: (ei: number) => void
}) {
  if (ex.linkedTo) {
    const color = ex.linkedTo === 'superset' ? 'var(--accent2)' : '#42c8f5'
    const label = ex.linkedTo === 'superset' ? 'SS' : 'CS'
    return (
      <button className="btn-swap" style={{ color, borderColor: color, fontSize: 10 }} onClick={() => onUnlink(ei)}>
        {label} ✕
      </button>
    )
  }
  if (ei >= exercises.length - 1) return null
  return (
    <select className="inp inp-xs" style={{ fontSize: 10 }} onChange={e => e.target.value && onLink(ei, e.target.value as 'superset' | 'compound')}>
      <option value="">⇌</option>
      <option value="superset">Superset</option>
      <option value="compound">Compound</option>
    </select>
  )
}

function SetTargetRow({ target }: { target: SetTarget }) {
  const c = SUGGESTION_COLORS[target.type] || SUGGESTION_COLORS.hold
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text3)', width: 36 }}>S{target.setNum}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: c.text, minWidth: 90 }}>{target.suggestedWeight}lbs x {target.suggestedReps}</span>
      <span style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic' }}>{target.note}</span>
    </div>
  )
}

export default function LogWorkout({
  workouts,
  onSave,
  phase,
  activeCoachSplit,
  recoveryContext,
  customExercises,
  onSaveCustomExercise,
  splitOrder,
}: {
  workouts: Workout[]
  onSave: (workout: Omit<Workout, 'id'>) => Promise<boolean>
  phase: 'recovery' | 'maintenance' | 'cut' | 'build'
  activeCoachSplit: CoachSplit | null
  recoveryContext: RecoveryContext | null
  customExercises: ExerciseTemplate[]
  onSaveCustomExercise: (ex: ExerciseTemplate) => void
  splitOrder: string[] | null
}) {
  const effectiveSplit = activeCoachSplit
    ? Object.fromEntries(activeCoachSplit.days.map(d => [d.label, { ...d, exercises: d.exercises as ExerciseTemplate[] }]))
    : SPLIT
  const effectiveSplitOrder = activeCoachSplit
    ? activeCoachSplit.days.map(d => d.label)
    : (splitOrder || SPLIT_ORDER)

  const [splitDay, setSplitDay] = useState(effectiveSplitOrder[0])
  const [exercises, setExercises] = useState<Exercise[]>(() =>
    (effectiveSplit[effectiveSplitOrder[0]]?.exercises || []).map(ex => newExercise(ex as ExerciseTemplate)),
  )
  const [feel, setFeel] = useState(3)
  const [notes, setNotes] = useState('')

  const [date, setDate] = useState(today())
  const [saved, setSaved] = useState(false)
  const [pickerMode, setPickerMode] = useState<{ mode: 'swap'; index: number } | { mode: 'add' } | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [customTitle, setCustomTitle] = useState('')

  const [showCheckin, setShowCheckin] = useState(false)
  const [checkinEnergy, setCheckinEnergy] = useState(3)
  const [checkinMotivation, setCheckinMotivation] = useState(3)
  const [checkinPhysical, setCheckinPhysical] = useState(3)
  const [autoRegActive, setAutoRegActive] = useState(false)
  const [autoRegMap, setAutoRegMap] = useState<Record<string, AutoRegEntry>>({})
  const [deloadLevel, setDeloadLevel] = useState(0)

  const lastSession = splitDay !== '__blank__' ? getLastSession(workouts, splitDay) : null
  const progressionMap = lastSession ? buildProgressionMap(lastSession, phase) : {}

  const selectDay = (day: string) => {
    setSplitDay(day)
    if (day === '__blank__') {
      setExercises([])
    } else {
      setExercises(effectiveSplit[day]?.exercises ? (effectiveSplit[day].exercises as ExerciseTemplate[]).map(ex => newExercise(ex)) : [])
    }
  }

  const updateSet = (ei: number, si: number, field: string, val: string) => {
    setExercises(exs => exs.map((ex, i) => (i !== ei ? ex : {
      ...ex,
      sets: ex.sets.map((s, j) => (j !== si ? s : { ...s, [field]: val })),
    })))
  }

  const cascadeSet = (ei: number, si: number, field: string, val: string) => {
    if (!val) return
    setExercises(exs => exs.map((ex, i) => {
      if (i !== ei) return ex

      const range = parseRepRange(ex.repRange)
      const thisReps = parseFloat(ex.sets[si].reps || '')
      const thisWeight = ex.sets[si].weight || ''
      const overshoot = !isNaN(thisReps) && thisReps > range.max

      // Don't cascade weight downstream if this set's reps overshot the target —
      // let the next set's placeholder ghost-suggest a bump instead.
      if (field === 'weight' && overshoot) return ex

      let updatedSets = ex.sets.map((s, j) => {
        if (j <= si) return s
        if (!(s as Record<string, unknown>)[field]) return { ...s, [field]: val }
        return s
      })

      // After an overshoot reps blur, clear downstream weights that were auto-cascaded
      // (i.e., still match this set's weight). This frees the placeholder to show the suggested bump.
      if (field === 'reps' && overshoot && thisWeight) {
        updatedSets = updatedSets.map((s, j) => {
          if (j <= si) return s
          if (s.weight === thisWeight) return { ...s, weight: '' }
          return s
        })
      }

      return { ...ex, sets: updatedSets }
    }))
  }

  const applyAutoReg = () => {
    const level = calcDeloadLevel(checkinEnergy, checkinMotivation, checkinPhysical)
    setDeloadLevel(level)
    if (level === 0) {
      setAutoRegActive(false)
      setAutoRegMap({})
      setShowCheckin(false)
      return
    }
    const map = buildAutoRegMap(exercises, lastSession, level)
    setAutoRegMap(map)
    setAutoRegActive(true)
    setShowCheckin(false)
  }

  const acceptLighterSession = () => {
    setExercises(exs => exs.map(ex => {
      const adj = autoRegMap[ex.name]
      if (!adj || adj.skip) return ex
      return {
        ...ex,
        sets: ex.sets.map(s => ({
          ...s,
          weight: adj.adjWeight ? String(adj.adjWeight) : s.weight,
          reps: String(adj.adjReps),
        })),
      }
    }))
  }

  const dismissAutoReg = () => {
    setAutoRegActive(false)
    setAutoRegMap({})
    setDeloadLevel(0)
  }

  const removeExercise = (ei: number) => setExercises(exs => exs.filter((_, i) => i !== ei))

  const updateRepRange = (ei: number, val: string) => {
    setExercises(exs => exs.map((ex, i) => (i !== ei ? ex : { ...ex, repRange: val })))
  }

  const ghostWeightFor = (ex: Exercise, si: number): number | null => {
    if (si === 0) return null
    if (ex.sets[si].weight) return null
    const prev = ex.sets[si - 1]
    const prevReps = parseFloat(prev.reps || '')
    const prevWeight = parseFloat(prev.weight || '')
    if (isNaN(prevReps) || isNaN(prevWeight)) return null
    const range = parseRepRange(ex.repRange)
    if (prevReps <= range.max) return null
    const inc = suggestIncrement(prevWeight, isLowerExercise(ex))
    if (!inc) return null
    return prevWeight + inc
  }

  const moveExercise = (ei: number, dir: number) => {
    setExercises(exs => {
      const next = [...exs]
      const target = ei + dir
      if (target < 0 || target >= next.length) return exs
      ;[next[ei], next[target]] = [next[target], next[ei]]
      return next
    })
  }

  const linkExercise = (ei: number, linkType: 'superset' | 'compound') => {
    setExercises(exs => exs.map((ex, i) => (i !== ei ? ex : { ...ex, linkedTo: linkType })))
  }

  const unlinkExercise = (ei: number) => {
    setExercises(exs => exs.map((ex, i) => (i !== ei ? ex : { ...ex, linkedTo: null })))
  }

  const addSet = (ei: number) => {
    setExercises(exs => exs.map((ex, i) => (i !== ei ? ex : { ...ex, sets: [...ex.sets, newSet()] })))
  }

  const removeSet = (ei: number, si: number) => {
    setExercises(exs => exs.map((ex, i) => (i !== ei ? ex : { ...ex, sets: ex.sets.filter((_, j) => j !== si) })))
  }

  const cycleSetType = (ei: number, si: number) => {
    const types: ('normal' | 'drop' | 'restpause')[] = ['normal', 'drop', 'restpause']
    setExercises(exs => exs.map((ex, i) => (i !== ei ? ex : {
      ...ex,
      sets: ex.sets.map((s, j) => (j !== si ? s : {
        ...s,
        type: types[(types.indexOf(s.type || 'normal') + 1) % types.length],
        drops: s.type === 'drop' ? [] : s.drops,
        pauseReps: s.type === 'restpause' ? '' : s.pauseReps,
      })),
    })))
  }

  const addDrop = (ei: number, si: number) => {
    setExercises(exs => exs.map((ex, i) => (i !== ei ? ex : {
      ...ex,
      sets: ex.sets.map((s, j) => (j !== si ? s : { ...s, drops: [...(s.drops || []), { weight: '', reps: '' }] })),
    })))
  }

  const updateDrop = (ei: number, si: number, di: number, field: string, val: string) => {
    setExercises(exs => exs.map((ex, i) => (i !== ei ? ex : {
      ...ex,
      sets: ex.sets.map((s, j) => (j !== si ? s : {
        ...s,
        drops: (s.drops || []).map((d, k) => (k !== di ? d : { ...d, [field]: val })),
      })),
    })))
  }

  const removeDrop = (ei: number, si: number, di: number) => {
    setExercises(exs => exs.map((ex, i) => (i !== ei ? ex : {
      ...ex,
      sets: ex.sets.map((s, j) => (j !== si ? s : { ...s, drops: (s.drops || []).filter((_, k) => k !== di) })),
    })))
  }

  const handlePickerSelect = (selectedEx: ExerciseTemplate) => {
    if (!pickerMode) return
    if (pickerMode.mode === 'swap') {
      setExercises(exs => exs.map((ex, i) => (i !== pickerMode.index ? ex : {
        ...newExercise(selectedEx),
        swappedFrom: ex.name,
      })))
    } else {
      setExercises(exs => [...exs, newExercise(selectedEx)])
    }
    setPickerMode(null)
  }

  const handleSave = async () => {
    setSaveStatus('saving')
    const workout: Omit<Workout, 'id'> = {
      date,
      splitDay: splitDay === '__blank__' ? (customTitle.trim() || 'Custom Session') : splitDay,
      exercises: exercises
        .map(ex => ({ ...ex, sets: ex.sets.filter(s => s.reps) }))
        .filter(ex => ex.sets.length > 0),
      feel,
      notes,
    }
    const ok = await onSave(workout)
    if (ok) {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 3000)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      setNotes('')
    } else {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 4000)
    }
  }

  const isRest = splitDay === 'Rest'

  return (
    <div className="page">
      {recoveryContext && recoveryContext.active && recoveryContext.injuryDetail && (
        <div className="alert">⚠ Active recovery: {recoveryContext.injuryDetail}. Flagged exercises are marked below.</div>
      )}

      <div className="card">
        <div className="card-title">Split Day</div>
        {activeCoachSplit && (
          <div style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: 1, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>✦ COACH PROGRAM ACTIVE:</span>
            <span style={{ color: 'var(--text2)' }}>{activeCoachSplit.name}</span>
          </div>
        )}
        <div className="split-day-btns">
          {effectiveSplitOrder.map(d => (
            <button key={d} className={`split-btn ${splitDay === d ? 'active' : ''}`} onClick={() => selectDay(d)}>{d}</button>
          ))}
          <button
            className={`split-btn ${splitDay === '__blank__' ? 'active' : ''}`}
            style={{ borderStyle: 'dashed', color: splitDay === '__blank__' ? '#000' : 'var(--text3)' }}
            onClick={() => selectDay('__blank__')}
          >+ Blank Session</button>
        </div>
        {splitDay === '__blank__' && (
          <div style={{ marginBottom: 12 }}>
            <input
              className="inp"
              placeholder="Session title (e.g. Full Body, Back, etc.)"
              value={customTitle}
              onChange={e => setCustomTitle(e.target.value)}
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}
            />
          </div>
        )}
        {splitDay !== '__blank__' && effectiveSplit[splitDay] && effectiveSplit[splitDay].note && (
          <div style={{ fontSize: 12, color: 'var(--accent2)', marginBottom: 12, padding: '6px 10px', background: 'var(--surface3)', borderRadius: 4, borderLeft: '2px solid var(--accent2)' }}>
            {effectiveSplit[splitDay].note}
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div className="macro-lbl" style={{ marginBottom: 4 }}>Date</div>
            <input type="date" className="inp" style={{ width: 150 }} value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <div className="macro-lbl" style={{ marginBottom: 4 }}>Session Feel</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setFeel(n)} style={{
                  width: 36, height: 36, borderRadius: 4, border: '1px solid',
                  borderColor: feel === n ? 'var(--accent)' : 'var(--border)',
                  background: feel === n ? 'var(--accent)' : 'var(--surface2)',
                  color: feel === n ? '#000' : 'var(--text2)',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
                  cursor: 'pointer',
                }}>{n}</button>
              ))}
              <span style={{ fontSize: 12, color: 'var(--text3)', alignSelf: 'center', marginLeft: 4 }}>{FEEL_LABELS[feel]}</span>
            </div>
          </div>
        </div>
        {!isRest && splitDay !== '__blank__' && (
          <div style={{ marginTop: 12 }}>
            {!showCheckin && !autoRegActive && (
              <button
                className="btn btn-secondary btn-sm"
                style={{ borderStyle: 'dashed', color: 'var(--accent2)', borderColor: 'var(--accent2)' }}
                onClick={() => setShowCheckin(true)}
              >⚡ How am I feeling today?</button>
            )}
            {autoRegActive && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: 1, color: 'var(--accent2)', textTransform: 'uppercase' }}>
                  {['', 'Minor deload', 'Moderate deload', 'Significant deload'][deloadLevel]} active
                </span>
                <button className="btn btn-secondary btn-sm" style={{ fontSize: 11 }} onClick={dismissAutoReg}>✕ Clear</button>
              </div>
            )}
          </div>
        )}
      </div>

      {showCheckin && (
        <div className="card" style={{ borderColor: 'var(--accent2)', background: '#1a1000' }}>
          <div className="card-title" style={{ color: 'var(--accent2)' }}>Pre-Session Check-In</div>
          <div style={{ display: 'grid', gap: 14 }}>
            {[
              { label: 'Energy', vals: CHECKIN_ENERGY, val: checkinEnergy, set: setCheckinEnergy },
              { label: 'Motivation', vals: CHECKIN_MOTIVATION, val: checkinMotivation, set: setCheckinMotivation },
              { label: 'Physical', vals: CHECKIN_PHYSICAL, val: checkinPhysical, set: setCheckinPhysical },
            ].map(({ label, vals, val, set }) => (
              <div key={label}>
                <div style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: 1, color: 'var(--text2)', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {vals.map((v, i) => (
                    <button key={i} onClick={() => set(i + 1)} style={{
                      padding: '5px 12px', borderRadius: 4, border: '1px solid',
                      borderColor: val === i + 1 ? 'var(--accent2)' : 'var(--border)',
                      background: val === i + 1 ? '#3d2200' : 'var(--surface2)',
                      color: val === i + 1 ? 'var(--accent2)' : 'var(--text3)',
                      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                      letterSpacing: 1,
                    }}>{v}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="btn-row" style={{ marginTop: 16 }}>
            <button className="btn btn-primary btn-sm" onClick={applyAutoReg}>Analyse Session</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowCheckin(false)}>Cancel</button>
          </div>
        </div>
      )}

      {autoRegActive && deloadLevel > 0 && !isRest && (
        <div className="card" style={{ borderColor: 'var(--accent2)', background: '#120d00' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div className="card-title" style={{ marginBottom: 2, color: 'var(--accent2)' }}>
                {['', '↓ Minor Deload', '↓↓ Moderate Deload', '↓↓↓ Significant Deload'][deloadLevel]}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                Energy: {CHECKIN_ENERGY[checkinEnergy - 1]} · Motivation: {CHECKIN_MOTIVATION[checkinMotivation - 1]} · Physical: {CHECKIN_PHYSICAL[checkinPhysical - 1]}
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" style={{ borderColor: 'var(--accent2)', color: 'var(--accent2)' }} onClick={acceptLighterSession}>
              Apply lighter session
            </button>
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            {Object.entries(autoRegMap).map(([name, adj]) => (
              <div key={name} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: adj.skip ? '#1a0000' : '#1a1000',
                border: `1px solid ${adj.skip ? 'var(--red)' : 'var(--accent2)'}`,
                borderRadius: 5, padding: '7px 10px', gap: 8, flexWrap: 'wrap',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {adj.skip
                    ? <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: 1, color: 'var(--red)' }}>SKIP?</span>
                    : <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: 1, color: 'var(--accent2)' }}>ADJUST</span>}
                  <span style={{ fontSize: 12, color: 'var(--text2)' }}>{name}</span>
                </div>
                <span style={{ fontSize: 12, color: adj.skip ? 'var(--red)' : 'var(--accent2)', textAlign: 'right' }}>{adj.note}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 10, fontStyle: 'italic' }}>
            Smart session today beats grinding through a bad one. Get something in the bank.
          </div>
        </div>
      )}

      {splitDay !== '__blank__' && isRest && (
        <div className="card" style={{ textAlign: 'center', padding: 30 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 2 }}>Rest Day</div>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 8 }}>Recovery is training. Log it.</div>
        </div>
      )}

      {(splitDay === '__blank__' || !isRest) && exercises.map((ex, ei) => (
        <div key={ei} className={(() => {
          const prev = ei > 0 ? exercises[ei - 1] : null
          const isTarget = prev && prev.linkedTo
          if (ex.linkedTo === 'superset') return 'card linked-ss'
          if (ex.linkedTo === 'compound') return 'card linked-cs'
          if (isTarget && prev!.linkedTo === 'superset') return 'card linked-ss-target'
          if (isTarget && prev!.linkedTo === 'compound') return 'card linked-cs-target'
          return 'card'
        })()} style={autoRegActive && autoRegMap[ex.name] && autoRegMap[ex.name].skip ? { opacity: 0.6, borderColor: 'var(--red)' } : {}}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{ex.name}</span>
                {ex.priority && <span className="ex-tag priority">Priority</span>}
                {(() => {
                  const flag = getExerciseRecoveryFlag(ex.name, recoveryContext)
                  if (flag && flag.type === 'caution') return <span className="ex-tag modified">{flag.label}</span>
                  return null
                })()}
                {ex.swappedFrom && <span className="ex-tag" style={{ background: '#1a1a2d', color: '#8888ff' }}>Swapped</span>}
                {ex.linkedTo === 'superset' && <span className="ex-tag" style={{ background: '#0a1a00', color: 'var(--accent2)', border: '1px solid var(--accent2)' }}>SS</span>}
                {ex.linkedTo === 'compound' && <span className="ex-tag" style={{ background: '#001020', color: '#42c8f5', border: '1px solid #42c8f5' }}>CS</span>}
                {autoRegActive && autoRegMap[ex.name] && autoRegMap[ex.name].skip && (
                  <span className="ex-tag" style={{ background: '#2d0000', color: 'var(--red)' }}>⚑ Skip?</span>
                )}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                <input
                  className="inp inp-xs"
                  style={{ fontSize: 11, padding: '1px 4px', height: 'auto', width: 60 }}
                  value={ex.repRange || ''}
                  placeholder="8-12"
                  onChange={e => updateRepRange(ei, e.target.value)}
                  aria-label="Rep range"
                />
                <span>reps · {ex.note || '0-1 RIR'}</span>
                {ex.swappedFrom && <span style={{ fontStyle: 'italic' }}>· was: {ex.swappedFrom}</span>}
              </div>
              {(() => {
                const prog = progressionMap[ex.name]
                if (!prog || !prog.summary) return null
                const c = SUGGESTION_COLORS[prog.summary.type] || SUGGESTION_COLORS.hold
                return (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 5, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 4, padding: '3px 8px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: 1, color: c.text }}>{c.label}</span>
                    <span style={{ fontSize: 11, color: c.text }}>{prog.summary.message}</span>
                  </div>
                )
              })()}
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <MoveBtn disabled={ei === 0} onClick={() => moveExercise(ei, -1)} label="up" />
                <MoveBtn disabled={ei === exercises.length - 1} onClick={() => moveExercise(ei, 1)} label="dn" />
              </div>
              <LinkControl ei={ei} ex={ex} exercises={exercises} onLink={linkExercise} onUnlink={unlinkExercise} />
              <button className="btn-swap" onClick={() => setPickerMode({ mode: 'swap', index: ei })}>⇄ Swap</button>
              <button className="btn-swap" style={{ color: 'var(--red)', borderColor: 'var(--border)' }} onClick={() => removeExercise(ei)}>✕ Remove</button>
            </div>
          </div>

          {(() => {
            const prog = progressionMap[ex.name]
            if (!prog || !prog.setTargets || !prog.setTargets.length) return null
            return (
              <div style={{ background: 'var(--surface2)', borderRadius: 5, padding: '8px 10px', marginBottom: 8, display: 'grid', gap: 3 }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: 1, color: 'var(--text3)', marginBottom: 4 }}>SET TARGETS</div>
                {prog.setTargets.map((t, ti) => (
                  <SetTargetRow key={ti} target={t} />
                ))}
              </div>
            )
          })()}

          <div style={{ display: 'grid', gap: 6, marginBottom: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 52px 60px 28px', gap: 4, paddingBottom: 2, borderBottom: '1px solid var(--border)' }}>
              {['#', 'Weight', 'Reps', 'RIR', 'Type', ''].map((h, i) => (
                <span key={i} style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: 1, textAlign: i > 0 ? 'center' : 'left' }}>{h}</span>
              ))}
            </div>

            {ex.sets.map((s, si) => (
              <div key={si}>
                <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 52px 60px 28px', gap: 4, alignItems: 'center' }}>
                  <span className="set-num" style={{ textAlign: 'center' }}>{si + 1}</span>
                  {(() => {
                    const ghost = ghostWeightFor(ex, si)
                    return (
                      <input
                        className="inp inp-sm"
                        placeholder={ghost !== null ? `↑ ${ghost}` : '—'}
                        value={s.weight || ''}
                        onChange={e => updateSet(ei, si, 'weight', e.target.value)}
                        onBlur={e => cascadeSet(ei, si, 'weight', e.target.value)}
                        onFocus={() => {
                          if (ghost !== null && !s.weight) {
                            updateSet(ei, si, 'weight', String(ghost))
                          }
                        }}
                        style={ghost !== null ? { borderColor: 'var(--accent)' } : undefined}
                      />
                    )
                  })()}
                  <input className="inp inp-sm" placeholder="—" value={s.reps || ''}
                    onChange={e => updateSet(ei, si, 'reps', e.target.value)}
                    onBlur={e => cascadeSet(ei, si, 'reps', e.target.value)} />
                  <select className="inp inp-xs" value={s.rir || ''} onChange={e => updateSet(ei, si, 'rir', e.target.value)}>
                    {['0', '1', '2', '3', '4+'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <span
                    className={`set-type-badge set-type-${s.type || 'normal'}`}
                    onClick={() => cycleSetType(ei, si)}
                    title="Tap to cycle: Normal → Drop Set → Rest-Pause"
                  >
                    {s.type === 'drop' ? 'DROP' : s.type === 'restpause' ? 'R-P' : 'NRM'}
                  </span>
                  <button className="btn-rm" onClick={() => removeSet(ei, si)}>×</button>
                </div>

                {s.type === 'restpause' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, paddingLeft: 32, paddingRight: 28 }}>
                    <span style={{ fontSize: 11, color: '#a78bfa', fontFamily: 'var(--font-display)', fontWeight: 700, whiteSpace: 'nowrap' }}>+ PAUSE</span>
                    <input
                      className="inp inp-sm"
                      placeholder="reps after pause"
                      value={s.pauseReps || ''}
                      onChange={e => updateSet(ei, si, 'pauseReps', e.target.value)}
                      style={{ borderColor: '#a78bfa44' }}
                    />
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>reps</span>
                  </div>
                )}

                {s.type === 'drop' && (
                  <div style={{ paddingLeft: 32, paddingRight: 28, marginTop: 4, display: 'grid', gap: 4 }}>
                    {(s.drops || []).map((d, di) => (
                      <div key={di} className="drop-segment">
                        <span style={{ fontSize: 10, color: '#f59e0b', fontFamily: 'var(--font-display)', fontWeight: 700, minWidth: 36 }}>DROP {di + 1}</span>
                        <input className="inp inp-sm" placeholder="lbs" value={d.weight}
                          onChange={e => updateDrop(ei, si, di, 'weight', e.target.value)}
                          style={{ width: 70, borderColor: '#f59e0b44' }} />
                        <span style={{ fontSize: 11, color: 'var(--text3)' }}>×</span>
                        <input className="inp inp-sm" placeholder="reps" value={d.reps}
                          onChange={e => updateDrop(ei, si, di, 'reps', e.target.value)}
                          style={{ width: 60, borderColor: '#f59e0b44' }} />
                        <button className="btn-rm" style={{ marginLeft: 'auto' }} onClick={() => removeDrop(ei, si, di)}>×</button>
                      </div>
                    ))}
                    {(s.drops || []).length < 3 && (
                      <button
                        onClick={() => addDrop(ei, si)}
                        style={{ fontSize: 11, color: '#f59e0b', background: 'none', border: '1px dashed #f59e0b44', borderRadius: 4, padding: '3px 8px', cursor: 'pointer', textAlign: 'left' }}>
                        + Add drop
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <button className="btn-add-set" onClick={() => addSet(ei)}>+ Set</button>
          {ex.linkedTo && ei < exercises.length - 1 && (
            <PairedWithLabel linkType={ex.linkedTo} partnerName={exercises[ei + 1].name} />
          )}
        </div>
      ))}

      {(splitDay === '__blank__' || !isRest) && (
        <div style={{ marginBottom: 12 }}>
          <button
            className="btn btn-secondary"
            style={{ width: '100%', borderStyle: 'dashed', color: 'var(--accent)', borderColor: 'var(--accent)' }}
            onClick={() => setPickerMode({ mode: 'add' })}
          >
            + Add Exercise
          </button>
        </div>
      )}

      <div className="card">
        <div className="card-title">Session Notes</div>
        <textarea className="inp" placeholder="How'd it feel? Anything nagging? Pumps? Energy?" value={notes} onChange={e => setNotes(e.target.value)} />
      </div>

      <div className="btn-row">
        <button className="btn btn-primary" onClick={handleSave} disabled={saveStatus === 'saving'}>
          {saveStatus === 'saving' ? 'Saving...' : saved ? '✓ Saved' : 'Save Session'}
        </button>
        {saveStatus === 'saved' && (
          <span style={{ fontSize: 12, color: 'var(--accent)', alignSelf: 'center', fontFamily: 'var(--font-display)', letterSpacing: 1 }}>✓ Persisted</span>
        )}
        {saveStatus === 'error' && (
          <span style={{ fontSize: 12, color: 'var(--red)', alignSelf: 'center', fontFamily: 'var(--font-display)', letterSpacing: 1 }}>⚠ Save failed</span>
        )}
      </div>

      {pickerMode !== null && (
        <ExercisePickerModal
          exercise={pickerMode.mode === 'swap' ? exercises[pickerMode.index] : null}
          mode={pickerMode.mode}
          onSelect={handlePickerSelect}
          onClose={() => setPickerMode(null)}
          customExercises={customExercises}
          onSaveCustomExercise={onSaveCustomExercise}
        />
      )}
    </div>
  )
}
