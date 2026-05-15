'use client'

import { useState } from 'react'
import { type PhaseId } from '@/lib/constants'
import { fmtDate, muscleVolume, today, type BodyEntry, type Workout } from '@/lib/utils'
import BodyMiniChart from '@/components/shared/BodyMiniChart'

export interface MacroTargets {
  calories?: string
  protein?: string
  carbs?: string
  fat?: string
}

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

export default function BodyTracker({
  bodyEntries,
  onSave,
  phase,
  workouts,
  phaseGoals,
  macroTargets,
  onSaveMacroTargets,
}: {
  bodyEntries: BodyEntry[]
  onSave: (entries: BodyEntry[]) => Promise<void> | void
  phase: PhaseId
  workouts: Workout[]
  phaseGoals: Record<string, PhaseGoal>
  macroTargets: MacroTargets
  onSaveMacroTargets: (targets: MacroTargets) => void
}) {
  const [date, setDate] = useState(today())
  const [weight, setWeight] = useState('')
  const [bf, setBf] = useState('')
  const [saved, setSaved] = useState(false)

  const [editingTargets, setEditingTargets] = useState(false)
  const [targetDraft, setTargetDraft] = useState<MacroTargets>(macroTargets)

  const saveTargets = () => {
    onSaveMacroTargets(targetDraft)
    setEditingTargets(false)
  }

  const hasTargets = !!(macroTargets.calories || macroTargets.protein)

  const yesterday = (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0] })()
  const [macroDate, setMacroDate] = useState(yesterday)
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')

  // Sync prefill values with stored data when the user picks a different date.
  // React 19 idiomatic "adjust state when prop changes" — setState during render
  // when the dependency key has changed.
  const [prevDate, setPrevDate] = useState(date)
  if (prevDate !== date) {
    setPrevDate(date)
    const existing = bodyEntries.find(e => e.date === date)
    setWeight(existing?.weight || '')
    setBf(existing?.bf || '')
  }

  const [prevMacroDate, setPrevMacroDate] = useState(macroDate)
  if (prevMacroDate !== macroDate) {
    setPrevMacroDate(macroDate)
    const existing = bodyEntries.find(e => e.date === macroDate)
    setCalories(existing?.macros?.calories || '')
    setProtein(existing?.macros?.protein || '')
    setCarbs(existing?.macros?.carbs || '')
    setFat(existing?.macros?.fat || '')
  }

  const handleSave = async () => {
    const hasBody = weight || bf
    const hasMacro = calories || protein
    if (!hasBody && !hasMacro) return

    const toSave: BodyEntry[] = []

    if (hasBody) {
      const existingBody = bodyEntries.find(e => e.date === date)
      toSave.push({ ...(existingBody || {}), date, weight, bf })
    }

    if (hasMacro) {
      const sameDate = hasBody && date === macroDate
      if (sameDate) {
        const idx = toSave.findIndex(e => e.date === macroDate)
        toSave[idx] = { ...toSave[idx], macros: { calories, protein, carbs, fat } }
      } else {
        const existingMacro = bodyEntries.find(e => e.date === macroDate)
        toSave.push({ ...(existingMacro || {}), date: macroDate, macros: { calories, protein, carbs, fat } })
      }
    }

    await onSave(toSave)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const weeklyAvgs = (() => {
    const result: { label: string; avg: string; count: number }[] = []
    for (let w = 0; w < 12; w++) {
      const end = new Date(); end.setDate(end.getDate() - w * 7)
      const start = new Date(end); start.setDate(start.getDate() - 6)
      const startStr = start.toISOString().split('T')[0]
      const endStr = end.toISOString().split('T')[0]
      const week = bodyEntries.filter(e => e.date >= startStr && e.date <= endStr && e.weight)
      if (week.length >= 1) {
        const avg = week.reduce((s, e) => s + parseFloat(e.weight!), 0) / week.length
        const weekLabel = w === 0 ? 'This week' : w === 1 ? 'Last week' : `${w} weeks ago`
        result.unshift({ label: weekLabel, avg: avg.toFixed(1), count: week.length })
      }
    }
    return result
  })()

  const rateOfChange = weeklyAvgs.length >= 2
    ? (parseFloat(weeklyAvgs[weeklyAvgs.length - 1].avg) - parseFloat(weeklyAvgs[weeklyAvgs.length - 2].avg)).toFixed(1)
    : null

  const currentGoal = phaseGoals?.[phase]

  const requiredRate = (() => {
    if (phase !== 'cut' || currentGoal?.mode !== 'deadline') return null
    const latestW = [...bodyEntries].filter(e => e.weight).sort((a, b) => b.date.localeCompare(a.date))[0]
    if (!latestW || !currentGoal.targetWeight || !currentGoal.deadline) return null
    const daysLeft = Math.ceil((new Date(currentGoal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (daysLeft <= 0) return null
    const needed = parseFloat(latestW.weight!) - parseFloat(currentGoal.targetWeight)
    return { rate: (needed / daysLeft * 7).toFixed(2), daysLeft, needed: needed.toFixed(1) }
  })()

  const sorted = [...bodyEntries].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="page">
      <div className="card">
        <div className="card-title">Daily Check-In</div>

        <div className="mb-4">
          <div className="mb-2 font-bold uppercase tracking-[1px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent2)' }}>Today&apos;s Body</div>
          <div className="flex flex-wrap items-end gap-2.5">
            <div>
              <div className="macro-lbl mb-1">Date</div>
              <input type="date" className="inp w-[150px]" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <div className="macro-lbl mb-1">Weight (lbs)</div>
              <input className="inp inp-sm w-[90px]" placeholder="e.g. 185.5" value={weight} onChange={e => setWeight(e.target.value)} />
            </div>
            <div>
              <div className="macro-lbl mb-1">Body Fat %</div>
              <input className="inp inp-sm w-[90px]" placeholder="e.g. 16.5" value={bf} onChange={e => setBf(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="mb-4 border-t" style={{ borderColor: 'var(--border)' }} />

        <div className="mb-3.5">
          <div className="mb-2 flex flex-wrap items-center gap-2.5">
            <div className="font-bold uppercase tracking-[1px]" style={{ fontFamily: 'var(--font-display)', color: '#42c8f5' }}>Yesterday&apos;s Macros</div>
            <input type="date" className="inp w-[150px]" value={macroDate} onChange={e => setMacroDate(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2.5">
            {[
              { label: 'kcal',        val: calories, set: setCalories, placeholder: 'e.g. 2400' },
              { label: 'protein (g)', val: protein,  set: setProtein,  placeholder: 'e.g. 190' },
              { label: 'carbs (g)',   val: carbs,    set: setCarbs,    placeholder: 'e.g. 220' },
              { label: 'fat (g)',     val: fat,      set: setFat,      placeholder: 'e.g. 70' },
            ].map(({ label, val, set, placeholder }) => (
              <div key={label}>
                <div className="macro-lbl mb-1">{label}</div>
                <input className="inp inp-sm w-[86px]" placeholder={placeholder} value={val} onChange={e => set(e.target.value)} />
              </div>
            ))}
          </div>
          <div className="mt-1.5 text-[11px]" style={{ color: 'var(--text3)' }}>
            Defaults to yesterday — adjust date if logging for a different day.
          </div>
        </div>

        <div className="btn-row">
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={!weight && !bf && !calories && !protein}>
            {saved ? '✓ Saved' : 'Log'}
          </button>
        </div>
      </div>

      <div className="card" style={{ borderColor: hasTargets ? '#42c8f5' : 'var(--border)' }}>
        <div className={`flex items-center justify-between ${hasTargets && !editingTargets ? 'mb-3' : ''}`}>
          <div className="card-title mb-0" style={{ color: hasTargets ? '#42c8f5' : 'var(--text2)' }}>Daily Targets</div>
          <button
            className="btn btn-secondary btn-sm text-[11px]"
            onClick={() => { setTargetDraft(macroTargets); setEditingTargets(e => !e) }}
          >{editingTargets ? 'Cancel' : hasTargets ? 'Edit' : 'Set Targets'}</button>
        </div>

        {editingTargets && (
          <div className="mt-3">
            <div className="mb-2.5 text-xs leading-normal" style={{ color: 'var(--text3)' }}>
              These stay fixed until you update them — adjust when your cut progresses or targets change.
            </div>
            <div className="mb-3 flex flex-wrap gap-2.5">
              {[
                { label: 'kcal',        key: 'calories' as const, placeholder: 'e.g. 2200' },
                { label: 'protein (g)', key: 'protein' as const,  placeholder: 'e.g. 185' },
                { label: 'carbs (g)',   key: 'carbs' as const,    placeholder: 'e.g. 200' },
                { label: 'fat (g)',     key: 'fat' as const,      placeholder: 'e.g. 65' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <div className="macro-lbl mb-1">{label}</div>
                  <input
                    className="inp inp-sm w-[90px]"
                    placeholder={placeholder}
                    value={targetDraft[key] || ''}
                    onChange={e => setTargetDraft(d => ({ ...d, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <button className="btn btn-primary btn-sm" onClick={saveTargets}>Save Targets</button>
          </div>
        )}

        {hasTargets && !editingTargets && (() => {
          const entry = bodyEntries.find(e => e.date === macroDate)
          const actuals = entry?.macros
          const fields = [
            { label: 'Calories', key: 'calories' as const, unit: 'kcal', color: 'var(--accent2)' },
            { label: 'Protein',  key: 'protein' as const,  unit: 'g',    color: '#42c8f5' },
            { label: 'Carbs',    key: 'carbs' as const,    unit: 'g',    color: 'var(--accent)' },
            { label: 'Fat',      key: 'fat' as const,      unit: 'g',    color: '#c084fc' },
          ]
          return (
            <div className="grid gap-2">
              {fields.filter(f => macroTargets[f.key]).map(f => {
                const target = parseFloat(macroTargets[f.key]!)
                const actualVal = actuals ? parseFloat(actuals[f.key] || '0') : null
                const pct = actualVal !== null ? Math.round((actualVal / target) * 100) : null
                const diff = actualVal !== null ? actualVal - target : null
                const onTrack = pct !== null && pct >= 90 && pct <= 110
                const over = pct !== null && pct > 110
                return (
                  <div key={f.key}>
                    <div className="mb-1 flex items-baseline justify-between">
                      <span className="text-xs font-bold uppercase tracking-[1px]" style={{ color: 'var(--text2)', fontFamily: 'var(--font-display)' }}>{f.label}</span>
                      <div className="flex items-baseline gap-2">
                        {actualVal !== null ? (
                          <>
                            <span className="text-[13px] font-semibold" style={{ color: onTrack ? f.color : over ? 'var(--red)' : 'var(--text2)' }}>
                              {actualVal}{f.unit}
                            </span>
                            <span className="text-[11px]" style={{ color: 'var(--text3)' }}>/ {target}{f.unit}</span>
                            <span className="text-[11px] font-bold" style={{ fontFamily: 'var(--font-display)', color: onTrack ? 'var(--accent)' : over ? 'var(--red)' : 'var(--accent2)' }}>
                              {diff! > 0 ? '+' : ''}{Math.round(diff!)}{f.unit}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--text3)' }}>Target: {target}{f.unit} — not logged yet</span>
                        )}
                      </div>
                    </div>
                    <div className="h-[5px] overflow-hidden rounded-[3px]" style={{ background: 'var(--surface3)' }}>
                      {actualVal !== null && (
                        <div className="h-full rounded-[3px] transition-[width] duration-[400ms] ease-out" style={{
                          width: `${Math.min(pct!, 120)}%`,
                          background: onTrack ? f.color : over ? 'var(--red)' : 'var(--accent2)',
                        }} />
                      )}
                    </div>
                  </div>
                )
              })}
              <div className="mt-1 text-[11px]" style={{ color: 'var(--text3)' }}>
                Showing actuals for {fmtDate(macroDate)} — change the macro date in check-in to compare any day.
              </div>
            </div>
          )
        })()}

        {!hasTargets && !editingTargets && (
          <div className="mt-2.5 text-[13px]" style={{ color: 'var(--text3)' }}>
            Set your daily targets and the app will track actuals vs targets each day you log macros.
          </div>
        )}
      </div>

      {currentGoal && (
        <div className="card" style={{ borderColor: 'var(--accent)', background: '#050f00' }}>
          <div className="card-title mb-2" style={{ color: 'var(--accent)' }}>🎯 Goal Progress</div>

          {phase === 'cut' && currentGoal.mode === 'rate' && rateOfChange !== null && (
            <div>
              <div className="mb-1.5 flex justify-between">
                <span className="text-[13px]" style={{ color: 'var(--text2)' }}>Current rate</span>
                <span className="text-sm font-bold" style={{
                  fontFamily: 'var(--font-display)',
                  color: Math.abs(parseFloat(rateOfChange)) >= parseFloat(currentGoal.targetRate!) * 0.85 ? 'var(--accent)' : 'var(--red)',
                }}>
                  {parseFloat(rateOfChange) > 0 ? '+' : ''}{rateOfChange} lbs/wk
                </span>
              </div>
              <div className="mb-2 flex justify-between">
                <span className="text-[13px]" style={{ color: 'var(--text2)' }}>Target rate</span>
                <span className="text-[13px]" style={{ color: 'var(--text3)' }}>{currentGoal.targetRate} lbs/wk</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-[3px]" style={{ background: 'var(--surface3)' }}>
                <div className="h-full rounded-[3px] transition-[width] duration-[400ms] ease-out" style={{
                  width: `${Math.min(Math.abs(parseFloat(rateOfChange)) / parseFloat(currentGoal.targetRate!) * 100, 100)}%`,
                  background: Math.abs(parseFloat(rateOfChange)) >= parseFloat(currentGoal.targetRate!) * 0.85 ? 'var(--accent)' : 'var(--red)',
                }} />
              </div>
              <div className="mt-1.5 text-[11px]" style={{ color: 'var(--text3)' }}>
                {Math.abs(parseFloat(rateOfChange)) < parseFloat(currentGoal.targetRate!) * 0.85
                  ? `⚠ ${(parseFloat(currentGoal.targetRate!) - Math.abs(parseFloat(rateOfChange))).toFixed(2)} lbs/wk below target — tighten the deficit`
                  : '✓ On pace with your target rate'}
              </div>
            </div>
          )}

          {phase === 'cut' && currentGoal.mode === 'deadline' && (
            <div className="grid gap-1.5">
              <div className="flex justify-between">
                <span className="text-[13px]" style={{ color: 'var(--text2)' }}>Goal weight</span>
                <span className="text-[13px] font-bold" style={{ color: 'var(--accent)' }}>{currentGoal.targetWeight} lbs by {currentGoal.deadline}</span>
              </div>
              {requiredRate && <div className="flex justify-between">
                <span className="text-[13px]" style={{ color: 'var(--text2)' }}>Required rate</span>
                <span className="text-[13px] font-bold" style={{
                  fontFamily: 'var(--font-display)',
                  color: parseFloat(requiredRate.rate) > 2 ? 'var(--red)' : 'var(--accent)',
                }}>
                  {requiredRate.rate} lbs/wk ({requiredRate.daysLeft} days left)
                </span>
              </div>}
              {rateOfChange !== null && requiredRate && <div className="flex justify-between">
                <span className="text-[13px]" style={{ color: 'var(--text2)' }}>Current rate</span>
                <span className="text-[13px]" style={{ color: Math.abs(parseFloat(rateOfChange)) >= parseFloat(requiredRate.rate) * 0.85 ? 'var(--accent)' : 'var(--accent2)' }}>
                  {rateOfChange} lbs/wk
                </span>
              </div>}
              {requiredRate && parseFloat(requiredRate.rate) > 2 && (
                <div className="mt-1 text-[11px]" style={{ color: 'var(--red)' }}>⚠ Required rate is aggressive — consider extending deadline or adjusting goal weight</div>
              )}
            </div>
          )}

          {phase === 'build' && currentGoal.mode === 'priority' && (currentGoal.muscles?.length ?? 0) > 0 && (
            <div className="grid gap-1.5">
              <div className="mb-1 text-xs" style={{ color: 'var(--text3)' }}>14-day volume — priority muscles</div>
              {currentGoal.muscles!.map(m => {
                const vol = muscleVolume(workouts, 14)[m] || 0
                const allVols = Object.values(muscleVolume(workouts, 14)).filter(v => v > 0)
                const max = allVols.length ? Math.max(...allVols) : 1
                return (
                  <div key={m}>
                    <div className="mb-[3px] flex justify-between">
                      <span className="text-xs capitalize" style={{ color: 'var(--text2)' }}>{m.replace('_', ' ')}</span>
                      <span className="text-xs font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>{vol} sets</span>
                    </div>
                    <div className="h-[5px] overflow-hidden rounded-[3px]" style={{ background: 'var(--surface3)' }}>
                      <div className="h-full rounded-[3px]" style={{ width: `${(vol / max) * 100}%`, background: 'var(--accent)' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {phase === 'build' && currentGoal.mode === 'strength' && (
            <div className="grid gap-1.5">
              <div className="flex justify-between">
                <span className="text-[13px]" style={{ color: 'var(--text2)' }}>{currentGoal.lift}</span>
                <span className="text-[13px] font-bold" style={{ color: 'var(--accent)' }}>→ {currentGoal.targetWeight}lbs × {currentGoal.targetReps}</span>
              </div>
              {(() => {
                const recentWorkouts = [...workouts].sort((a, b) => b.date.localeCompare(a.date))
                for (const w of recentWorkouts) {
                  const ex = w.exercises?.find(e => e.name?.toLowerCase().includes((currentGoal.lift || '').toLowerCase()))
                  if (ex?.sets?.length) {
                    const best = ex.sets.filter(s => s.weight && s.reps).sort((a, b) => parseFloat(b.weight!) - parseFloat(a.weight!))[0]
                    if (best) return (
                      <div className="text-xs" style={{ color: 'var(--text3)' }}>
                        Last logged: <span style={{ color: 'var(--text2)' }}>{best.weight}lbs × {best.reps} ({w.date})</span>
                      </div>
                    )
                  }
                }
                return <div className="text-xs" style={{ color: 'var(--text3)' }}>No matching sessions logged yet</div>
              })()}
            </div>
          )}

          {currentGoal.note && (
            <div className="mt-2 text-[11px] italic" style={{ color: 'var(--text3)' }}>{currentGoal.note}</div>
          )}
        </div>
      )}

      {bodyEntries.filter(e => e.weight).length >= 2 && (
        <div className="card p-0 grid grid-cols-1 gap-2.5">
          <BodyMiniChart entries={bodyEntries} field="weight" color="var(--accent2)" label="Bodyweight" unit="lbs" />
          {bodyEntries.filter(e => e.bf).length >= 2 && (
            <BodyMiniChart entries={bodyEntries} field="bf" color="#42c8f5" label="Body Fat" unit="%" />
          )}
        </div>
      )}

      {weeklyAvgs.length >= 2 && (
        <div className="card">
          <div className="card-title">Weekly Averages</div>
          <div className="mb-2.5 grid gap-1.5">
            {weeklyAvgs.map((w, i) => (
              <div key={i} className="flex justify-between border-b py-[5px]" style={{ borderColor: 'var(--border)' }}>
                <span className="text-[15px]" style={{ color: 'var(--text2)' }}>{w.label}</span>
                <span className="text-[15px] font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent2)' }}>
                  {w.avg} lbs <span className="ml-2 text-[12px] font-normal" style={{ color: 'var(--text3)' }}>({w.count} days)</span>
                </span>
              </div>
            ))}
          </div>
          {rateOfChange !== null && (
            <div className="rounded-[5px] border px-3 py-2" style={{
              background: Math.abs(parseFloat(rateOfChange)) < 0.1 ? 'var(--surface3)' : parseFloat(rateOfChange) < 0 ? '#0a1400' : '#1a0a00',
              borderColor: Math.abs(parseFloat(rateOfChange)) < 0.1 ? 'var(--border)' : parseFloat(rateOfChange) < 0 ? 'var(--accent)' : 'var(--red)',
            }}>
              <span className="font-bold uppercase tracking-[1px]" style={{
                fontFamily: 'var(--font-display)',
                color: parseFloat(rateOfChange) < 0 ? 'var(--accent)' : parseFloat(rateOfChange) > 0 ? 'var(--red)' : 'var(--text3)',
              }}>
                RATE: {parseFloat(rateOfChange) > 0 ? '+' : ''}{rateOfChange} lbs/week
              </span>
              <span className="ml-2.5 text-sm" style={{ color: 'var(--text3)' }}>
                {phase === 'cut'
                  ? Math.abs(parseFloat(rateOfChange)) >= 0.5 && Math.abs(parseFloat(rateOfChange)) <= 2
                    ? '✓ On target for cut (0.5-2lbs/week)'
                    : Math.abs(parseFloat(rateOfChange)) > 2
                      ? '⚠ Dropping fast — muscle loss risk'
                      : '⚠ Slow progress — may need deeper deficit'
                  : phase === 'build'
                    ? parseFloat(rateOfChange) >= 0.25 && parseFloat(rateOfChange) <= 0.75
                      ? '✓ Lean gain range (0.25-0.75lbs/week)'
                      : parseFloat(rateOfChange) > 0.75
                        ? '⚠ Gaining fast — more fat than muscle likely'
                        : '⚠ Not gaining — increase calories'
                    : 'Tracking...'}
              </span>
            </div>
          )}
        </div>
      )}

      {sorted.length > 0 && (
        <div className="card">
          <div className="card-title">Log</div>
          <table className="ex-table w-full">
            <thead>
              <tr>
                <th>Date</th>
                <th>Weight</th>
                <th>BF%</th>
                <th>Est. LBM</th>
                {/* <th>kcal</th>
                <th>Protein</th> */}
              </tr>
            </thead>
            <tbody>
              {sorted.slice(0, 30).map((e, i) => {
                const lbm = e.weight && e.bf ? (parseFloat(e.weight) * (1 - parseFloat(e.bf) / 100)).toFixed(1) : '—'
                return (
                  <tr key={i}>
                    <td className="" style={{ color: 'var(--text2)' }}>{fmtDate(e.date)}</td>
                    <td className=" font-semibold" style={{ color: 'var(--text)' }}>{e.weight ? `${e.weight} lbs` : '—'}</td>
                    <td className="" style={{ color: 'var(--text2)' }}>{e.bf ? `${e.bf}%` : '—'}</td>
                    <td className="" style={{ color: 'var(--accent)' }}>{lbm !== '—' ? `${lbm} lbs` : '—'}</td>
                    {/* <td className="text-xs" style={{ color: 'var(--text2)' }}>{e.macros?.calories ? `${e.macros.calories}` : '—'}</td>
                    <td className="text-xs" style={{ color: '#42c8f5' }}>{e.macros?.protein ? `${e.macros.protein}g` : '—'}</td> */}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {sorted.length === 0 && (
        <div className="empty"><div className="empty-icon">⚖️</div><div className="empty-text">No body entries yet — log your first check-in above</div></div>
      )}
    </div>
  )
}
