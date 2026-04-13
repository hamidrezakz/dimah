import { DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import type { S3HandlerConfig } from "../types";
import { withS3ErrorHandler } from "../helpers";

export function createDeleteHandler(config: S3HandlerConfig) {
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

    try {
      await config.s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    } catch {
      return NextResponse.json(
        { message: `Object "${key}" not found` },
        { status: 404 },
      );
    }

    await config.s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));

    return NextResponse.json({ success: true, bucket, key });
  });
}
