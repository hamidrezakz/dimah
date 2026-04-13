/** Parse JSON body safely. Returns `null` on invalid JSON. */
export async function parseBody<T extends Record<string, unknown>>(
  request: Request
): Promise<T | null> {
  try {
    const body = await request.json()
    return body && typeof body === "object" ? (body as T) : null
  } catch {
    return null
  }
}

/** Require a trimmed, non-empty string from body/params. */
export function requireString(value: unknown, name: string): string | Response {
  const trimmed = typeof value === "string" ? value.trim() : ""
  if (!trimmed) {
    return Response.json({ message: `${name} is required` }, { status: 400 })
  }
  return trimmed
}

/** Normalize expiresIn to a positive integer (default 600s). */
export function normalizeExpiresIn(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 600
}

/** Wrap handler with S3 error handling. */
export function withS3ErrorHandler(
  handler: (request: Request) => Promise<Response>
) {
  return async (request: Request) => {
    try {
      return await handler(request)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Internal server error"
      console.error("[S3 API]", message)
      return Response.json({ message }, { status: 500 })
    }
  }
}
