import { NextRequest, NextResponse } from "next/server";

export async function parseBody<T extends Record<string, unknown>>(
  request: NextRequest,
): Promise<T | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? (body as T) : null;
  } catch {
    return null;
  }
}

export function requireString(
  value: unknown,
  name: string,
): string | NextResponse {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) {
    return NextResponse.json(
      { message: `${name} is required` },
      { status: 400 },
    );
  }
  return trimmed;
}

export function normalizeExpiresIn(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 600;
}

export function withS3ErrorHandler(
  handler: (request: NextRequest) => Promise<NextResponse>,
) {
  return async (request: NextRequest) => {
    try {
      return await handler(request);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Internal server error";
      console.error("[S3 API]", message);
      return NextResponse.json({ message }, { status: 500 });
    }
  };
}
