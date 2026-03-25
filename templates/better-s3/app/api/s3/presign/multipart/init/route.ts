import { CreateMultipartUploadCommand } from "@aws-sdk/client-s3"
import { NextRequest, NextResponse } from "next/server"
import { DEFAULT_BUCKET_NAME } from "@/lib/s3/env"
import { s3 } from "@/lib/s3/s3-client"

export type InitPayload = {
  key: string
  bucket?: string
  contentType?: string
  metadata?: Record<string, string>
}

const parsePayload = (request: NextRequest): Promise<InitPayload | null> =>
  request
    .json()
    .then((body) =>
      body && typeof body === "object" ? (body as InitPayload) : null
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
  const response = await s3.send(
    new CreateMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      ContentType: payload.contentType,
      Metadata: payload.metadata,
    })
  )

  return NextResponse.json(
    {
      bucket,
      key,
      uploadId: response.UploadId,
    },
    { status: 201 }
  )
}
