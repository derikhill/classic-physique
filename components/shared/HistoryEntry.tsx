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
        <div style={{ flex: 1, marginRight: 8 }}>
          {editing && draft ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <input
                className="inp"
                value={draft.splitDay}
                onChange={e => updateDraftField('splitDay', e.target.value)}
                placeholder="Session title"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--accent)', textTransform: 'uppercase' }}
              />
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <input type="date" className="inp" style={{ width: 150 }} value={draft.date} onChange={e => updateDraftField('date', e.target.value)} />
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-display)', letterSpacing: 1, textTransform: 'uppercase' }}>Feel:</span>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => updateDraftField('feel', n)} style={{
                      width: 30, height: 30, borderRadius: 4, border: '1px solid',
                      borderColor: draft.feel === n ? 'var(--accent)' : 'var(--border)',
                      background: draft.feel === n ? 'var(--accent)' : 'var(--surface2)',
                      color: draft.feel === n ? '#000' : 'var(--text2)',
                      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                    }}>{n}</button>
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
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', flexShrink: 0 }}>
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
        <div key={ei} style={{ marginBottom: editing ? 12 : 4 }}>
          {editing ? (
            <div style={{ background: 'var(--surface3)', borderRadius: 6, padding: '10px 12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <input
                  className="inp"
                  value={ex.name}
                  onChange={e => updateDraftExName(ei, e.target.value)}
                  style={{ fontWeight: 600, fontSize: 13 }}
                />
                <button className="btn-rm" style={{ color: 'var(--red)', fontSize: 16, flexShrink: 0 }} onClick={() => removeDraftExercise(ei)}>✕</button>
              </div>
              <table className="ex-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: 24 }}>#</th>
                    <th>Weight (lbs)</th>
                    <th>Reps</th>
                    <th>RIR</th>
                    <th style={{ width: 24 }}></th>
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
              {ex.priority && <span className="ex-tag priority" style={{ marginLeft: 6 }}>Priority</span>}
              <div className="history-sets">
                {ex.sets.map((s, j) => (
                  <span key={j} style={{ marginRight: 8, color: s.type === 'drop' ? '#f59e0b' : s.type === 'restpause' ? '#a78bfa' : 'inherit' }}>
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
          className="inp"
          value={draft.notes || ''}
          onChange={e => updateDraftField('notes', e.target.value)}
          placeholder="Session notes..."
          style={{ marginTop: 8, minHeight: 56 }}
        />
      ) : (
        w.notes && <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text3)', fontStyle: 'italic' }}>&quot;{w.notes}&quot;</div>
      )}
    </div>
  )
}
