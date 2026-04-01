import { AbortMultipartUploadCommand } from "@aws-sdk/client-s3"
import { NextRequest, NextResponse } from "next/server"
import { DEFAULT_BUCKET_NAME } from "@/lib/s3/s3-client"
import { s3 } from "@/lib/s3/s3-client"
import {
  parseBody,
  requireString,
  withS3ErrorHandler,
} from "@/lib/s3/api-helpers"

type Payload = {
  key: string
  uploadId: string
  bucket?: string
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

  const bucket = body.bucket?.trim() || DEFAULT_BUCKET_NAME

  await s3.send(
    new AbortMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
    })
  )

  return NextResponse.json({ bucket, key, uploadId, aborted: true })
})
