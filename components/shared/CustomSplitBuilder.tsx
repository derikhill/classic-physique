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
    <div className="flex items-center gap-1.5 border-b py-[5px]" style={{ borderColor: 'var(--border)' }}>
      <div className="flex-1">
        <div className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>{ex.name}</div>
        <input
          className="inp mt-1 px-1.5 py-[3px] text-[11px]"
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
      <div className="mb-2 flex gap-1.5">
        <input className="inp flex-1" placeholder="Search or type new..." value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
      </div>
      {isNew && (
        <div
          className="mb-1.5 cursor-pointer rounded-[5px] border px-2.5 py-[7px]"
          style={{ background: '#050f00', borderColor: 'var(--accent)' }}
          onClick={() => onSelect({ name: search.trim(), muscles: ['chest'], repRange: '10-12', custom: true })}
        >
          <span className="text-[10px] font-bold tracking-[1px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>+ ADD: </span>
          <span className="text-[13px]" style={{ color: 'var(--text)' }}>{search.trim()}</span>
        </div>
      )}
      <div className="grid max-h-[200px] gap-0.5 overflow-y-auto">
        {filtered.map((ex, i) => (
          <div
            key={i}
            onClick={() => onSelect(ex)}
            className="cursor-pointer rounded px-2 py-1.5 text-[13px]"
            style={{ background: 'var(--surface)' }}
          >
            <span className="font-semibold" style={{ color: 'var(--text)' }}>{ex.name}</span>
            <span className="ml-1.5 text-[11px]" style={{ color: 'var(--text3)' }}>{ex.muscles.join(', ')} · {ex.repRange}</span>
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
    <div className="rounded-md border p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="mb-2.5 flex items-center gap-2">
        <input
          className="inp flex-1 font-semibold"
          placeholder="Day name e.g. Back & Rear Delts"
          value={day.name}
          onChange={e => onNameChange(dayIdx, e.target.value)}
        />
        <div className="flex flex-col gap-0.5">
          <button className="btn-move" disabled={dayIdx === 0} onClick={() => onMove(dayIdx, -1)}>▲</button>
          <button className="btn-move" disabled={dayIdx === totalDays - 1} onClick={() => onMove(dayIdx, 1)}>▼</button>
        </div>
        <button className="btn-rm" onClick={() => onRemoveDay(dayIdx)}>x</button>
      </div>

      {!isRest && (
        <div className="mb-2">
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
        <button className="btn btn-secondary btn-sm mt-1 text-[11px]" onClick={() => setShowPicker(true)}>+ Add Exercise</button>
      )}

      {!isRest && showPicker && (
        <div className="mt-2 rounded-[5px] p-2.5" style={{ background: 'var(--surface2)' }}>
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
    <div className="grid gap-3">
      <div className="text-xs leading-[1.6]" style={{ color: 'var(--text3)' }}>
        Define your split day by day. Each day gets a name and a list of exercises. Add a Rest day wherever it falls in your rotation.
      </div>

      <div>
        <div className="macro-lbl mb-1.5">Program Name</div>
        <input className="inp" placeholder="e.g. Modified PPL — 4 Day Rotation" value={name} onChange={e => onNameChange(e.target.value)} />
      </div>

      <div className="grid gap-2">
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

      <div className="flex flex-wrap gap-2">
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
