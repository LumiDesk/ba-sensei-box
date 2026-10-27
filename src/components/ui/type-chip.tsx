import type { CSSProperties } from 'react'
import './type-chip.scss'

export function TypeChip({ label, color }: { label: string; color: string }) {
  const style = { '--chip-color': color } as CSSProperties
  return (
    <span className="type-chip" style={style}>
      <span className="type-chip__dot" aria-hidden="true" />
      {label}
    </span>
  )
}
