export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-02-01'

export const dataset = assertValue(
  "production",
  'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET'
)

export const projectId = assertValue(
  "spber204",
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID'
)

export const token = assertValue(
  "skk88qeN3LUaUZRB6PnPHmfJkTV0pHk2HJNbfztqCUMpppsc4W4aWgPS50vJYMtVOCUXCcfgR982FDuVe2SIvTHx8j4rHFmgVzDvbTWfAiirSg9dzNi7iVZABp89x0FVeKKD5uGhSU6HUSYa5auZgcKp1dyQwRMeihYRKfI2M1gc536IHWbO",
  'Missing environment variable: SANITY_API_TOKEN'
)

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}
