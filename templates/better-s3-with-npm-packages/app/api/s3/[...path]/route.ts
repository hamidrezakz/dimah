import { createRouteHandler } from "@better-s3/next"
import { s3, DEFAULT_BUCKET_NAME } from "@/lib/s3/s3-client"

const handler = createRouteHandler({
  s3,
  defaultBucket: DEFAULT_BUCKET_NAME,
  basePath: "/api/s3",
})

export { handler as GET, handler as POST, handler as DELETE }
