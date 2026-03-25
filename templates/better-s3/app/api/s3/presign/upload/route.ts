import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { NextRequest, NextResponse } from "next/server"
import { DEFAULT_BUCKET_NAME } from "@/lib/s3/env"
import { s3 } from "@/lib/s3/s3-client"

export type UploadPayload = {
  key: string
  contentType?: string
  metadata?: Record<string, string>
  bucket?: string
  expiresIn?: number
}

const parsePayload = (request: NextRequest): Promise<UploadPayload | null> =>
  request
    .json()
    .then((body) =>
      body && typeof body === "object" ? (body as UploadPayload) : null
    )
    .catch(() => null)

export async function POST(request: NextRequest) {
  const payload = await parsePayload(request)
  if (!payload) {
    return NextResponse.json(
      { message: "invalid JSON payload" },
      { status: 400 }
    )
  }

  const key = payload.key?.trim()
  if (!key) {
    return NextResponse.json({ message: "key is required" }, { status: 400 })
  }

  const bucket = payload.bucket?.trim() || DEFAULT_BUCKET_NAME

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: payload.contentType,
    Metadata: payload.metadata,
  })
  const expiresIn = payload.expiresIn ?? 300
  const url = await getSignedUrl(s3, command, { expiresIn })

  return NextResponse.json({ bucket, key, url, expiresIn })
}
