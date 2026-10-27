import rawDataset from './students.generated.json'
import type { Student, StudentDataset } from './types'

export const DATASET = rawDataset as unknown as StudentDataset

/** Stable display/codec order. `order` is append-only across data syncs. */
export const STUDENTS: readonly Student[] = [...DATASET.students].toSorted(
  (left, right) => left.order - right.order,
)

export const STUDENT_BY_ID = new Map(STUDENTS.map((student) => [student.id, student]))

export const DATASET_META = DATASET.meta

export function studentIconUrl(student: Student): string {
  return `${import.meta.env.BASE_URL}${student.icon}`
}
