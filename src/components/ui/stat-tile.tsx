import type { ReactNode } from 'react'
import './stat-tile.scss'

interface StatTileProps {
  label: string
  value: ReactNode
  hint?: string
  tone?: 'brand' | 'gold' | 'plain'
}

export function StatTile({ label, value, hint, tone = 'plain' }: StatTileProps) {
  return (
    <div className={`stat-tile stat-tile--${tone}`}>
      <span className="stat-tile__label">{label}</span>
      <span className="stat-tile__value">
        {value}
        {hint ? <small>{hint}</small> : null}
      </span>
    </div>
  )
}
