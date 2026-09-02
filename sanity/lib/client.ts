import 'server-only'

import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

const token = process.env.SANITY_API_READ_TOKEN
if (!token) {
  throw new Error('Missing environment variable: SANITY_API_READ_TOKEN')
}

/**
 * Server-only Sanity client configured with read token for private dataset access
 * @warning Never import this module from a Client Component - it contains server-only secrets
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
})
