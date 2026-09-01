import 'server-only'

import type { QueryParams } from 'next-sanity'

import { client } from './client'

/**
 * Server-side fetch helper for Sanity queries with Next.js caching support
 * @param options - Fetch options
 * @param options.query - GROQ query string
 * @param options.params - Query parameters
 * @param options.tags - Cache tags for revalidation
 * @param options.revalidate - Revalidation interval in seconds or false to disable
 * @returns Query result
 */
export async function sanityFetch<const QueryString extends string>({
  query,
  params = {},
  tags,
  revalidate = 60,
}: {
  query: QueryString
  params?: QueryParams
  tags?: string[]
  revalidate?: number | false
}) {
  return client.fetch(query, params, {
    next: { revalidate: tags?.length ? false : revalidate, tags },
  })
}
