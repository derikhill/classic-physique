export default function SplitDayRow({
  day,
  index,
  total,
  onMove,
}: {
  day: string
  index: number
  total: number
  onMove: (index: number, dir: number) => void
}) {
  const isRest = day === 'Rest'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: isRest ? 'var(--text3)' : 'var(--text)' }}>{day}</div>
        <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-display)', letterSpacing: 1, textTransform: 'uppercase', marginTop: 1 }}>Day {index + 1}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <button className="btn-move" disabled={index === 0} onClick={() => onMove(index, -1)}>▲</button>
        <button className="btn-move" disabled={index === total - 1} onClick={() => onMove(index, 1)}>▼</button>
      </div>
    </div>
  )
}
