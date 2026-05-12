'use client'

import { useState } from 'react'
import { MUSCLES, PHASES, type PhaseId } from '@/lib/constants'
import { fmtDate, muscleVolume, today, totalSets, type Workout } from '@/lib/utils'

export default function Dashboard({
  workouts,
  phase,
  onNavigate,
}: {
  workouts: Workout[]
  phase: PhaseId
  onNavigate: (tab: string) => void
}) {
  const [nowMs] = useState(() => Date.now())
  const [todayStr] = useState(() => today())

  const vol7 = muscleVolume(workouts, 7)
  const recent = [...workouts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7)
  const totalThisWeek = workouts.filter(w => {
    const d = new Date(w.date).getTime()
    const diff = (nowMs - d) / 86400000
    return diff <= 7
  }).length

  const days: { ds: string; trained: Workout | undefined; isToday: boolean; label: string }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(nowMs)
    d.setDate(d.getDate() - i)
    const ds = d.toISOString().split('T')[0]
    const trained = workouts.find(w => w.date === ds)
    const isToday = ds === todayStr
    days.push({ ds, trained, isToday, label: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1) })
  }

  return (
    <div className="page">
      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-val">{totalThisWeek}</div>
          <div className="stat-lbl">Sessions / 7d</div>
        </div>
        <div className="stat-box">
          <div className="stat-val">{workouts.reduce((s, w) => s + totalSets(w), 0)}</div>
          <div className="stat-lbl">Total Sets</div>
        </div>
        <div className="stat-box">
          <div className="stat-val" style={{ color: PHASES.find(p => p.id === phase)?.color }}>
            {PHASES.find(p => p.id === phase)?.label}
          </div>
          <div className="stat-lbl">Phase</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Last 7 Days</div>
        <div className="week-grid">
          {days.map(({ ds, trained, isToday, label }) => (
            <div key={ds} className={`day-dot ${trained ? 'trained' : 'rest'} ${isToday ? 'today' : ''}`}>
              {label}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Weekly Volume (sets)</div>
        <div className="vol-grid">
          {Object.entries(MUSCLES).map(([key, { label, priority }]) => {
            const sets = vol7[key] || 0
            const pct = Math.min(100, (sets / 24) * 100)
            const cls = sets === 0 ? 'low' : priority ? 'priority' : 'normal'
            return (
              <div key={key} className="vol-row">
                <div className="vol-label">{label}{priority ? ' ★' : ''}</div>
                <div className="vol-bar-bg"><div className={`vol-bar-fill ${cls}`} style={{ width: `${pct}%` }} /></div>
                <div className="vol-count">{sets}</div>
              </div>
            )
          })}
        </div>
      </div>

      {recent.length > 0 && (
        <div className="card">
          <div className="card-title">Recent Sessions</div>
          {recent.slice(0, 3).map(w => (
            <div key={w.id} className="mb-2.5 border-b pb-2.5" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-[1px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>{w.splitDay}</span>
                <span className="text-xs" style={{ color: 'var(--text3)' }}>{fmtDate(w.date)} · {totalSets(w)} sets</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {workouts.length === 0 && (
        <div className="empty">
          <div className="empty-icon">💪</div>
          <div className="empty-text">No sessions logged yet</div>
          <div className="mt-4">
            <button className="btn btn-primary" onClick={() => onNavigate('log')}>Log First Workout</button>
          </div>
        </div>
      )}
    </div>
  )
}
