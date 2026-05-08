'use client'

import { useState } from 'react'
import HistoryEntry from '@/components/shared/HistoryEntry'
import TrendingCard from '@/components/shared/TrendingCard'
import type { Workout } from '@/lib/utils'

const MONTH_LABEL = (key: string) => {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export default function History({
  workouts,
  onDelete,
  onUpdate,
}: {
  workouts: Workout[]
  onDelete: (id: string) => void
  onUpdate: (workout: Workout) => void
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const sorted = [...workouts].sort((a, b) => b.date.localeCompare(a.date))
  if (sorted.length === 0) return (
    <div className="page"><div className="empty"><div className="empty-icon">📋</div><div className="empty-text">No sessions yet</div></div></div>
  )

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 28)
  const cutoffStr = cutoff.toISOString().split('T')[0]

  const recent: Workout[] = []
  const olderByMonth = new Map<string, Workout[]>()
  for (const w of sorted) {
    if (w.date >= cutoffStr) {
      recent.push(w)
    } else {
      const key = w.date.slice(0, 7)
      const bucket = olderByMonth.get(key) || []
      bucket.push(w)
      olderByMonth.set(key, bucket)
    }
  }

  const toggleMonth = (key: string) =>
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  return (
    <div className="page">
      <TrendingCard workouts={workouts} />
      {recent.map(w => (
        <HistoryEntry key={w.id} workout={w} onDelete={onDelete} onUpdate={onUpdate} />
      ))}

      {olderByMonth.size > 0 && recent.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '6px 0 2px' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase' }}>
            Older Sessions
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>
      )}

      {Array.from(olderByMonth.entries()).map(([key, sessions]) => {
        const isOpen = expanded.has(key)
        return (
          <div key={key} className="card">
            <button
              onClick={() => toggleMonth(key)}
              style={{
                all: 'unset', cursor: 'pointer', width: '100%',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}
              aria-expanded={isOpen}
            >
              <div className="card-title" style={{ marginBottom: 0 }}>
                {MONTH_LABEL(key)}
                <span style={{ marginLeft: 8, fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: 1, color: 'var(--text3)' }}>
                  {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
                </span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-display)', letterSpacing: 1 }}>
                {isOpen ? '▾' : '▸'}
              </span>
            </button>

            {isOpen && (
              <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
                {sessions.map(w => (
                  <HistoryEntry key={w.id} workout={w} onDelete={onDelete} onUpdate={onUpdate} />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
