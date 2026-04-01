import { DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { NextRequest, NextResponse } from "next/server"
import { DEFAULT_BUCKET_NAME } from "@/lib/s3/s3-client"
import { s3 } from "@/lib/s3/s3-client"
import { normalizeExpiresIn, withS3ErrorHandler } from "@/lib/s3/api-helpers"

export const DELETE = withS3ErrorHandler(async (request: NextRequest) => {
  const { searchParams } = request.nextUrl
  const key = searchParams.get("key")?.trim()
  if (!key) {
    return NextResponse.json(
      { message: "key query parameter is required" },
      { status: 400 }
    )
  }

  const bucket = searchParams.get("bucket")?.trim() || DEFAULT_BUCKET_NAME
  const expiresIn = normalizeExpiresIn(searchParams.get("expiresIn"))

  const url = await getSignedUrl(
    s3,
    new DeleteObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn }
  )

  return NextResponse.json({ bucket, key, url, expiresIn })
})
