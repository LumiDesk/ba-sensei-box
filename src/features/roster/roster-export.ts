import { DATASET_META, STUDENTS } from '@/data/students'
import type { Student } from '@/data/types'
import {
  attackLabel,
  armorLabel,
  positionLabel,
  roleLabel,
  schoolLabel,
  squadLabel,
} from '@/data/taxonomy'
import { encodeRoster } from './roster-codec'
import type { RosterMeta } from './roster-storage'

export function datasetDate(): string {
  return DATASET_META.generatedAt.slice(0, 10)
}

function describeStudent(student: Student): string {
  return [
    `${student.name} / ${student.nameEn}`,
    schoolLabel(student.school),
    roleLabel(student.role),
    attackLabel(student.attack),
    armorLabel(student.armor),
    positionLabel(student.position),
    squadLabel(student.squad),
  ].join(' · ')
}

export function buildReadableRoster(students: readonly Student[]): string {
  const lines: string[] = []
  for (const rarity of [3, 2, 1] as const) {
    const group = students.filter((student) => student.rarity === rarity)
    if (group.length === 0) continue
    lines.push(`■ ${rarity}★（${group.length}）`)
    for (const student of group) lines.push(`- ${describeStudent(student)}`)
    lines.push('')
  }
  return lines.join('\n').trim()
}

export function buildFullExport(students: readonly Student[], meta: RosterMeta): string {
  const code = encodeRoster(new Set(students.map((student) => student.id)), STUDENTS)
  const threeStar = students.filter((student) => student.rarity === 3).length
  const lowStar = students.length - threeStar
  return [
    'SENSEI BOX · 蔚蓝档案国际服学生名单',
    `数据：SchaleDB · ${datasetDate()} · 国际服 ${DATASET_META.count} 人`,
    `目标：${meta.target || '未填写'}`,
    `账号等级：${meta.level ?? '未填写'}`,
    `备注：${meta.notes.trim() || '无'}`,
    `已选：${students.length} / ${DATASET_META.count}（3★ ${threeStar} / 1–2★ ${lowStar}）`,
    '',
    '【名单码】',
    code,
    '',
    '【名单】',
    buildReadableRoster(students),
  ].join('\n')
}

export function buildJsonExport(students: readonly Student[], meta: RosterMeta): string {
  const code = encodeRoster(new Set(students.map((student) => student.id)), STUDENTS)
  return `${JSON.stringify(
    {
      app: 'ba-sensei-box',
      version: 1,
      exportedAt: new Date().toISOString(),
      dataset: DATASET_META,
      answers: meta,
      roster: {
        code,
        count: students.length,
        ids: students.map((student) => student.id),
        students: students.map((student) => ({
          id: student.id,
          name: student.name,
          nameEn: student.nameEn,
          school: student.school,
          rarity: student.rarity,
          role: student.role,
          attack: student.attack,
          armor: student.armor,
          position: student.position,
          squad: student.squad,
        })),
      },
    },
    null,
    2,
  )}\n`
}
