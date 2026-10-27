export type StudentRarity = 1 | 2 | 3

export interface Student {
  id: number
  order: number
  name: string
  nameEn: string
  school: string
  rarity: StudentRarity
  role: string
  attack: string
  armor: string
  position: string
  squad: string
  icon: string
  tags: string[]
}

export interface StudentDatasetMeta {
  source: string
  sourceUrl: string
  region: 'global'
  generatedAt: string
  count: number
  codecVersion: number
}

export interface StudentDataset {
  meta: StudentDatasetMeta
  students: Student[]
}
