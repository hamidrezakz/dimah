import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { DEFAULT_BUCKET_NAME } from "@/lib/s3/s3-client"
import { s3 } from "@/lib/s3/s3-client"
import { normalizeExpiresIn, withS3ErrorHandler } from "@/lib/s3/api-helpers"

export const GET = withS3ErrorHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get("key")?.trim()
  if (!key) {
    return Response.json(
      { message: "key query parameter is required" },
      { status: 400 }
    )
  }

  const bucket = searchParams.get("bucket")?.trim() || DEFAULT_BUCKET_NAME
  const expiresIn = normalizeExpiresIn(searchParams.get("expiresIn"))
  const fileName = searchParams.get("fileName")?.trim()

  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentDisposition: `attachment${fileName ? `; filename="${fileName}"` : ""}`,
    }),
    { expiresIn }
  )

  return Response.json({ bucket, key, url, expiresIn })
})
