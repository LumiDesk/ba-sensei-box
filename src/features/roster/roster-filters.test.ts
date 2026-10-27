import { describe, expect, it } from 'vitest'
import { STUDENTS } from '@/data/students'
import {
  DEFAULT_FILTERS,
  filterStudents,
  groupStudentsBySchool,
  type RosterFilters,
} from './roster-filters'

const noSelection = new Set<number>()

function withFilters(patch: Partial<RosterFilters>): RosterFilters {
  return { ...DEFAULT_FILTERS, ...patch }
}

describe('roster filters', () => {
  it('groups schools in taxonomy order', () => {
    const groups = groupStudentsBySchool(STUDENTS)
    expect(groups[0]?.label).toBe('阿拜多斯')
    expect(groups[1]?.label).toBe('格黑娜')
  })

  it('finds students by community alias', () => {
    const result = filterStudents(STUDENTS, noSelection, withFilters({ search: '水星野' }))
    expect(result.map((student) => student.id)).toContain(10045)
  })

  it('filters by rarity and ownership', () => {
    const selected = new Set([10000])
    const result = filterStudents(
      STUDENTS,
      selected,
      withFilters({ rarity: '3', view: 'selected' }),
    )
    expect(result).toHaveLength(1)
    expect(result[0]?.id).toBe(10000)
  })

  it('finds students by English name and school label', () => {
    const english = filterStudents(STUDENTS, noSelection, withFilters({ search: 'shiroko' }))
    expect(english.length).toBeGreaterThan(1)
    const school = filterStudents(STUDENTS, noSelection, withFilters({ search: '阿拜多斯' }))
    expect(school.every((student) => student.school === 'abydos')).toBe(true)
  })
})
