import { CreateMultipartUploadCommand } from "@aws-sdk/client-s3"
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
  bucket?: string
  contentType?: string
  metadata?: Record<string, string>
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

  const { UploadId } = await s3.send(
    new CreateMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      ContentType: body.contentType,
      Metadata: body.metadata,
    })
  )

  return NextResponse.json({ bucket, key, uploadId: UploadId }, { status: 201 })
})
