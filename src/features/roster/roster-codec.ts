import type { Student } from '@/data/types'

export const ROSTER_CODE_PREFIX = 'SB1'

const CHECKSUM_MOD = 256
const CHECKSUM_MULTIPLIER = 31

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/')
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}

function checksum(bytes: Uint8Array): number {
  let hash = 0
  for (const byte of bytes) {
    hash = (hash * CHECKSUM_MULTIPLIER + byte) % CHECKSUM_MOD
  }
  return hash
}

function buildOrderIndex(students: readonly Student[]): {
  orderToId: Map<number, number>
  byteLength: number
} {
  const orderToId = new Map<number, number>()
  let maxOrder = -1
  for (const student of students) {
    if (!Number.isInteger(student.order) || student.order < 0) {
      throw new Error(`Invalid student order for ${student.id}`)
    }
    if (orderToId.has(student.order)) {
      throw new Error(`Duplicate student order ${student.order}`)
    }
    orderToId.set(student.order, student.id)
    maxOrder = Math.max(maxOrder, student.order)
  }
  return { orderToId, byteLength: Math.max(1, Math.ceil((maxOrder + 1) / 8)) }
}

/**
 * Encode selected ids as a stable bit set over `student.order`.
 * Layout: [version prefix]-[base64url(bitset + checksum)].
 */
export function encodeRoster(
  selectedIds: ReadonlySet<number>,
  students: readonly Student[],
): string {
  const { orderToId, byteLength } = buildOrderIndex(students)
  const knownIds = new Set(orderToId.values())
  for (const id of selectedIds) {
    if (!knownIds.has(id)) throw new Error(`Unknown student id ${id}`)
  }

  const bytes = new Uint8Array(byteLength + 1)
  for (const [order, id] of orderToId) {
    if (!selectedIds.has(id)) continue
    const byteIndex = Math.floor(order / 8)
    const bitIndex = order % 8
    bytes[byteIndex] |= 1 << bitIndex
  }
  bytes[byteLength] = checksum(bytes.subarray(0, byteLength))
  return `${ROSTER_CODE_PREFIX}-${toBase64Url(bytes)}`
}

export interface DecodedRoster {
  ids: Set<number>
  /** Orders that are present in the code but unknown to this dataset version. */
  unknownOrders: number[]
}

/** Decode a roster code; throws a user-facing Error when the code is invalid. */
export function decodeRoster(code: string, students: readonly Student[]): DecodedRoster {
  const normalized = code.trim().replaceAll(/\s+/g, '')
  if (!normalized) throw new Error('请先粘贴名单码。')
  if (!normalized.startsWith(`${ROSTER_CODE_PREFIX}-`)) {
    throw new Error(`名单码需要以 ${ROSTER_CODE_PREFIX}- 开头。`)
  }

  const payload = normalized.slice(ROSTER_CODE_PREFIX.length + 1)
  if (!/^[A-Za-z0-9_-]+$/.test(payload)) {
    throw new Error('名单码包含不支持的字符。')
  }

  let bytes: Uint8Array
  try {
    bytes = fromBase64Url(payload)
  } catch {
    throw new Error('名单码不是合法的 Base64URL 文本。')
  }
  if (bytes.length < 2) throw new Error('名单码长度不足。')

  const body = bytes.subarray(0, bytes.length - 1)
  if (checksum(body) !== bytes[bytes.length - 1]) {
    throw new Error('名单码校验失败，可能复制时漏掉了字符。')
  }

  const { orderToId } = buildOrderIndex(students)
  const ids = new Set<number>()
  const unknownOrders: number[] = []
  for (let order = 0; order < body.length * 8; order += 1) {
    const bit = (body[Math.floor(order / 8)] >> (order % 8)) & 1
    if (!bit) continue
    const id = orderToId.get(order)
    if (id === undefined) {
      unknownOrders.push(order)
    } else {
      ids.add(id)
    }
  }

  return { ids, unknownOrders }
}
