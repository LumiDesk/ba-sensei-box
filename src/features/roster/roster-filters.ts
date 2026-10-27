import { STUDENT_ALIASES } from '@/data/aliases'
import type { Student } from '@/data/types'
import {
  SCHOOL_BY_CODE,
  armorLabel,
  attackLabel,
  positionLabel,
  roleLabel,
  schoolLabel,
  squadLabel,
} from '@/data/taxonomy'

export type RosterRarityFilter = 'all' | '3' | 'low'
export type RosterView = 'all' | 'selected' | 'missing'
export type RosterSort = 'school' | 'rarity' | 'order'

export interface RosterFilters {
  search: string
  school: string | null
  role: string | null
  attack: string | null
  armor: string | null
  position: string | null
  squad: string | null
  rarity: RosterRarityFilter
  view: RosterView
  sort: RosterSort
}

export const DEFAULT_FILTERS: RosterFilters = {
  search: '',
  school: null,
  role: null,
  attack: null,
  armor: null,
  position: null,
  squad: null,
  rarity: 'all',
  view: 'all',
  sort: 'school',
}

export function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase().replaceAll(/\s+/g, '')
}

function searchBlob(student: Student): string {
  return normalizeSearch(
    [
      student.name,
      student.nameEn,
      student.tags.join(' '),
      (STUDENT_ALIASES[student.id] ?? []).join(' '),
      schoolLabel(student.school),
      roleLabel(student.role),
      attackLabel(student.attack),
      armorLabel(student.armor),
      positionLabel(student.position),
      squadLabel(student.squad),
    ].join(' '),
  )
}

export function filterStudents(
  students: readonly Student[],
  selectedIds: ReadonlySet<number>,
  filters: RosterFilters,
): Student[] {
  const search = normalizeSearch(filters.search)

  return students.filter((student) => {
    if (filters.school && student.school !== filters.school) return false
    if (filters.role && student.role !== filters.role) return false
    if (filters.attack && student.attack !== filters.attack) return false
    if (filters.armor && student.armor !== filters.armor) return false
    if (filters.position && student.position !== filters.position) return false
    if (filters.squad && student.squad !== filters.squad) return false
    if (filters.rarity === '3' && student.rarity !== 3) return false
    if (filters.rarity === 'low' && student.rarity === 3) return false
    if (filters.view === 'selected' && !selectedIds.has(student.id)) return false
    if (filters.view === 'missing' && selectedIds.has(student.id)) return false
    if (search && !searchBlob(student).includes(search)) return false
    return true
  })
}

export function sortStudents(students: readonly Student[], sort: RosterSort): Student[] {
  const copy = [...students]
  if (sort === 'rarity') {
    return copy.toSorted((left, right) => right.rarity - left.rarity || left.order - right.order)
  }
  return copy.toSorted((left, right) => left.order - right.order)
}

export interface StudentGroup {
  key: string
  label: string
  students: Student[]
}

export function groupStudentsBySchool(students: readonly Student[]): StudentGroup[] {
  const groups = new Map<string, Student[]>()
  for (const student of students) {
    const group = groups.get(student.school)
    if (group) group.push(student)
    else groups.set(student.school, [student])
  }

  return [...groups.entries()]
    .map(([key, group]) => ({
      key,
      label: schoolLabel(key),
      students: group.toSorted(
        (left, right) => right.rarity - left.rarity || left.order - right.order,
      ),
      order: SCHOOL_BY_CODE.get(key)?.order ?? 99,
    }))
    .toSorted((left, right) => left.order - right.order)
    .map(({ key, label, students: group }) => ({ key, label, students: group }))
}
