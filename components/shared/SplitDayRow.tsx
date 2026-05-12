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
    <div className="flex items-center gap-2 border-b py-[7px]" style={{ borderColor: 'var(--border)' }}>
      <div className="flex-1">
        <div className="text-[13px] font-semibold" style={{ color: isRest ? 'var(--text3)' : 'var(--text)' }}>{day}</div>
        <div className="mt-px text-[10px] uppercase tracking-[1px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--text3)' }}>Day {index + 1}</div>
      </div>
      <div className="flex flex-col gap-0.5">
        <button className="btn-move" disabled={index === 0} onClick={() => onMove(index, -1)}>▲</button>
        <button className="btn-move" disabled={index === total - 1} onClick={() => onMove(index, 1)}>▼</button>
      </div>
    </div>
  )
}
