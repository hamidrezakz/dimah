// S3Client & S3ClientConfig are re-exported from @aws-sdk/client-s3
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started-nodejs.html
import { S3Client, type S3ClientConfig } from "@better-s3/core"

const clientConfig: S3ClientConfig = {
  region: "auto",
  endpoint: "",
  credentials: {
    accessKeyId: "",
    secretAccessKey: "",
  },
}

export const s3 = new S3Client(clientConfig)
export const DEFAULT_BUCKET_NAME = ""
