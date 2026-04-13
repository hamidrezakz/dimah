import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";
import type { S3HandlerConfig } from "../types";
import { normalizeExpiresIn, withS3ErrorHandler } from "../helpers";

export function createDownloadHandler(config: S3HandlerConfig) {
  return withS3ErrorHandler(async (request: NextRequest) => {
    const { searchParams } = request.nextUrl;
    const key = searchParams.get("key")?.trim();
    if (!key) {
      return NextResponse.json(
        { message: "key query parameter is required" },
        { status: 400 },
      );
    }

    const bucket = searchParams.get("bucket")?.trim() || config.defaultBucket;
    const expiresIn = normalizeExpiresIn(searchParams.get("expiresIn"));
    const fileName = searchParams.get("fileName")?.trim();

    const url = await getSignedUrl(
      config.s3,
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
        ResponseContentDisposition: `attachment${fileName ? `; filename="${fileName}"` : ""}`,
      }),
      { expiresIn },
    );

    return NextResponse.json({ bucket, key, url, expiresIn });
  });
}
