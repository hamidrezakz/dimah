import { S3Client, type S3ClientConfig } from "@aws-sdk/client-s3"
import {
  R2_ACCESS_KEY_ID,
  R2_ENDPOINT,
  R2_REGION,
  R2_SECRET_ACCESS_KEY,
} from "@/lib/s3/env"

const clientConfig: S3ClientConfig = {
  region: R2_REGION,
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
}

export const s3 = new S3Client(clientConfig)
