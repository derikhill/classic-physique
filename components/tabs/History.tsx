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
        <div className="mt-1.5 mb-0.5 flex items-center gap-2.5">
          <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
          <span className="text-[10px] font-bold uppercase tracking-[2px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--text3)' }}>
            Older Sessions
          </span>
          <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
        </div>
      )}

      {Array.from(olderByMonth.entries()).map(([key, sessions]) => {
        const isOpen = expanded.has(key)
        return (
          <div key={key} className="card">
            <button
              onClick={() => toggleMonth(key)}
              className="flex w-full cursor-pointer items-center justify-between border-0 bg-transparent p-0 text-inherit"
              aria-expanded={isOpen}
            >
              <div className="card-title mb-0">
                {MONTH_LABEL(key)}
                <span className="ml-2 text-[11px] font-bold tracking-[1px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--text3)' }}>
                  {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
                </span>
              </div>
              <span className="text-xs tracking-[1px]" style={{ color: 'var(--text3)', fontFamily: 'var(--font-display)' }}>
                {isOpen ? '▾' : '▸'}
              </span>
            </button>

            {isOpen && (
              <div className="mt-3 grid gap-3">
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
