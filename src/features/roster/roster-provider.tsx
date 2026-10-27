import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { STUDENTS, STUDENT_BY_ID } from '@/data/students'
import { RosterContext, type RosterContextValue } from './roster-context'
import {
  loadRosterMeta,
  loadSelectedIds,
  saveRosterMeta,
  saveSelectedIds,
  type RosterMeta,
} from './roster-storage'

function validIds(ids: Iterable<number>): Set<number> {
  return new Set([...ids].filter((id) => STUDENT_BY_ID.has(id)))
}

export function RosterProvider({ children }: { children: ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<number>>(() =>
    validIds(loadSelectedIds()),
  )
  const [meta, setMeta] = useState<RosterMeta>(() => loadRosterMeta())

  useEffect(() => {
    saveSelectedIds(selectedIds)
  }, [selectedIds])

  useEffect(() => {
    saveRosterMeta(meta)
  }, [meta])

  const value = useMemo<RosterContextValue>(() => {
    const selectedStudents = STUDENTS.filter((student) => selectedIds.has(student.id))
    return {
      selectedIds,
      selectedStudents,
      selectedCount: selectedStudents.length,
      meta,
      toggleStudent: (id: number) => {
        setSelectedIds((current) => {
          const next = new Set(current)
          if (next.has(id)) next.delete(id)
          else next.add(id)
          return next
        })
      },
      addStudents: (ids: Iterable<number>) => {
        setSelectedIds((current) => {
          const next = new Set(current)
          for (const id of ids) next.add(id)
          return next
        })
      },
      clearRoster: () => setSelectedIds(new Set()),
      replaceRoster: (ids: Iterable<number>) => setSelectedIds(validIds(ids)),
      updateMeta: (patch: Partial<RosterMeta>) => {
        setMeta((current) => ({ ...current, ...patch }))
      },
    }
  }, [selectedIds, meta])

  return <RosterContext.Provider value={value}>{children}</RosterContext.Provider>
}
