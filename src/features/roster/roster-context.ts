import { createContext } from 'react'
import type { Student } from '@/data/types'
import type { RosterMeta } from './roster-storage'

export interface RosterContextValue {
  selectedIds: ReadonlySet<number>
  selectedStudents: Student[]
  selectedCount: number
  meta: RosterMeta
  toggleStudent: (id: number) => void
  addStudents: (ids: Iterable<number>) => void
  clearRoster: () => void
  replaceRoster: (ids: Iterable<number>) => void
  updateMeta: (patch: Partial<RosterMeta>) => void
}

export const RosterContext = createContext<RosterContextValue | null>(null)
