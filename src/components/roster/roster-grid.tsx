import { Empty } from 'antd'
import { useMemo } from 'react'
import type { Student } from '@/data/types'
import {
  groupStudentsBySchool,
  sortStudents,
  type RosterSort,
} from '@/features/roster/roster-filters'
import { StudentCard } from './student-card'
import './roster-grid.scss'

interface RosterGridProps {
  students: Student[]
  selectedIds: ReadonlySet<number>
  sort: RosterSort
  onToggle: (id: number) => void
}

export function RosterGrid({ students, selectedIds, sort, onToggle }: RosterGridProps) {
  const groups = useMemo(() => {
    if (students.length === 0) return []
    if (sort === 'school') return groupStudentsBySchool(students)
    return [{ key: 'all', label: '', students: sortStudents(students, sort) }]
  }, [students, sort])

  if (students.length === 0) {
    return (
      <div className="roster-grid__empty">
        <Empty description="没有符合筛选条件的学生，换个条件试试。" />
      </div>
    )
  }

  return (
    <div className="roster-grid" aria-live="polite">
      {groups.map((group) => (
        <section className="roster-grid__section" key={group.key}>
          {group.label ? (
            <header className="roster-grid__heading">
              <h2>{group.label}</h2>
              <span>{group.students.length}</span>
            </header>
          ) : null}
          <div className="roster-grid__cards">
            {group.students.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                selected={selectedIds.has(student.id)}
                onToggle={onToggle}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
