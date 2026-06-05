'use client'

import { MUSCLES, type MuscleKey } from '@/lib/constants'

export default function MuscleChips({
  selected,
  onChange,
  max = 4,
}: {
  selected: MuscleKey[]
  onChange: (next: MuscleKey[]) => void
  max?: number
}) {
  const toggle = (m: MuscleKey) => {
    if (selected.includes(m)) {
      onChange(selected.filter(x => x !== m))
    } else {
      if (selected.length >= max) return
      onChange([...selected, m])
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {(Object.entries(MUSCLES) as [MuscleKey, { label: string; priority: boolean }][]).map(([k, v]) => {
        const idx = selected.indexOf(k)
        const isSelected = idx !== -1
        const isPrimary = idx === 0
        const maxed = !isSelected && selected.length >= max
        return (
          <button
            key={k}
            type="button"
            onClick={() => !maxed && toggle(k)}
            disabled={maxed}
            className="rounded border px-2 py-1 text-xs"
            style={{
              cursor: maxed ? 'default' : 'pointer',
              borderColor: isPrimary ? 'var(--accent)' : isSelected ? 'var(--accent2)' : 'var(--border)',
              background: isPrimary ? '#0a1400' : isSelected ? '#1a0d00' : 'var(--surface2)',
              color: isPrimary ? 'var(--accent)' : isSelected ? 'var(--accent2)' : maxed ? 'var(--text3)' : 'var(--text2)',
              opacity: maxed ? 0.5 : 1,
            }}
          >
            {isPrimary && <span className="mr-0.5">★</span>}
            {v.label}
          </button>
        )
      })}
    </div>
  )
}
