import 'server-only'

import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

const token = process.env.SANITY_API_READ_TOKEN
if (!token) {
  throw new Error('Missing environment variable: SANITY_API_READ_TOKEN')
}

// Server-only: the dataset is private and this client carries a read token.
// Never import this module from a Client Component.
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
})
