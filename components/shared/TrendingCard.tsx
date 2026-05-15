'use client'

import { Fragment, useState } from 'react'
import { buildTrendingLifts } from '@/lib/progression'
import { fmtDate, type Workout } from '@/lib/utils'
import Sparkline from './Sparkline'

export default function TrendingCard({ workouts }: { workouts: Workout[] }) {
  const trends = buildTrendingLifts(workouts)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  if (trends.length === 0) return null

  const toggle = (name: string) =>
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })

  return (
    <div className="card mb-4" style={{ borderColor: 'var(--accent)', background: '#050f00' }}>
      <div className="mb-3 flex items-center justify-between">
        <div className="card-title mb-0" style={{ color: 'var(--accent)' }}>🔥 Trending Lifts</div>
        <span className="text-[11px] tracking-[1px]" style={{ color: 'var(--text3)', fontFamily: 'var(--font-display)' }}>VOLUME · LAST 6 SESSIONS</span>
      </div>
      <div className="grid gap-2">
        {trends.map((t, i) => {
          const isOpen = expanded.has(t.name)
          return (
            <div key={i} className="rounded-md border" style={{
              background: 'var(--surface2)',
              borderColor: isOpen ? 'var(--accent)' : 'var(--border)',
            }}>
              <button
                onClick={() => toggle(t.name)}
                aria-expanded={isOpen}
                className="box-border flex w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent px-3 py-2.5 text-inherit"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold" style={{ color: 'var(--text)' }}>{t.name}</span>
                    <span
                      className="rounded-[3px] px-[7px] py-px text-[14px] font-bold tracking-[1px]"
                      style={{ fontFamily: 'var(--font-display)', color: '#000', background: 'var(--accent)' }}
                    >↑ {t.streak} IN A ROW</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3">
                    {t.weightGain > 0.5 && (
                      <span className="" style={{ color: 'var(--accent)' }}>+{Math.round(t.weightGain)}lbs avg weight this run</span>
                    )}
                    <span className="" style={{ color: 'var(--text3)' }}>
                      {t.volChange >= 0 ? '+' : ''}{Math.round(t.volChange)} vol last session
                    </span>
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <Sparkline data={t.sparkData} />
                  <span className="text-lg tracking-[1px]" style={{ color: 'var(--text3)', fontFamily: 'var(--font-display)' }}>
                    {isOpen ? '▾' : '▸'}
                  </span>
                </div>
              </button>

              {isOpen && (
                <div className="border-t px-3 pb-3" style={{ borderColor: 'var(--border)' }}>
                  <div className="mt-2.5 grid grid-cols-[1fr_auto_auto_auto] items-baseline gap-x-3 gap-y-1">
                    <span className="text-[12px] font-bold uppercase tracking-[1px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--text3)' }}>Date</span>
                    <span className="text-right text-[12px] font-bold uppercase tracking-[1px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--text3)' }}>Avg Wt</span>
                    <span className="text-right text-[12px] font-bold uppercase tracking-[1px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--text3)' }}>Avg Reps</span>
                    <span className="text-right text-[12px] font-bold uppercase tracking-[1px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--text3)' }}>Volume</span>
                    {t.history.slice().reverse().map((h, hi) => {
                      const isLatest = hi === 0
                      const cellClass = `pt-1 text-sm ${isLatest ? 'font-semibold' : 'font-normal'} ${hi === 0 ? '' : 'border-t'}`
                      const cellStyle = {
                        color: isLatest ? 'var(--accent)' : 'var(--text2)',
                        ...(hi !== 0 ? { borderColor: 'var(--border)' } : {}),
                      } as const
                      return (
                        <Fragment key={`${h.date}-${hi}`}>
                          <span className={cellClass} style={cellStyle}>
                            {fmtDate(h.date)} <span className="text-[12px]" style={{ color: 'var(--text3)' }}>· {h.setCount}×</span>
                          </span>
                          <span className={`${cellClass} text-right`} style={cellStyle}>{Math.round(h.avgWeight)}lbs</span>
                          <span className={`${cellClass} text-right`} style={cellStyle}>{h.avgReps.toFixed(1)}</span>
                          <span className={`${cellClass} text-right`} style={cellStyle}>{Math.round(h.volume)}</span>
                        </Fragment>
                      )
                    })}
                  </div>
                  {t.sessions > t.history.length && (
                    <div className="mt-2 text-[10px] italic" style={{ color: 'var(--text3)' }}>
                      Showing last {t.history.length} of {t.sessions} sessions.
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
