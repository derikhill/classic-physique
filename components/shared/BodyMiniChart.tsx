import type { BodyEntry } from '@/lib/utils'

export default function BodyMiniChart({
  entries,
  field,
  color,
  label,
  unit,
}: {
  entries: BodyEntry[]
  field: 'weight' | 'bf'
  color: string
  label: string
  unit: string
}) {
  if (!entries || entries.length < 2) return null
  const data = entries.slice(-28).filter(e => e[field])
  if (data.length < 2) return null
  const vals = data.map(e => parseFloat(e[field] as string))
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const range = max - min || 0.1
  const W = 200, H = 48
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * W
    const y = H - ((v - min) / range) * (H - 6) - 3
    return `${x},${y}`
  })
  const latest = vals[vals.length - 1]
  const prev = vals[vals.length - 2]
  const delta = latest - prev
  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: 1, color: 'var(--text3)', textTransform: 'uppercase' }}>{label}</div>
          <div style={{ fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 900, color, lineHeight: 1.1, marginTop: 2 }}>
            {latest.toFixed(1)}{unit}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: delta < 0 ? 'var(--accent)' : delta > 0 ? 'var(--red)' : 'var(--text3)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
            {delta > 0 ? '+' : ''}{delta.toFixed(1)}{unit} last entry
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>{data.length} entries</div>
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={parseFloat(pts[pts.length - 1].split(',')[0])} cy={parseFloat(pts[pts.length - 1].split(',')[1])} r="3" fill={color} />
      </svg>
    </div>
  )
}
