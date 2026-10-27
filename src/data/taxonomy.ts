import rawTaxonomy from './taxonomy.json'

export interface TaxonomyEntry {
  code: string
  label: string
  color?: string
  order: number
}

interface Taxonomy {
  schools: Record<string, TaxonomyEntry>
  roles: Record<string, TaxonomyEntry>
  attacks: Record<string, TaxonomyEntry>
  armors: Record<string, TaxonomyEntry>
  positions: Record<string, TaxonomyEntry>
  squads: Record<string, TaxonomyEntry>
}

export const TAXONOMY = rawTaxonomy as unknown as Taxonomy

function byCode(entries: Record<string, TaxonomyEntry>): Map<string, TaxonomyEntry> {
  return new Map(Object.values(entries).map((entry) => [entry.code, entry]))
}

export const SCHOOL_BY_CODE = byCode(TAXONOMY.schools)
export const ROLE_BY_CODE = byCode(TAXONOMY.roles)
export const ATTACK_BY_CODE = byCode(TAXONOMY.attacks)
export const ARMOR_BY_CODE = byCode(TAXONOMY.armors)
export const POSITION_BY_CODE = byCode(TAXONOMY.positions)
export const SQUAD_BY_CODE = byCode(TAXONOMY.squads)

function sortedEntries(entries: Record<string, TaxonomyEntry>): TaxonomyEntry[] {
  return Object.values(entries).toSorted((left, right) => left.order - right.order)
}

export const SCHOOL_OPTIONS = sortedEntries(TAXONOMY.schools).map(({ code, label }) => ({
  value: code,
  label,
}))
export const ROLE_OPTIONS = sortedEntries(TAXONOMY.roles).map(({ code, label }) => ({
  value: code,
  label,
}))
export const ATTACK_OPTIONS = sortedEntries(TAXONOMY.attacks).map(({ code, label }) => ({
  value: code,
  label,
}))
export const ARMOR_OPTIONS = sortedEntries(TAXONOMY.armors).map(({ code, label }) => ({
  value: code,
  label,
}))
export const POSITION_OPTIONS = sortedEntries(TAXONOMY.positions).map(({ code, label }) => ({
  value: code,
  label,
}))
export const SQUAD_OPTIONS = sortedEntries(TAXONOMY.squads).map(({ code, label }) => ({
  value: code,
  label,
}))

export function taxonomyLabel(entries: Map<string, TaxonomyEntry>, code: string): string {
  return entries.get(code)?.label ?? code
}

export function taxonomyColor(entries: Map<string, TaxonomyEntry>, code: string): string {
  return entries.get(code)?.color ?? '#64748b'
}

export const schoolLabel = (code: string) => taxonomyLabel(SCHOOL_BY_CODE, code)
export const roleLabel = (code: string) => taxonomyLabel(ROLE_BY_CODE, code)
export const attackLabel = (code: string) => taxonomyLabel(ATTACK_BY_CODE, code)
export const armorLabel = (code: string) => taxonomyLabel(ARMOR_BY_CODE, code)
export const positionLabel = (code: string) => taxonomyLabel(POSITION_BY_CODE, code)
export const squadLabel = (code: string) => taxonomyLabel(SQUAD_BY_CODE, code)
