'use client'

import { useState } from 'react'
import { EXERCISE_LIBRARY, type ExerciseTemplate } from '@/lib/constants'

interface BuilderExercise {
  name: string
  repRange: string
  muscles: string[]
}

interface BuilderDay {
  name: string
  exercises: BuilderExercise[]
}

export interface CoachSplit {
  name: string
  source?: string
  rationale?: string
  days: {
    label: string
    suggestedDay?: string
    focus?: string
    note?: string
    exercises: { name: string; muscles?: string[]; repRange: string; sets?: number; priority?: boolean; note?: string }[]
  }[]
}

function BuilderExerciseRow({
  ex,
  idx,
  onRemove,
  onUpdate,
}: {
  ex: BuilderExercise
  idx: number
  onRemove: (idx: number) => void
  onUpdate: (idx: number, field: keyof BuilderExercise, val: string) => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>{ex.name}</div>
        <input
          className="inp" style={{ marginTop: 4, fontSize: 11, padding: '3px 6px' }}
          placeholder="Rep range e.g. 8-12"
          value={ex.repRange || ''}
          onChange={e => onUpdate(idx, 'repRange', e.target.value)}
        />
      </div>
      <button className="btn-rm" onClick={() => onRemove(idx)}>x</button>
    </div>
  )
}

function BuilderExercisePicker({
  onSelect,
  onClose,
}: {
  onSelect: (ex: ExerciseTemplate | { name: string; muscles: string[]; repRange: string; custom: true }) => void
  onClose: () => void
}) {
  const [search, setSearch] = useState('')
  const q = search.trim().toLowerCase()
  const filtered = q
    ? EXERCISE_LIBRARY.filter(e => e.name.toLowerCase().includes(q) || e.muscles.some(m => m.toLowerCase().includes(q)))
    : EXERCISE_LIBRARY.slice(0, 20)
  const isNew = q && !EXERCISE_LIBRARY.some(e => e.name.toLowerCase() === q)

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <input className="inp" style={{ flex: 1 }} placeholder="Search or type new..." value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
      </div>
      {isNew && (
        <div
          style={{ padding: '7px 10px', borderRadius: 5, background: '#050f00', border: '1px solid var(--accent)', marginBottom: 6, cursor: 'pointer' }}
          onClick={() => onSelect({ name: search.trim(), muscles: ['chest'], repRange: '10-12', custom: true })}
        >
          <span style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent)', letterSpacing: 1 }}>+ ADD: </span>
          <span style={{ fontSize: 13, color: 'var(--text)' }}>{search.trim()}</span>
        </div>
      )}
      <div style={{ maxHeight: 200, overflowY: 'auto', display: 'grid', gap: 2 }}>
        {filtered.map((ex, i) => (
          <div key={i} onClick={() => onSelect(ex)} style={{ padding: '6px 8px', borderRadius: 4, cursor: 'pointer', background: 'var(--surface)', fontSize: 13 }}>
            <span style={{ fontWeight: 600, color: 'var(--text)' }}>{ex.name}</span>
            <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 6 }}>{ex.muscles.join(', ')} · {ex.repRange}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BuilderDayCard({
  day,
  dayIdx,
  totalDays,
  onNameChange,
  onAddExercise,
  onRemoveExercise,
  onUpdateExercise,
  onRemoveDay,
  onMove,
}: {
  day: BuilderDay
  dayIdx: number
  totalDays: number
  onNameChange: (idx: number, val: string) => void
  onAddExercise: (idx: number, ex: ExerciseTemplate | { name: string; muscles: string[]; repRange: string; custom?: boolean }) => void
  onRemoveExercise: (idx: number, exIdx: number) => void
  onUpdateExercise: (idx: number, exIdx: number, field: keyof BuilderExercise, val: string) => void
  onRemoveDay: (idx: number) => void
  onMove: (idx: number, dir: number) => void
}) {
  const [showPicker, setShowPicker] = useState(false)
  const isRest = day.name === 'Rest'

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 12, background: 'var(--surface)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <input
          className="inp" style={{ flex: 1, fontWeight: 600 }}
          placeholder="Day name e.g. Back & Rear Delts"
          value={day.name}
          onChange={e => onNameChange(dayIdx, e.target.value)}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button className="btn-move" disabled={dayIdx === 0} onClick={() => onMove(dayIdx, -1)}>▲</button>
          <button className="btn-move" disabled={dayIdx === totalDays - 1} onClick={() => onMove(dayIdx, 1)}>▼</button>
        </div>
        <button className="btn-rm" onClick={() => onRemoveDay(dayIdx)}>x</button>
      </div>

      {!isRest && (
        <div style={{ marginBottom: 8 }}>
          {day.exercises.map((ex, ei) => (
            <BuilderExerciseRow
              key={ei} ex={ex} idx={ei}
              onRemove={idx => onRemoveExercise(dayIdx, idx)}
              onUpdate={(idx, field, val) => onUpdateExercise(dayIdx, idx, field, val)}
            />
          ))}
        </div>
      )}

      {!isRest && !showPicker && (
        <button className="btn btn-secondary btn-sm" style={{ fontSize: 11, marginTop: 4 }} onClick={() => setShowPicker(true)}>+ Add Exercise</button>
      )}

      {!isRest && showPicker && (
        <div style={{ marginTop: 8, background: 'var(--surface2)', borderRadius: 5, padding: 10 }}>
          <BuilderExercisePicker
            onSelect={ex => { onAddExercise(dayIdx, ex); setShowPicker(false) }}
            onClose={() => setShowPicker(false)}
          />
        </div>
      )}
    </div>
  )
}

export default function CustomSplitBuilder({
  days,
  name,
  onNameChange,
  onDaysChange,
  onSave,
  onCancel,
}: {
  days: BuilderDay[]
  name: string
  onNameChange: (val: string) => void
  onDaysChange: (days: BuilderDay[]) => void
  customExercises?: ExerciseTemplate[]
  onSave: (split: CoachSplit) => void
  onCancel: () => void
}) {
  const addDay = () => onDaysChange([...days, { name: '', exercises: [] }])
  const addRestDay = () => onDaysChange([...days, { name: 'Rest', exercises: [] }])
  const removeDay = (idx: number) => onDaysChange(days.filter((_, i) => i !== idx))

  const moveDay = (idx: number, dir: number) => {
    const next = [...days]
    const target = idx + dir
    if (target < 0 || target >= next.length) return
    ;[next[idx], next[target]] = [next[target], next[idx]]
    onDaysChange(next)
  }

  const updateDayName = (idx: number, val: string) => {
    onDaysChange(days.map((d, i) => (i !== idx ? d : { ...d, name: val })))
  }

  const addExercise = (
    dayIdx: number,
    ex: ExerciseTemplate | { name: string; muscles: string[]; repRange: string; custom?: boolean },
  ) => {
    onDaysChange(days.map((d, i) => (i !== dayIdx ? d : {
      ...d,
      exercises: [...d.exercises, { name: ex.name, repRange: ex.repRange || '10-12', muscles: ex.muscles || [] }],
    })))
  }

  const removeExercise = (dayIdx: number, exIdx: number) => {
    onDaysChange(days.map((d, i) => (i !== dayIdx ? d : { ...d, exercises: d.exercises.filter((_, j) => j !== exIdx) })))
  }

  const updateExercise = (dayIdx: number, exIdx: number, field: keyof BuilderExercise, val: string) => {
    onDaysChange(days.map((d, i) => (i !== dayIdx ? d : {
      ...d,
      exercises: d.exercises.map((e, j) => (j !== exIdx ? e : { ...e, [field]: val })),
    })))
  }

  const canSave = !!name.trim() && days.length > 0 && days.some(d => d.name.trim() && d.name !== 'Rest')

  const handleSave = () => {
    const split: CoachSplit = {
      name: name.trim(),
      source: 'custom',
      days: days.filter(d => d.name.trim()).map(d => ({
        label: d.name.trim(),
        note: d.name === 'Rest' ? 'Rest day' : '',
        exercises: d.exercises.map(e => ({
          name: e.name,
          repRange: e.repRange || '10-12',
          muscles: e.muscles || [],
          sets: 3,
          priority: false,
        })),
      })),
    }
    onSave(split)
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>
        Define your split day by day. Each day gets a name and a list of exercises. Add a Rest day wherever it falls in your rotation.
      </div>

      <div>
        <div className="macro-lbl" style={{ marginBottom: 6 }}>Program Name</div>
        <input className="inp" placeholder="e.g. Modified PPL — 4 Day Rotation" value={name} onChange={e => onNameChange(e.target.value)} />
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        {days.map((day, idx) => (
          <BuilderDayCard
            key={idx}
            day={day} dayIdx={idx} totalDays={days.length}
            onNameChange={updateDayName}
            onAddExercise={addExercise}
            onRemoveExercise={removeExercise}
            onUpdateExercise={updateExercise}
            onRemoveDay={removeDay}
            onMove={moveDay}
          />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn btn-secondary btn-sm" onClick={addDay}>+ Training Day</button>
        <button className="btn btn-secondary btn-sm" onClick={addRestDay} style={{ color: 'var(--text3)' }}>+ Rest Day</button>
      </div>

      <div className="btn-row">
        <button className="btn btn-primary" disabled={!canSave} onClick={handleSave}>Save Program</button>
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
