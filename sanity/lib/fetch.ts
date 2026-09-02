import 'server-only'

import type { QueryParams } from 'next-sanity'

import { client } from './client'

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
