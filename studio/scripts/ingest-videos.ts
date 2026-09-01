import { createClient } from '@sanity/client'
import { config } from 'dotenv'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import youtubedl from 'youtube-dl-exec'
import videos from './seed/videos.json'

config({ path: '.env.local' })

const CHUNK_SECONDS = 20

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET
const token = process.env.SANITY_STUDIO_WRITE_TOKEN

if (!projectId || !dataset || !token) {
  console.error(
    'Missing SANITY_STUDIO_PROJECT_ID, SANITY_STUDIO_DATASET, or SANITY_STUDIO_WRITE_TOKEN in the environment.',
  )
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2025-08-15',
  useCdn: false,
})

type Chapter = { startSeconds: number; label: string }
type Chunk = { startSeconds: number; text: string }
type Fragment = { startSeconds: number; text: string }

function timeToSeconds(t: string): number {
  const [h, m, s] = t.split(':')
  return Number(h) * 3600 + Number(m) * 60 + Number(s)
}

function wordArraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
  return true
}

// YouTube auto-caption VTT is "roll-up" style: each cue shows a sliding
// window of the last couple of lines, so older words scroll out of a cue's
// text before it settles. This strips the <c>/timing markup from each cue's
// text, then finds the longest overlap between the end of the transcript
// accumulated so far and the start of the current cue — only the words past
// that overlap are new and get appended, so nothing is duplicated even when
// a cue's visible window has dropped earlier words a plain prefix diff would
// have expected to see.
function parseAutoCaptionVtt(vtt: string): Fragment[] {
  const fragments: Fragment[] = []
  const blocks = vtt.split(/\n\s*\n/)
  const cueTimeRe = /^(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/
  let fullWords: string[] = []

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim())
    const match = cueTimeRe.exec(lines[0] ?? '')
    if (!match) continue
    const startSeconds = timeToSeconds(match[1])

    const text = lines
      .slice(1)
      .join(' ')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    if (!text) continue

    const cueWords = text.split(' ')
    const maxOverlap = Math.min(fullWords.length, cueWords.length)
    let overlap = 0
    for (let k = maxOverlap; k > 0; k--) {
      if (wordArraysEqual(fullWords.slice(-k), cueWords.slice(0, k))) {
        overlap = k
        break
      }
    }

    const newWords = cueWords.slice(overlap)
    if (newWords.length > 0) {
      fragments.push({ startSeconds, text: newWords.join(' ') })
      fullWords.push(...newWords)
    }
  }

  return fragments
}

function chunkFragments(fragments: Fragment[]): Chunk[] {
  if (fragments.length === 0) return []
  const chunks: Chunk[] = []
  let windowStart = Math.floor(fragments[0].startSeconds / CHUNK_SECONDS) * CHUNK_SECONDS
  let buffer: string[] = []

  for (const fragment of fragments) {
    if (fragment.startSeconds >= windowStart + CHUNK_SECONDS) {
      if (buffer.length > 0) chunks.push({ startSeconds: windowStart, text: buffer.join(' ') })
      windowStart = Math.floor(fragment.startSeconds / CHUNK_SECONDS) * CHUNK_SECONDS
      buffer = []
    }
    buffer.push(fragment.text)
  }
  if (buffer.length > 0) chunks.push({ startSeconds: windowStart, text: buffer.join(' ') })
  return chunks
}

async function ingestOne(youtubeId: string): Promise<{ chapters: Chapter[]; chunks: Chunk[] }> {
  const url = `https://www.youtube.com/watch?v=${youtubeId}`

  const info: any = await youtubedl(url, {
    dumpSingleJson: true,
    skipDownload: true,
    noWarnings: true,
  })

  const chapters: Chapter[] = (info.chapters ?? []).map((c: any) => ({
    startSeconds: Math.round(c.start_time),
    label: c.title,
  }))

  let chunks: Chunk[] = []
  const workDir = mkdtempSync(path.join(tmpdir(), 'vertex-ingest-'))
  try {
    const outputTemplate = path.join(workDir, 'sub.%(ext)s')
    await youtubedl(url, {
      skipDownload: true,
      writeAutoSub: true,
      subLang: 'en',
      subFormat: 'vtt',
      output: outputTemplate,
      noWarnings: true,
    })
    const vttPath = path.join(workDir, 'sub.en.vtt')
    const vtt = readFileSync(vttPath, 'utf-8')
    chunks = chunkFragments(parseAutoCaptionVtt(vtt))
  } catch {
    // No English auto-captions for this video — chunks stays empty, chapters still work.
  } finally {
    rmSync(workDir, { recursive: true, force: true })
  }

  return { chapters, chunks }
}

async function main() {
  const entries = Object.values(videos as Record<string, { id: string }>)
  const seenIds = new Set<string>()
  const failures: { id: string; error: string }[] = []
  let processed = 0

  for (const entry of entries) {
    const youtubeId = entry.id
    if (seenIds.has(youtubeId)) continue
    seenIds.add(youtubeId)

    try {
      const { chapters, chunks } = await ingestOne(youtubeId)
      await client.createOrReplace({
        _id: `video.${youtubeId}`,
        _type: 'video',
        id: youtubeId,
        url: `https://www.youtube.com/watch?v=${youtubeId}`,
        chapters,
        chunks,
      })
      processed++
      console.log(
        `[ok] ${youtubeId} — ${chapters.length} chapters, ${chunks.length} chunks (${processed}/${seenIds.size})`,
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      failures.push({ id: youtubeId, error: message })
      console.error(`[fail] ${youtubeId} — ${message}`)
    }

    // Be polite to YouTube across ~120 sequential requests.
    await new Promise((r) => setTimeout(r, 500))
  }

  console.log(`\nDone. ${processed}/${seenIds.size} videos ingested.`)
  if (failures.length > 0) {
    console.log(`${failures.length} failure(s):`)
    for (const f of failures) console.log(`  - ${f.id}: ${f.error}`)
    process.exitCode = 1
  }
}

main()
