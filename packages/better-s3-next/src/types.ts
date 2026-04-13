import type { S3Client } from "@aws-sdk/client-s3";

export type S3HandlerConfig = {
  s3: S3Client;
  defaultBucket: string;
};
