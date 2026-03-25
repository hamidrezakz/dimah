import { UploadPartCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { NextRequest, NextResponse } from "next/server"
import { DEFAULT_BUCKET_NAME } from "@/lib/s3/env"
import { s3 } from "@/lib/s3/s3-client"
import { parseExpiresIn } from "@/lib/s3/utils"

export type PartPayload = {
  key: string
  uploadId: string
  partNumber: number
  bucket?: string
  expiresIn?: number
  contentType?: string
}

const parsePayload = (request: NextRequest): Promise<PartPayload | null> =>
  request
    .json()
    .then((body) =>
      body && typeof body === "object" ? (body as PartPayload) : null
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
  const partNumber = payload.partNumber
  if (!key || !uploadId || !Number.isInteger(partNumber) || partNumber <= 0) {
    return NextResponse.json(
      { message: "key, uploadId and integer partNumber are required" },
      { status: 400 }
    )
  }

  const bucket = payload.bucket?.trim() || DEFAULT_BUCKET_NAME
  const command = new UploadPartCommand({
    Bucket: bucket,
    Key: key,
    UploadId: uploadId,
    PartNumber: partNumber,
  })
  const expiresIn = parseExpiresIn(
    payload.expiresIn == null ? null : String(payload.expiresIn)
  )
  const presignedUrl = await getSignedUrl(s3, command, { expiresIn })

  return NextResponse.json({
    presignedUrl,
    partNumber,
    uploadId,
    bucket,
    expiresIn,
  })
}
