'use client'

import { useState } from 'react'
import { FEEL_LABELS } from '@/lib/constants'
import { fmtDate, totalSets, type Workout } from '@/lib/utils'

export default function HistoryEntry({
  workout,
  onDelete,
  onUpdate,
}: {
  workout: Workout
  onDelete: (id: string) => void
  onUpdate: (workout: Workout) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Workout | null>(null)

  const startEdit = () => {
    setDraft(JSON.parse(JSON.stringify(workout)))
    setEditing(true)
  }

  const cancelEdit = () => {
    setDraft(null)
    setEditing(false)
  }

  const saveEdit = () => {
    if (!draft) return
    onUpdate(draft)
    setEditing(false)
    setDraft(null)
  }

  const updateDraftField = <K extends keyof Workout>(field: K, val: Workout[K]) =>
    setDraft(d => (d ? { ...d, [field]: val } : d))

  const updateDraftExName = (ei: number, val: string) =>
    setDraft(d => (d ? { ...d, exercises: d.exercises.map((ex, i) => (i !== ei ? ex : { ...ex, name: val })) } : d))

  const updateDraftSet = (ei: number, si: number, field: string, val: string) =>
    setDraft(d => (d ? {
      ...d,
      exercises: d.exercises.map((ex, i) => (i !== ei ? ex : {
        ...ex,
        sets: ex.sets.map((s, j) => (j !== si ? s : { ...s, [field]: val })),
      })),
    } : d))

  const addDraftSet = (ei: number) =>
    setDraft(d => (d ? {
      ...d,
      exercises: d.exercises.map((ex, i) => (i !== ei ? ex : {
        ...ex,
        sets: [...ex.sets, { reps: '', weight: '', rir: '1' }],
      })),
    } : d))

  const removeDraftSet = (ei: number, si: number) =>
    setDraft(d => (d ? {
      ...d,
      exercises: d.exercises.map((ex, i) => (i !== ei ? ex : {
        ...ex,
        sets: ex.sets.filter((_, j) => j !== si),
      })),
    } : d))

  const removeDraftExercise = (ei: number) =>
    setDraft(d => (d ? { ...d, exercises: d.exercises.filter((_, i) => i !== ei) } : d))

  const w = (editing && draft) ? draft : workout

  return (
    <div className="history-entry" style={{ borderColor: editing ? 'var(--accent)' : 'var(--border)' }}>
      <div className="history-header">
        <div className="mr-2 flex-1">
          {editing && draft ? (
            <div className="flex flex-col gap-1.5">
              <input
                className="inp text-base font-bold uppercase"
                value={draft.splitDay}
                onChange={e => updateDraftField('splitDay', e.target.value)}
                placeholder="Session title"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)' }}
              />
              <div className="flex flex-wrap items-center gap-2">
                <input type="date" className="inp w-[150px]" value={draft.date} onChange={e => updateDraftField('date', e.target.value)} />
                <div className="flex items-center gap-1">
                  <span className="text-[11px] uppercase tracking-[1px]" style={{ color: 'var(--text3)', fontFamily: 'var(--font-display)' }}>Feel:</span>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => updateDraftField('feel', n)}
                      className="h-[30px] w-[30px] cursor-pointer rounded border text-xs font-bold"
                      style={{
                        fontFamily: 'var(--font-display)',
                        borderColor: draft.feel === n ? 'var(--accent)' : 'var(--border)',
                        background: draft.feel === n ? 'var(--accent)' : 'var(--surface2)',
                        color: draft.feel === n ? '#000' : 'var(--text2)',
                      }}
                    >{n}</button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="history-day">{w.splitDay}</div>
              <div className="history-date">{fmtDate(w.date)} · {totalSets(w)} sets</div>
            </>
          )}
        </div>
        <div className="flex flex-shrink-0 items-start gap-1.5">
          {!editing && w.feel && <span className={`feel-badge feel-${w.feel}`}>{FEEL_LABELS[w.feel] || w.feel}</span>}
          {editing ? (
            <>
              <button className="btn btn-primary btn-sm" onClick={saveEdit}>Save</button>
              <button className="btn btn-secondary btn-sm" onClick={cancelEdit}>Cancel</button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary btn-sm" onClick={startEdit}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => onDelete(w.id)}>Delete</button>
            </>
          )}
        </div>
      </div>

      {w.exercises.map((ex, ei) => (
        <div key={ei} className={editing ? 'mb-3' : 'mb-1'}>
          {editing ? (
            <div className="rounded-md border px-3 py-2.5" style={{ background: 'var(--surface3)', borderColor: 'var(--border)' }}>
              <div className="mb-2 flex items-center gap-2">
                <input
                  className="inp text-[13px] font-semibold"
                  value={ex.name}
                  onChange={e => updateDraftExName(ei, e.target.value)}
                />
                <button className="btn-rm flex-shrink-0 text-base" style={{ color: 'var(--red)' }} onClick={() => removeDraftExercise(ei)}>✕</button>
              </div>
              <table className="ex-table w-full">
                <thead>
                  <tr>
                    <th className="w-6">#</th>
                    <th>Weight (lbs)</th>
                    <th>Reps</th>
                    <th>RIR</th>
                    <th className="w-6"></th>
                  </tr>
                </thead>
                <tbody>
                  {ex.sets.map((s, si) => (
                    <tr key={si}>
                      <td><span className="set-num">{si + 1}</span></td>
                      <td><input className="inp inp-sm" value={s.weight || ''} onChange={e => updateDraftSet(ei, si, 'weight', e.target.value)} placeholder="—" /></td>
                      <td><input className="inp inp-sm" value={s.reps || ''} onChange={e => updateDraftSet(ei, si, 'reps', e.target.value)} placeholder="—" /></td>
                      <td>
                        <select className="inp inp-xs" value={s.rir || ''} onChange={e => updateDraftSet(ei, si, 'rir', e.target.value)}>
                          {['0', '1', '2', '3', '4+'].map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                      <td><button className="btn-rm" onClick={() => removeDraftSet(ei, si)}>×</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="btn-add-set" onClick={() => addDraftSet(ei)}>+ Set</button>
            </div>
          ) : (
            <div className="history-ex">
              <strong style={{ color: 'var(--text)' }}>{ex.name}</strong>
              {ex.priority && <span className="ex-tag priority ml-1.5">Priority</span>}
              <div className="history-sets">
                {ex.sets.map((s, j) => (
                  <span key={j} className="mr-2" style={{ color: s.type === 'drop' ? '#f59e0b' : s.type === 'restpause' ? '#a78bfa' : 'inherit' }}>
                    {s.weight ? `${s.weight}lb × ` : ''}{s.reps}{s.pauseReps ? `+${s.pauseReps}` : ''}r {s.rir !== undefined ? `RIR${s.rir}` : ''}
                    {s.type === 'drop' && (s.drops?.length ?? 0) > 0 && ` → ${s.drops!.map(d => `${d.weight}×${d.reps}`).join(' → ')}`}
                    {s.type === 'restpause' && ' [RP]'}
                    {s.type === 'drop' && ' [DS]'}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {editing && draft ? (
        <textarea
          className="inp mt-2 min-h-14"
          value={draft.notes || ''}
          onChange={e => updateDraftField('notes', e.target.value)}
          placeholder="Session notes..."
        />
      ) : (
        w.notes && <div className="mt-2 text-[13px] italic" style={{ color: 'var(--text3)' }}>&quot;{w.notes}&quot;</div>
      )}
    </div>
  )
}
