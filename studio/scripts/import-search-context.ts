import { createClient } from '@sanity/client'
import { config } from 'dotenv'

config({ path: '.env.local' })

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET
const token = process.env.VERTEX_SANITY_WRITE_TOKEN
if (!projectId || !dataset || !token) {
  throw new Error('Set SANITY_STUDIO_PROJECT_ID, SANITY_STUDIO_DATASET, and VERTEX_SANITY_WRITE_TOKEN in studio/.env.local')
}

const client = createClient({ projectId, dataset, token, apiVersion: '2026-09-01', useCdn: false })

const context = {
  _id: 'vertex-search-context',
  _type: 'sanity.agentContext',
  name: 'Vertex Search',
  slug: { _type: 'slug', current: 'vertex-search' },
  groqFilter: '_type in ["course", "lesson", "video", "instructor", "category"] && !(_id in path("drafts.**"))',
  instructions: [
    'Search both lesson topics and video moments. A module is embedded in a course; its lessons are references. Derive module and lesson numbers from ordered arrays.',
    'Search each meaningful query token with its own wildcard pattern and OR them. Do not match the entire phrase as one pattern. Use pt::text(notes) for Portable Text.',
    'For video moments, search chapter labels first; search short timestamped transcript chunks only if no chapter matches in that video. Never fetch whole transcripts or unfiltered chunks arrays.',
    'Link video matches to lessons with the same video URL, then find their course through the module lesson references. Never return video documents as results.',
    'Rank exact concept matches in lesson titles above broad keyword hits. Return all relevant matches, and only fields, timestamps, and counts present in query results.',
  ].join('\n'),
}

client.createIfNotExists(context).then((document) => {
  console.log(`Search Context ready: ${document._id} (${document.slug?.current}). Existing edits were preserved.`)
}).catch((error) => {
  console.error('Could not import search Context:', error instanceof Error ? error.message : error)
  process.exitCode = 1
})
