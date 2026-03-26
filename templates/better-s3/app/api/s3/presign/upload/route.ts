import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { NextRequest, NextResponse } from "next/server"
import { DEFAULT_BUCKET_NAME } from "@/lib/s3/env"
import { s3 } from "@/lib/s3/s3-client"
import {
  parseBody,
  requireString,
  normalizeExpiresIn,
  withS3ErrorHandler,
} from "@/lib/s3/api-helpers"

type Payload = {
  key: string
  contentType?: string
  metadata?: Record<string, string>
  bucket?: string
  expiresIn?: number
}

export const POST = withS3ErrorHandler(async (request: NextRequest) => {
  const body = await parseBody<Payload>(request)
  if (!body) {
    return NextResponse.json(
      { message: "Invalid JSON payload" },
      { status: 400 }
    )
  }

  const key = requireString(body.key, "key")
  if (key instanceof NextResponse) return key

  const bucket = body.bucket?.trim() || DEFAULT_BUCKET_NAME
  const expiresIn = normalizeExpiresIn(body.expiresIn)

  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: body.contentType,
      Metadata: body.metadata,
    }),
    { expiresIn }
  )

  return NextResponse.json({ bucket, key, url, expiresIn })
})
