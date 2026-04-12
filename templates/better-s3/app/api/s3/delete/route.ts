import { DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3"
import { NextRequest, NextResponse } from "next/server"
import { DEFAULT_BUCKET_NAME, s3 } from "@/lib/s3/s3-client"
import { withS3ErrorHandler } from "@/lib/s3/api-helpers"

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

  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
  } catch {
    return NextResponse.json(
      { message: `Object "${key}" not found` },
      { status: 404 }
    )
  }

  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))

  return NextResponse.json({ success: true, bucket, key })
})
