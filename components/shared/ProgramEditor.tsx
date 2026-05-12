'use client'

import { useState } from 'react'
import type { ExerciseTemplate, MuscleKey } from '@/lib/constants'
import type { CoachSplit } from './CustomSplitBuilder'
import ExercisePickerModal from './ExercisePickerModal'

type CoachSplitExercise = CoachSplit['days'][number]['exercises'][number]

export default function ProgramEditor({
  split,
  onChange,
  customExercises,
  onSaveCustomExercise,
}: {
  split: CoachSplit
  onChange: (split: CoachSplit) => void
  customExercises: ExerciseTemplate[]
  onSaveCustomExercise: (ex: ExerciseTemplate) => void
}) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [picker, setPicker] = useState<{ dayIdx: number } | null>(null)

  const toggleDay = (idx: number) =>
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })

  const updateDay = (dayIdx: number, mutator: (day: CoachSplit['days'][number]) => CoachSplit['days'][number]) => {
    onChange({
      ...split,
      days: split.days.map((d, i) => (i !== dayIdx ? d : mutator(d))),
    })
  }

  const moveExercise = (dayIdx: number, exIdx: number, dir: -1 | 1) => {
    updateDay(dayIdx, d => {
      const exs = [...(d.exercises || [])]
      const target = exIdx + dir
      if (target < 0 || target >= exs.length) return d
      ;[exs[exIdx], exs[target]] = [exs[target], exs[exIdx]]
      return { ...d, exercises: exs }
    })
  }

  const removeExercise = (dayIdx: number, exIdx: number) => {
    updateDay(dayIdx, d => ({ ...d, exercises: (d.exercises || []).filter((_, i) => i !== exIdx) }))
  }

  const updateRepRange = (dayIdx: number, exIdx: number, val: string) => {
    updateDay(dayIdx, d => ({
      ...d,
      exercises: (d.exercises || []).map((ex, i) => (i !== exIdx ? ex : { ...ex, repRange: val })),
    }))
  }

  const addExercise = (dayIdx: number, ex: ExerciseTemplate) => {
    const newEx: CoachSplitExercise = {
      name: ex.name,
      muscles: ex.muscles as MuscleKey[],
      repRange: ex.repRange,
      sets: 3,
      priority: ex.priority || false,
      note: ex.note,
    }
    updateDay(dayIdx, d => ({ ...d, exercises: [...(d.exercises || []), newEx] }))
    setPicker(null)
  }

  return (
    <div>
      <div className="mb-3 text-[13px]" style={{ color: 'var(--text2)' }}>
        <span className="font-bold tracking-[1px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>
          {split.name}
        </span>
        <span className="ml-2" style={{ color: 'var(--text3)' }}>
          · {split.days.length} day{split.days.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="grid gap-2">
        {split.days.map((day, dayIdx) => {
          const isOpen = expanded.has(dayIdx)
          const isRest = day.label === 'Rest' || (day.exercises || []).length === 0
          return (
            <div
              key={dayIdx}
              className="rounded-md border"
              style={{ background: 'var(--surface2)', borderColor: isOpen ? 'var(--accent)' : 'var(--border)' }}
            >
              <button
                onClick={() => !isRest && toggleDay(dayIdx)}
                aria-expanded={isOpen}
                disabled={isRest}
                className={`flex w-full items-center justify-between border-0 bg-transparent px-3 py-2.5 text-inherit ${isRest ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-[15px] font-black uppercase tracking-[1px]"
                    style={{ fontFamily: 'var(--font-display)', color: isRest ? 'var(--text3)' : 'var(--accent)' }}
                  >{day.label}</span>
                  {day.focus && (
                    <span className="text-[11px]" style={{ color: 'var(--text3)' }}>{day.focus}</span>
                  )}
                  {!isRest && (
                    <span className="text-[11px]" style={{ color: 'var(--text3)' }}>
                      · {(day.exercises || []).length} exercise{(day.exercises || []).length === 1 ? '' : 's'}
                    </span>
                  )}
                </div>
                {!isRest && (
                  <span className="text-xs tracking-[1px]" style={{ color: 'var(--text3)', fontFamily: 'var(--font-display)' }}>
                    {isOpen ? '▾' : '▸'}
                  </span>
                )}
              </button>

              {isOpen && !isRest && (
                <div className="border-t px-3 pb-3 pt-2.5" style={{ borderColor: 'var(--border)' }}>
                  {day.note && (
                    <div className="mb-2 text-[11px] italic" style={{ color: 'var(--accent2)' }}>{day.note}</div>
                  )}
                  <div className="grid gap-1.5">
                    {(day.exercises || []).map((ex, exIdx) => (
                      <div
                        key={exIdx}
                        className="flex items-center gap-2 rounded border px-2 py-1.5"
                        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                      >
                        <div className="flex flex-col gap-0.5">
                          <button
                            className="btn-move"
                            disabled={exIdx === 0}
                            onClick={() => moveExercise(dayIdx, exIdx, -1)}
                          >▲</button>
                          <button
                            className="btn-move"
                            disabled={exIdx === (day.exercises || []).length - 1}
                            onClick={() => moveExercise(dayIdx, exIdx, 1)}
                          >▼</button>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>{ex.name}</span>
                            {ex.priority && <span className="ex-tag priority">Priority</span>}
                          </div>
                          {(ex.muscles?.length ?? 0) > 0 && (
                            <div className="mt-0.5 text-[11px]" style={{ color: 'var(--text3)' }}>
                              {(ex.muscles || []).map(m => m.replace('_', ' ')).join(', ')}
                            </div>
                          )}
                        </div>
                        <input
                          className="inp inp-sm"
                          value={ex.repRange || ''}
                          placeholder="8-12"
                          onChange={e => updateRepRange(dayIdx, exIdx, e.target.value)}
                          aria-label="Rep range"
                        />
                        <button
                          className="btn-rm"
                          onClick={() => removeExercise(dayIdx, exIdx)}
                          title="Remove exercise"
                        >×</button>
                      </div>
                    ))}
                  </div>
                  <button
                    className="btn btn-secondary btn-sm mt-2 border-dashed text-[11px]"
                    style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}
                    onClick={() => setPicker({ dayIdx })}
                  >+ Add Exercise</button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {picker && (
        <ExercisePickerModal
          exercise={null}
          mode="add"
          onSelect={ex => addExercise(picker.dayIdx, ex)}
          onClose={() => setPicker(null)}
          customExercises={customExercises}
          onSaveCustomExercise={onSaveCustomExercise}
        />
      )}
    </div>
  )
}
