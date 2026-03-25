import { DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { NextRequest, NextResponse } from "next/server"
import { DEFAULT_BUCKET_NAME } from "@/lib/s3/env"
import { s3 } from "@/lib/s3/s3-client"
import { parseExpiresIn } from "@/lib/s3/utils"

export async function DELETE(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key")
  if (!key) {
    return NextResponse.json(
      { message: "key query parameter is required" },
      { status: 400 }
    )
  }

  const bucket =
    request.nextUrl.searchParams.get("bucket")?.trim() || DEFAULT_BUCKET_NAME
  const expiresIn = parseExpiresIn(
    request.nextUrl.searchParams.get("expiresIn")
  )
  const command = new DeleteObjectCommand({ Bucket: bucket, Key: key })
  const signedUrl = await getSignedUrl(s3, command, { expiresIn })

  return NextResponse.json({ bucket, key, url: signedUrl, expiresIn })
}
