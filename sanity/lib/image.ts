import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url'

import { dataset, projectId } from '../env'

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({ projectId, dataset })

/**
 * Creates an image URL builder for a Sanity image asset.
 * @param source - Sanity image asset reference or object
 * @returns Image URL builder with transformation methods
 */
export const urlFor = (source: SanityImageSource) => {
  return builder.image(source)
}
