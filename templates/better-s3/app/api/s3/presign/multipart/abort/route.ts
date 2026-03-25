import { AbortMultipartUploadCommand } from "@aws-sdk/client-s3"
import { NextRequest, NextResponse } from "next/server"
import { DEFAULT_BUCKET_NAME } from "@/lib/s3/env"
import { s3 } from "@/lib/s3/s3-client"

export type AbortPayload = {
  key: string
  uploadId: string
  bucket?: string
}

const parsePayload = (request: NextRequest): Promise<AbortPayload | null> =>
  request
    .json()
    .then((body) =>
      body && typeof body === "object" ? (body as AbortPayload) : null
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
  const uploadId = payload.uploadId?.trim()
  if (!key || !uploadId) {
    return NextResponse.json(
      { message: "key and uploadId are required" },
      { status: 400 }
    )
  }

  const bucket = payload.bucket?.trim() || DEFAULT_BUCKET_NAME
  await s3.send(
    new AbortMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
    })
  )

  return NextResponse.json({ bucket, key, uploadId, aborted: true })
}
