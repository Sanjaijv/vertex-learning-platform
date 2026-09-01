import 'server-only'

import type { QueryParams } from 'next-sanity'

import { client } from './client'

/**
 * Fetches data from Sanity with Next.js caching and revalidation.
 * @param query - GROQ query string
 * @param params - Query parameters for GROQ variables
 * @param tags - Cache tags for revalidation
 * @param revalidate - Revalidation interval in seconds, or false to disable
 * @returns Query result data
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
