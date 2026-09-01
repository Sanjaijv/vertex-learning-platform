export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-09-01'

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET'
)

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID'
)

/**
 * Asserts that a value is defined and returns it, or throws an error.
 * @param v - Value to check
 * @param errorMessage - Error message to throw if value is undefined
 * @returns The value if defined
 * @throws Error if value is undefined
 */
function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}
