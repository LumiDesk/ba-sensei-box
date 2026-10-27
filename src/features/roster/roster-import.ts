import type { Student } from '@/data/types'
import { decodeRoster } from './roster-codec'

export interface ImportResult {
  ids: number[]
  source: 'code' | 'json'
  warnings: string[]
}

function parseJsonImport(text: string, students: readonly Student[]): ImportResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('JSON 格式无法解析，请检查是否复制完整。')
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('JSON 里没有找到学生名单。')
  }

  const record = parsed as Record<string, unknown>
  const roster =
    typeof record.roster === 'object' && record.roster !== null ? record.roster : record
  const rosterRecord = roster as Record<string, unknown>

  let ids: unknown[] = []
  if (Array.isArray(rosterRecord.ids)) ids = rosterRecord.ids
  else if (Array.isArray(record.selectedIds)) ids = record.selectedIds
  else if (Array.isArray(rosterRecord.students)) {
    ids = rosterRecord.students.map((item) => {
      if (typeof item === 'number') return item
      if (typeof item === 'string') return Number(item)
      if (typeof item === 'object' && item !== null) {
        const student = item as Record<string, unknown>
        return student.id ?? student.Id
      }
      return Number.NaN
    })
  }

  const validIds = new Set(students.map((student) => student.id))
  const known: number[] = []
  let unknownCount = 0
  for (const value of ids) {
    const id = Number(value)
    if (!Number.isInteger(id)) continue
    if (validIds.has(id)) known.push(id)
    else unknownCount += 1
  }

  if (known.length === 0 && unknownCount === 0) {
    throw new Error('JSON 里没有可识别的学生 id。')
  }

  const warnings: string[] = []
  if (unknownCount > 0) {
    warnings.push(`JSON 中有 ${unknownCount} 个当前数据未收录的学生，已忽略。`)
  }
  return { ids: [...new Set(known)], source: 'json', warnings }
}

export function parseRosterInput(text: string, students: readonly Student[]): ImportResult {
  const trimmed = text.trim()
  if (!trimmed) throw new Error('请先粘贴名单码或 JSON。')

  if (trimmed.startsWith('{')) return parseJsonImport(trimmed, students)

  const decoded = decodeRoster(trimmed, students)
  const warnings: string[] = []
  if (decoded.unknownOrders.length > 0) {
    warnings.push(`名单码包含 ${decoded.unknownOrders.length} 个当前数据未收录的学生，已忽略。`)
  }
  return { ids: [...decoded.ids], source: 'code', warnings }
}
