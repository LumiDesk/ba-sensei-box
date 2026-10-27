import { describe, expect, it } from 'vitest'
import { STUDENTS, DATASET_META } from './students'
import {
  ARMOR_BY_CODE,
  ATTACK_BY_CODE,
  POSITION_BY_CODE,
  ROLE_BY_CODE,
  SCHOOL_BY_CODE,
  SQUAD_BY_CODE,
} from './taxonomy'

describe('student dataset', () => {
  it('contains the expected Global roster', () => {
    expect(DATASET_META.region).toBe('global')
    expect(STUDENTS.length).toBeGreaterThanOrEqual(260)
    expect(DATASET_META.count).toBe(STUDENTS.length)
  })

  it('has unique ids and stable orders', () => {
    expect(new Set(STUDENTS.map((student) => student.id)).size).toBe(STUDENTS.length)
    expect(new Set(STUDENTS.map((student) => student.order)).size).toBe(STUDENTS.length)
    expect(STUDENTS[0]?.order).toBe(0)
  })

  it('maps every taxonomy code used by the dataset', () => {
    for (const student of STUDENTS) {
      expect(SCHOOL_BY_CODE.has(student.school), student.name).toBe(true)
      expect(ROLE_BY_CODE.has(student.role), student.name).toBe(true)
      expect(ATTACK_BY_CODE.has(student.attack), student.name).toBe(true)
      expect(ARMOR_BY_CODE.has(student.armor), student.name).toBe(true)
      expect(POSITION_BY_CODE.has(student.position), student.name).toBe(true)
      expect(SQUAD_BY_CODE.has(student.squad), student.name).toBe(true)
      expect([1, 2, 3]).toContain(student.rarity)
      expect(student.icon).toMatch(/^students\/icons\/\d+\.webp$/)
    }
  })
})
