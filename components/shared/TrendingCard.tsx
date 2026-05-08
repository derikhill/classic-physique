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
    <div className="card" style={{ borderColor: 'var(--accent)', background: '#050f00', marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="card-title" style={{ marginBottom: 0, color: 'var(--accent)' }}>🔥 Trending Lifts</div>
        <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-display)', letterSpacing: 1 }}>VOLUME · LAST 6 SESSIONS</span>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {trends.map((t, i) => {
          const isOpen = expanded.has(t.name)
          return (
            <div key={i} style={{
              background: 'var(--surface2)', borderRadius: 6,
              border: `1px solid ${isOpen ? 'var(--accent)' : 'var(--border)'}`,
            }}>
              <button
                onClick={() => toggle(t.name)}
                aria-expanded={isOpen}
                style={{
                  all: 'unset', cursor: 'pointer', width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', gap: 12, boxSizing: 'border-box',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{t.name}</span>
                    <span style={{
                      fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700,
                      letterSpacing: 1, color: '#000', background: 'var(--accent)',
                      padding: '1px 7px', borderRadius: 3,
                    }}>↑ {t.streak} IN A ROW</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                    {t.weightGain > 0.5 && (
                      <span style={{ fontSize: 12, color: 'var(--accent)' }}>+{Math.round(t.weightGain)}lbs avg weight this run</span>
                    )}
                    <span style={{ fontSize: 12, color: 'var(--text3)' }}>
                      {t.volChange >= 0 ? '+' : ''}{Math.round(t.volChange)} vol last session
                    </span>
                  </div>
                </div>
                <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkline data={t.sparkData} />
                  <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-display)', letterSpacing: 1 }}>
                    {isOpen ? '▾' : '▸'}
                  </span>
                </div>
              </button>

              {isOpen && (
                <div style={{ padding: '0 12px 12px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '4px 12px', alignItems: 'baseline', marginTop: 10 }}>
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: 1, color: 'var(--text3)', textTransform: 'uppercase' }}>Date</span>
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: 1, color: 'var(--text3)', textTransform: 'uppercase', textAlign: 'right' }}>Avg Wt</span>
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: 1, color: 'var(--text3)', textTransform: 'uppercase', textAlign: 'right' }}>Avg Reps</span>
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: 1, color: 'var(--text3)', textTransform: 'uppercase', textAlign: 'right' }}>Volume</span>
                    {t.history.slice().reverse().map((h, hi) => {
                      const isLatest = hi === 0
                      const cellStyle = {
                        fontSize: 12,
                        color: isLatest ? 'var(--accent)' : 'var(--text2)',
                        fontWeight: isLatest ? 600 : 400,
                        paddingTop: 4,
                        borderTop: hi === 0 ? 'none' : '1px solid var(--border)',
                      } as const
                      return (
                        <Fragment key={`${h.date}-${hi}`}>
                          <span style={cellStyle}>
                            {fmtDate(h.date)} <span style={{ color: 'var(--text3)', fontSize: 11 }}>· {h.setCount}×</span>
                          </span>
                          <span style={{ ...cellStyle, textAlign: 'right' }}>{Math.round(h.avgWeight)}lbs</span>
                          <span style={{ ...cellStyle, textAlign: 'right' }}>{h.avgReps.toFixed(1)}</span>
                          <span style={{ ...cellStyle, textAlign: 'right' }}>{Math.round(h.volume)}</span>
                        </Fragment>
                      )
                    })}
                  </div>
                  {t.sessions > t.history.length && (
                    <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 8, fontStyle: 'italic' }}>
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
