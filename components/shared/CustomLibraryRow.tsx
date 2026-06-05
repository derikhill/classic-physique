'use client'

import { useState } from 'react'
import type { ExerciseTemplate, MuscleKey } from '@/lib/constants'
import MuscleChips from './MuscleChips'

export default function CustomLibraryRow({
  exercise,
  onUpdate,
  onDelete,
}: {
  exercise: ExerciseTemplate
  onUpdate: (name: string, patch: Partial<ExerciseTemplate>) => void
  onDelete: (name: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draftMuscles, setDraftMuscles] = useState<MuscleKey[]>(exercise.muscles || [])
  const [draftRepRange, setDraftRepRange] = useState(exercise.repRange || '')

  const startEdit = () => {
    setDraftMuscles(exercise.muscles || [])
    setDraftRepRange(exercise.repRange || '')
    setEditing(true)
  }

  const save = () => {
    onUpdate(exercise.name, {
      muscles: draftMuscles.length > 0 ? draftMuscles : exercise.muscles,
      repRange: draftRepRange || exercise.repRange,
    })
    setEditing(false)
  }

  const cancel = () => setEditing(false)

  return (
    <div className="border-b py-1.5" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>{exercise.name}</div>
          <div className="text-[11px]" style={{ color: 'var(--text3)' }}>
            {(exercise.muscles || []).map(m => m.replace('_', ' ')).join(', ') || 'no muscles tagged'} · {exercise.repRange}
          </div>
        </div>
        <div className="flex flex-shrink-0 gap-1.5">
          {!editing && (
            <button
              className="btn btn-secondary btn-sm text-[11px]"
              onClick={startEdit}
            >Edit</button>
          )}
          {!editing && (
            <button
              className="btn btn-secondary btn-sm text-[11px]"
              style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
              onClick={() => onDelete(exercise.name)}
            >Remove</button>
          )}
        </div>
      </div>

      {editing && (
        <div className="mt-2.5 rounded-md border px-3 py-2.5" style={{ background: 'var(--surface2)', borderColor: 'var(--accent)' }}>
          <div className="mb-2.5">
            <div className="macro-lbl mb-1">Muscles worked <span className="ml-1 normal-case" style={{ color: 'var(--text3)' }}>· first = primary ★</span></div>
            <MuscleChips selected={draftMuscles} onChange={setDraftMuscles} />
          </div>
          <div className="mb-2.5">
            <div className="macro-lbl mb-1">Rep range</div>
            <input
              className="inp inp-sm w-[90px]"
              value={draftRepRange}
              onChange={e => setDraftRepRange(e.target.value)}
              placeholder="e.g. 10-12"
            />
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary btn-sm" onClick={save}>Save</button>
            <button className="btn btn-secondary btn-sm" onClick={cancel}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
