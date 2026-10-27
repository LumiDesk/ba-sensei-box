import { describe, expect, it } from 'vitest'
import { STUDENTS } from '@/data/students'
import type { Student } from '@/data/types'
import { decodeRoster, encodeRoster } from './roster-codec'

function student(id: number, order: number): Student {
  return {
    id,
    order,
    name: `学生${id}`,
    nameEn: `Student ${id}`,
    school: 'abydos',
    rarity: 3,
    role: 'dealer',
    attack: 'explosion',
    armor: 'light',
    position: 'back',
    squad: 'main',
    icon: `students/icons/${id}.webp`,
    tags: [],
  }
}

const roster = [
  student(100, 0),
  student(101, 1),
  student(102, 2),
  student(103, 9),
  student(104, 10),
]

describe('roster codec', () => {
  it('round-trips an empty roster', () => {
    const code = encodeRoster(new Set(), roster)
    expect(code.startsWith('SB1-')).toBe(true)
    expect(decodeRoster(code, roster).ids.size).toBe(0)
  })

  it('round-trips selected students including sparse orders', () => {
    const selected = new Set([100, 103])
    const decoded = decodeRoster(encodeRoster(selected, roster), roster)
    expect([...decoded.ids].toSorted()).toEqual([100, 103])
    expect(decoded.unknownOrders).toEqual([])
  })

  it('round-trips the whole roster', () => {
    const selected = new Set(roster.map((item) => item.id))
    expect(decodeRoster(encodeRoster(selected, roster), roster).ids.size).toBe(roster.length)
  })

  it('rejects another version prefix', () => {
    expect(() => decodeRoster('SB2-abc', roster)).toThrow(/SB1-/)
  })

  it('rejects a modified payload', () => {
    const code = encodeRoster(new Set([100, 101]), roster)
    const tampered = `${code.slice(0, -1)}${code.endsWith('A') ? 'B' : 'A'}`
    expect(() => decodeRoster(tampered, roster)).toThrow()
  })

  it('ignores bits for orders this dataset does not know yet', () => {
    const newerRoster = [...roster, student(105, 40)]
    const code = encodeRoster(new Set([105]), newerRoster)
    const decoded = decodeRoster(code, roster)
    expect(decoded.ids.size).toBe(0)
    expect(decoded.unknownOrders).toEqual([40])
  })

  it('rejects unknown ids during encoding', () => {
    expect(() => encodeRoster(new Set([999]), roster)).toThrow(/Unknown student id/)
  })

  it('round-trips the real dataset with a single selected student', () => {
    const code = encodeRoster(new Set([10000]), STUDENTS)
    const decoded = decodeRoster(code, STUDENTS)
    expect([...decoded.ids]).toEqual([10000])
    expect(code.length).toBeLessThan(60)
  })
})
