import { CompleteMultipartUploadCommand } from "@aws-sdk/client-s3"
import { NextRequest, NextResponse } from "next/server"
import { DEFAULT_BUCKET_NAME } from "@/lib/s3/env"
import { s3 } from "@/lib/s3/s3-client"
import {
  parseBody,
  requireString,
  withS3ErrorHandler,
} from "@/lib/s3/api-helpers"

type PartEntry = {
  partNumber: number
  eTag: string
}

type Payload = {
  key: string
  uploadId: string
  bucket?: string
  parts: PartEntry[]
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

  const uploadId = requireString(body.uploadId, "uploadId")
  if (uploadId instanceof NextResponse) return uploadId

  const parts = (Array.isArray(body.parts) ? body.parts : [])
    .map(({ partNumber, eTag }) => ({
      PartNumber: Number(partNumber),
      ETag: String(eTag),
    }))
    .filter((p) => Number.isInteger(p.PartNumber) && p.ETag)
    .sort((a, b) => a.PartNumber - b.PartNumber)

  if (!parts.length) {
    return NextResponse.json(
      { message: "At least one valid part is required" },
      { status: 400 }
    )
  }

  const bucket = body.bucket?.trim() || DEFAULT_BUCKET_NAME

  const { Location, ETag } = await s3.send(
    new CompleteMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts },
    })
  )

  return NextResponse.json({
    bucket,
    key,
    uploadId,
    location: Location,
    eTag: ETag,
  })
})
