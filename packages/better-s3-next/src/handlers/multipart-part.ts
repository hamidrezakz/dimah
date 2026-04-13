import { UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";
import type { S3HandlerConfig } from "../types";
import {
  parseBody,
  requireString,
  normalizeExpiresIn,
  withS3ErrorHandler,
} from "../helpers";

type Payload = {
  key: string;
  uploadId: string;
  partNumber: number;
  bucket?: string;
  expiresIn?: number;
};

export function createMultipartPartHandler(config: S3HandlerConfig) {
  return withS3ErrorHandler(async (request: NextRequest) => {
    const body = await parseBody<Payload>(request);
    if (!body) {
      return NextResponse.json(
        { message: "Invalid JSON payload" },
        { status: 400 },
      );
    }

    const key = requireString(body.key, "key");
    if (key instanceof NextResponse) return key;

    const uploadId = requireString(body.uploadId, "uploadId");
    if (uploadId instanceof NextResponse) return uploadId;

    const partNumber = Number(body.partNumber);
    if (!Number.isInteger(partNumber) || partNumber <= 0) {
      return NextResponse.json(
        { message: "partNumber must be a positive integer" },
        { status: 400 },
      );
    }

    const bucket = body.bucket?.trim() || config.defaultBucket;
    const expiresIn = normalizeExpiresIn(body.expiresIn);

    const presignedUrl = await getSignedUrl(
      config.s3,
      new UploadPartCommand({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
        PartNumber: partNumber,
      }),
      { expiresIn },
    );

    return NextResponse.json({
      presignedUrl,
      partNumber,
      uploadId,
      bucket,
      expiresIn,
    });
  });
}
