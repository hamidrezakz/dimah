import { UploadPartCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { DEFAULT_BUCKET_NAME } from "@/lib/s3/s3-client"
import { s3 } from "@/lib/s3/s3-client"
import {
  parseBody,
  requireString,
  normalizeExpiresIn,
  withS3ErrorHandler,
} from "@/lib/s3/api-helpers"

type Payload = {
  key: string
  uploadId: string
  partNumber: number
  bucket?: string
  expiresIn?: number
}

export const POST = withS3ErrorHandler(async (request: Request) => {
  const body = await parseBody<Payload>(request)
  if (!body) {
    return Response.json({ message: "Invalid JSON payload" }, { status: 400 })
  }

  const key = requireString(body.key, "key")
  if (key instanceof Response) return key

  const uploadId = requireString(body.uploadId, "uploadId")
  if (uploadId instanceof Response) return uploadId

  const partNumber = Number(body.partNumber)
  if (!Number.isInteger(partNumber) || partNumber <= 0) {
    return Response.json(
      { message: "partNumber must be a positive integer" },
      { status: 400 }
    )
  }

  const bucket = body.bucket?.trim() || DEFAULT_BUCKET_NAME
  const expiresIn = normalizeExpiresIn(body.expiresIn)

  const presignedUrl = await getSignedUrl(
    s3,
    new UploadPartCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
    }),
    { expiresIn }
  )

  return Response.json({
    presignedUrl,
    partNumber,
    uploadId,
    bucket,
    expiresIn,
  })
})
