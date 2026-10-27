import { useContext } from 'react'
import { RosterContext } from './roster-context'

export function useRoster() {
  const context = useContext(RosterContext)
  if (!context) throw new Error('useRoster must be used inside <RosterProvider>')
  return context
}
