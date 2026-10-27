#!/usr/bin/env node
/**
 * Sync the Global roster and student icons from SchaleDB.
 *
 * Usage:
 *   pnpm data:sync            # fetch metadata, keep existing icons
 *   pnpm data:sync -- --force # re-download every icon
 *
 * The output is committed on purpose: the site must work offline.
 */
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DATA_FILE = path.join(ROOT, 'src', 'data', 'students.generated.json')
const TAXONOMY_FILE = path.join(ROOT, 'src', 'data', 'taxonomy.json')
const ICON_DIR = path.join(ROOT, 'public', 'students', 'icons')

const SOURCE_URL = 'https://schaledb.com/'
const REGION_INDEX = 1 // SchaleDB IsReleased: [JP, Global, CN]
const LOCALES = {
  zh: 'https://schaledb.com/data/zh/students.min.json',
  en: 'https://schaledb.com/data/en/students.min.json',
}
const ICON_URL = (id) => `https://schaledb.com/images/student/icon/${id}.webp`
const USER_AGENT = 'ba-sensei-box/0.1 (+https://github.com/Talyra42/ba-sensei-box)'

const forceIcons = process.argv.includes('--force')

function log(message) {
  process.stdout.write(`${message}\n`)
}

function fail(message) {
  process.stderr.write(`\n[data:sync] ${message}\n`)
  process.exit(1)
}

async function fetchWithRetry(url, options = {}, attempts = 3) {
  let lastError
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'user-agent': USER_AGENT,
          ...options.headers,
        },
        signal: AbortSignal.timeout(30_000),
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`)
      }
      return response
    } catch (error) {
      lastError = error
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 800))
      }
    }
  }
  throw new Error(`Failed to fetch ${url}: ${lastError?.message ?? lastError}`)
}

async function fetchJson(url) {
  const response = await fetchWithRetry(url)
  return response.json()
}

async function readJsonIfExists(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') return null
    throw error
  }
}

async function fileExists(file) {
  try {
    await access(file)
    return true
  } catch {
    return false
  }
}

function assertTaxonomy(taxonomy) {
  for (const group of ['schools', 'roles', 'attacks', 'armors', 'positions', 'squads']) {
    if (!taxonomy[group] || typeof taxonomy[group] !== 'object') {
      fail(`taxonomy.json is missing the "${group}" group`)
    }
  }
}

function mapEnum(taxonomy, group, rawValue, student) {
  const entry = taxonomy[group][rawValue]
  if (!entry?.code) {
    fail(
      `Unknown ${group} value "${rawValue}" for ${student.Id} (${student.Name}). ` +
        `Add it to src/data/taxonomy.json first.`,
    )
  }
  return entry.code
}

function normalizeStudent(student, english, taxonomy) {
  const name = String(student.Name ?? '').trim()
  const nameEn = String(english?.Name ?? '').trim()
  if (!name && !nameEn) return null

  return {
    id: student.Id,
    order: -1,
    name: name || nameEn,
    nameEn: nameEn || name,
    school: mapEnum(taxonomy, 'schools', student.School, student),
    rarity: Number(student.StarGrade),
    role: mapEnum(taxonomy, 'roles', student.TacticRole, student),
    attack: mapEnum(taxonomy, 'attacks', student.BulletType, student),
    armor: mapEnum(taxonomy, 'armors', student.ArmorType, student),
    position: mapEnum(taxonomy, 'positions', student.Position, student),
    squad: mapEnum(taxonomy, 'squads', student.SquadType, student),
    icon: `students/icons/${student.Id}.webp`,
    tags: Array.isArray(student.SearchTags)
      ? student.SearchTags.filter((tag) => typeof tag === 'string' && tag.trim()).map((tag) => tag.trim())
      : [],
  }
}

async function downloadIcon(id) {
  const destination = path.join(ICON_DIR, `${id}.webp`)
  if (!forceIcons && (await fileExists(destination))) {
    const stats = await readFile(destination)
    if (stats.length > 512) return 'skipped'
  }

  const response = await fetchWithRetry(ICON_URL(id))
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('image/webp')) {
    throw new Error(`Unexpected content type for ${id}: ${contentType || '(none)'}`)
  }
  const bytes = Buffer.from(await response.arrayBuffer())
  if (bytes.length < 512 || bytes.subarray(0, 4).toString('ascii') !== 'RIFF') {
    throw new Error(`Invalid WebP payload for student ${id}`)
  }
  await writeFile(destination, bytes)
  return 'downloaded'
}

async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length)
  let cursor = 0
  async function run() {
    while (cursor < items.length) {
      const index = cursor
      cursor += 1
      results[index] = await worker(items[index], index)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run))
  return results
}

async function main() {
  log('Reading taxonomy...')
  const taxonomy = JSON.parse(await readFile(TAXONOMY_FILE, 'utf8'))
  assertTaxonomy(taxonomy)

  log('Fetching SchaleDB roster (zh + en)...')
  const [zh, en] = await Promise.all([fetchJson(LOCALES.zh), fetchJson(LOCALES.en)])
  const englishById = new Map(Object.values(en).map((student) => [student.Id, student]))

  const globalStudents = Object.values(zh).filter(
    (student) => Array.isArray(student.IsReleased) && student.IsReleased[REGION_INDEX] === true,
  )
  if (globalStudents.length < 250) {
    fail(`Only ${globalStudents.length} Global students returned; expected 250+.`)
  }

  // SchaleDB can expose two rows for one playable student (for example
  // Hoshino (Armed) CH0258_01/_02). Keep the lower id, which is the row used by
  // the Global client, and report every dropped duplicate.
  const byName = new Map()
  const dropped = []
  for (const student of globalStudents.sort((a, b) => a.Id - b.Id)) {
    const key = String(student.Name ?? '').trim()
    if (byName.has(key)) {
      dropped.push(`${key} (${student.Id})`)
      continue
    }
    byName.set(key, student)
  }
  if (dropped.length > 0) {
    log(`Dropped duplicate roster rows: ${dropped.join(', ')}`)
  }

  const previous = await readJsonIfExists(DATA_FILE)
  const previousOrder = new Map(
    (previous?.students ?? []).map((student) => [Number(student.id), Number(student.order)]),
  )
  const usedOrders = new Set(previousOrder.values())
  let nextOrder = usedOrders.size > 0 ? Math.max(...usedOrders) + 1 : 0

  const students = []
  for (const student of byName.values()) {
    const mapped = normalizeStudent(student, englishById.get(student.Id), taxonomy)
    if (!mapped) {
      log(`Skipping ${student.Id}: no localized name`)
      continue
    }
    const existingOrder = previousOrder.get(mapped.id)
    mapped.order = existingOrder ?? nextOrder
    if (existingOrder === undefined) nextOrder += 1
    students.push(mapped)
  }

  students.sort((a, b) => a.order - b.order)
  if (new Set(students.map((student) => student.order)).size !== students.length) {
    fail('Duplicate order values detected; refusing to write an unstable roster codec.')
  }
  if (new Set(students.map((student) => student.id)).size !== students.length) {
    fail('Duplicate student ids detected.')
  }

  const payload = {
    meta: {
      source: 'SchaleDB',
      sourceUrl: SOURCE_URL,
      region: 'global',
      generatedAt: new Date().toISOString(),
      count: students.length,
      codecVersion: 1,
    },
    students,
  }

  await mkdir(path.dirname(DATA_FILE), { recursive: true })
  await writeFile(DATA_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  log(`Wrote ${students.length} students to src/data/students.generated.json`)

  await mkdir(ICON_DIR, { recursive: true })
  log(`Syncing ${students.length} icons${forceIcons ? ' (forced)' : ''}...`)
  let downloaded = 0
  let skipped = 0
  const failures = []
  await mapWithConcurrency(students, 8, async (student) => {
    try {
      const result = await downloadIcon(student.id)
      if (result === 'downloaded') downloaded += 1
      else skipped += 1
    } catch (error) {
      failures.push(`${student.id} (${student.nameEn}): ${error.message}`)
    }
    if ((downloaded + skipped + failures.length) % 40 === 0) {
      log(`  ...${downloaded + skipped + failures.length}/${students.length}`)
    }
  })

  log(`Icons: ${downloaded} downloaded, ${skipped} already present, ${failures.length} failed`)
  if (failures.length > 0) {
    fail(`Icon sync incomplete:\n  ${failures.join('\n  ')}`)
  }
  log('Done.')
}

main().catch((error) => fail(error.stack ?? String(error)))
