const envOrThrow = (name: string): string => {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable ${name}`)
  }
  return value
}

//R2
export const R2_ACCOUNT_ID = envOrThrow("R2_ACCOUNT_ID")
export const R2_DEFAULT_BUCKET_NAME = envOrThrow("R2_DEFAULT_BUCKET_NAME")
export const R2_ACCESS_KEY_ID = envOrThrow("R2_ACCESS_KEY_ID")
export const R2_SECRET_ACCESS_KEY = envOrThrow("R2_SECRET_ACCESS_KEY")
export const R2_REGION = process.env.R2_REGION ?? "auto"
export const R2_ENDPOINT =
  process.env.R2_ENDPOINT ?? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
