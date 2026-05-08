'use client'

import { useCallback, useState } from 'react'
import { EXERCISE_LIBRARY, MUSCLES, type ExerciseTemplate, type MuscleKey } from '@/lib/constants'

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
  const [customMuscle, setCustomMuscle] = useState<MuscleKey>('back')
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

  const candidates = isSwap
    ? fullLibrary.filter(e => e.name !== exercise?.name && e.muscles.some(m => targetMuscles.includes(m)))
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
    const ex: ExerciseTemplate = {
      name: search.trim(),
      muscles: isSwap ? targetMuscles : [customMuscle],
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
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <input
              ref={searchRef}
              className="inp"
              placeholder="Search exercises or type a new one..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && isNewCustom && handleAddCustom()}
              style={{ paddingLeft: 32 }}
            />
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: 14 }}>🔍</span>
            {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 16 }}>×</button>}
          </div>

          {isNewCustom && (
            <div style={{ background: '#050f00', border: '1px solid var(--accent)', borderRadius: 6, padding: '12px 14px', marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>✦ NEW EXERCISE: {search.trim()}</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                <div>
                  <div className="macro-lbl" style={{ marginBottom: 4 }}>Rep range</div>
                  <input className="inp inp-sm" style={{ width: 90 }} value={customReps} onChange={e => setCustomReps(e.target.value)} placeholder="e.g. 10-12" />
                </div>
                {!isSwap && (
                  <div>
                    <div className="macro-lbl" style={{ marginBottom: 4 }}>Muscle group</div>
                    <select className="inp" style={{ width: 130 }} value={customMuscle} onChange={e => setCustomMuscle(e.target.value as MuscleKey)}>
                      {Object.entries(MUSCLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div onClick={() => setSaveToLibrary(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: 3, border: `1px solid ${saveToLibrary ? 'var(--accent)' : 'var(--border)'}`,
                    background: saveToLibrary ? 'var(--accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {saveToLibrary && <span style={{ color: '#000', fontSize: 11, fontWeight: 900 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text2)' }}>Save to my exercise library</span>
                </div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={handleAddCustom}>
                Add {search.trim()}
              </button>
            </div>
          )}

          {!isNewCustom && (
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>
              {q ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''}` : `${filtered.length} exercises`}
              {!isSwap && !q && (customExercises?.length ?? 0) > 0 && (
                <span style={{ marginLeft: 6, color: 'var(--accent)' }}>· {customExercises!.length} saved</span>
              )}
            </div>
          )}

          {filtered.map((ex, i) => (
            <div key={i} className="swap-option" onClick={() => onSelect(ex)}>
              <div>
                <div className="swap-option-name">
                  {ex.name}
                  {ex.custom && <span className="ex-tag" style={{ background: '#1a0050', color: '#a78bfa', marginLeft: 6, fontSize: 10 }}>SAVED</span>}
                  {ex.priority && <span className="ex-tag priority" style={{ marginLeft: 4 }}>Priority</span>}
                </div>
                <div className="swap-option-meta">
                  {ex.muscles.map(m => MUSCLES[m]?.label).filter(Boolean).join(', ')} · {ex.repRange} reps{ex.note && ex.note !== 'Custom exercise' ? ` · ${ex.note}` : ''}
                </div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: 1 }}>SELECT →</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
