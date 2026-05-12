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
    <div className="rounded-md border px-3 py-2.5" style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}>
      <div className="mb-2 flex items-start justify-between">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[1px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--text3)' }}>{label}</div>
          <div className="mt-0.5 text-[22px] font-black leading-[1.1]" style={{ fontFamily: 'var(--font-display)', color }}>
            {latest.toFixed(1)}{unit}
          </div>
        </div>
        <div className="text-right">
          <div
            className="font-bold"
            style={{
              fontFamily: 'var(--font-display)',
              color: delta < 0 ? 'var(--accent)' : delta > 0 ? 'var(--red)' : 'var(--text3)',
            }}
          >
            {delta > 0 ? '+' : ''}{delta.toFixed(1)}{unit} last entry
          </div>
          <div className="text-[11px]" style={{ color: 'var(--text3)' }}>{data.length} entries</div>
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="block">
        <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={parseFloat(pts[pts.length - 1].split(',')[0])} cy={parseFloat(pts[pts.length - 1].split(',')[1])} r="3" fill={color} />
      </svg>
    </div>
  )
}
