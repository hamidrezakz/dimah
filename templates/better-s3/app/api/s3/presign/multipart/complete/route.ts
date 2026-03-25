import { CompleteMultipartUploadCommand } from "@aws-sdk/client-s3"
import { NextRequest, NextResponse } from "next/server"
import { DEFAULT_BUCKET_NAME } from "@/lib/s3/env"
import { s3 } from "@/lib/s3/s3-client"

export type CompletePartPayload = {
  partNumber: number
  eTag: string
}

export type CompletePayload = {
  key: string
  uploadId: string
  bucket?: string
  parts: CompletePartPayload[]
}

const parsePayload = (request: NextRequest): Promise<CompletePayload | null> =>
  request
    .json()
    .then((body) =>
      body && typeof body === "object" ? (body as CompletePayload) : null
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
  const parts = Array.isArray(payload.parts) ? payload.parts : []
  if (!key || !uploadId || !parts.length) {
    return NextResponse.json(
      { message: "key, uploadId and parts are required" },
      { status: 400 }
    )
  }

  const normalizedParts = parts
    .map(({ partNumber, eTag }) => ({
      PartNumber: Number(partNumber),
      ETag: eTag,
    }))
    .filter(
      (part) =>
        Number.isInteger(part.PartNumber) && typeof part.ETag === "string"
    )
    .sort((left, right) => left.PartNumber - right.PartNumber)

  if (!normalizedParts.length) {
    return NextResponse.json(
      { message: "no valid parts provided" },
      { status: 400 }
    )
  }

  const bucket = payload.bucket?.trim() || DEFAULT_BUCKET_NAME
  const response = await s3.send(
    new CompleteMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: normalizedParts },
    })
  )

  return NextResponse.json({
    bucket,
    key,
    uploadId,
    ...response,
  })
}
