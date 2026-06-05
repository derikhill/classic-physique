'use client'

import { useCallback, useState } from 'react'
import { EXERCISE_LIBRARY, MUSCLES, type ExerciseTemplate, type MuscleKey } from '@/lib/constants'
import MuscleChips from './MuscleChips'

export type PickerMode = 'swap' | 'add'

export default function ExercisePickerModal({
  exercise,
  mode,
  onSelect,
  onClose,
  customExercises,
  onSaveCustomExercise,
}: {
  exercise: { name: string; muscles?: MuscleKey[] } | null
  mode: PickerMode
  onSelect: (ex: ExerciseTemplate) => void
  onClose: () => void
  customExercises?: ExerciseTemplate[]
  onSaveCustomExercise?: (ex: ExerciseTemplate) => void
}) {
  const [search, setSearch] = useState('')
  const [customReps, setCustomReps] = useState('10-12')
  const [customMuscles, setCustomMuscles] = useState<MuscleKey[]>([])
  const [saveToLibrary, setSaveToLibrary] = useState(true)
  const searchRef = useCallback((el: HTMLInputElement | null) => {
    if (el) setTimeout(() => el.focus(), 50)
  }, [])

  const isSwap = mode === 'swap'
  const targetMuscles = exercise?.muscles || []

  const fullLibrary: ExerciseTemplate[] = [
    ...EXERCISE_LIBRARY,
    ...(customExercises || []).filter(ce => !EXERCISE_LIBRARY.some(e => e.name.toLowerCase() === ce.name.toLowerCase())),
  ]

  // Built-in library filtered to muscle-relevant matches in swap mode.
  // Customs always appear (regardless of muscle filter) so the user's hand-curated
  // library is never hidden, even if their muscle tags don't perfectly overlap.
  const customsOnly = (customExercises || []).filter(ce =>
    !EXERCISE_LIBRARY.some(e => e.name.toLowerCase() === ce.name.toLowerCase()),
  )
  const candidates = isSwap
    ? [
        ...EXERCISE_LIBRARY.filter(e => e.name !== exercise?.name && e.muscles.some(m => targetMuscles.includes(m))),
        ...customsOnly.filter(ce => ce.name !== exercise?.name),
      ]
    : fullLibrary

  const q = search.trim().toLowerCase()

  const filtered = q
    ? candidates.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.muscles.some(m => m.toLowerCase().includes(q)) ||
        (e.note || '').toLowerCase().includes(q),
      )
    : candidates

  const isNewCustom = q && filtered.length === 0

  const handleAddCustom = () => {
    if (!q) return
    const muscles: MuscleKey[] = isSwap
      ? targetMuscles
      : customMuscles.length > 0 ? customMuscles : ['back']
    const ex: ExerciseTemplate = {
      name: search.trim(),
      muscles,
      repRange: customReps,
      note: 'Custom exercise',
      custom: true,
    }
    if (saveToLibrary && onSaveCustomExercise) onSaveCustomExercise(ex)
    onSelect(ex)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <div className="modal-title">{isSwap ? 'Swap Exercise' : 'Add Exercise'}</div>
            <div className="modal-subtitle">{isSwap ? `Replacing: ${exercise?.name}` : 'Search library or type to add new'}</div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="relative mb-3">
            <input
              ref={searchRef}
              className="inp pl-8"
              placeholder="Search exercises or type a new one..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && isNewCustom && handleAddCustom()}
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text3)' }}>🔍</span>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer border-0 bg-transparent text-base"
                style={{ color: 'var(--text3)' }}
              >×</button>
            )}
          </div>

          {isNewCustom && (
            <div className="mb-3 rounded-md border px-3.5 py-3" style={{ background: '#050f00', borderColor: 'var(--accent)' }}>
              <div className="mb-2.5 text-xs font-bold tracking-[1px]" style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>✦ NEW EXERCISE: {search.trim()}</div>
              <div className="mb-2.5">
                <div className="macro-lbl mb-1">Rep range</div>
                <input className="inp inp-sm w-[90px]" value={customReps} onChange={e => setCustomReps(e.target.value)} placeholder="e.g. 10-12" />
              </div>
              {!isSwap && (
                <div className="mb-2.5">
                  <div className="macro-lbl mb-1">Muscles worked <span className="ml-1 normal-case" style={{ color: 'var(--text3)' }}>· tap to add, first = primary ★</span></div>
                  <MuscleChips selected={customMuscles} onChange={setCustomMuscles} />
                </div>
              )}
              <div className="mb-2.5 flex items-center gap-2.5">
                <div onClick={() => setSaveToLibrary(s => !s)} className="flex cursor-pointer items-center gap-1.5">
                  <div
                    className="flex h-4 w-4 items-center justify-center rounded-[3px] border"
                    style={{
                      borderColor: saveToLibrary ? 'var(--accent)' : 'var(--border)',
                      background: saveToLibrary ? 'var(--accent)' : 'transparent',
                    }}
                  >
                    {saveToLibrary && <span className="text-[11px] font-black" style={{ color: '#000' }}>✓</span>}
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text2)' }}>Save to my exercise library</span>
                </div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={handleAddCustom}>
                Add {search.trim()}
              </button>
            </div>
          )}

          {!isNewCustom && (
            <div className="mb-2 text-[11px]" style={{ color: 'var(--text3)' }}>
              {q ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''}` : `${filtered.length} exercises`}
              {!isSwap && !q && (customExercises?.length ?? 0) > 0 && (
                <span className="ml-1.5" style={{ color: 'var(--accent)' }}>· {customExercises!.length} saved</span>
              )}
            </div>
          )}

          {filtered.map((ex, i) => (
            <div key={i} className="swap-option" onClick={() => onSelect(ex)}>
              <div>
                <div className="swap-option-name">
                  {ex.name}
                  {ex.custom && <span className="ex-tag ml-1.5 text-[10px]" style={{ background: '#1a0050', color: '#a78bfa' }}>SAVED</span>}
                  {ex.priority && <span className="ex-tag priority ml-1">Priority</span>}
                </div>
                <div className="swap-option-meta">
                  {ex.muscles.map(m => MUSCLES[m]?.label).filter(Boolean).join(', ')} · {ex.repRange} reps{ex.note && ex.note !== 'Custom exercise' ? ` · ${ex.note}` : ''}
                </div>
              </div>
              <span className="text-[11px] font-bold tracking-[1px]" style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>SELECT →</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
