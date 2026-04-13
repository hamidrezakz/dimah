// S3Client & S3ClientConfig are re-exported from @aws-sdk/client-s3
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started-nodejs.html
import { S3Client, type S3ClientConfig } from "@better-s3/core"

const clientConfig: S3ClientConfig = {
  region: process.env.R2_REGION ?? "auto",
  endpoint:
    process.env.R2_ENDPOINT ??
    `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
}

export const s3 = new S3Client(clientConfig)
export const DEFAULT_BUCKET_NAME = process.env.R2_DEFAULT_BUCKET_NAME!
