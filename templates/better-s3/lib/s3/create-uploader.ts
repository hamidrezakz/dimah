import Uppy from "@uppy/core"
import AwsS3 from "@uppy/aws-s3"
import type { UploadConfig } from "@/lib/s3/types"
import { presignApi } from "@/lib/s3/presign-api"

const DEFAULT_MULTIPART_THRESHOLD = 50 * 1024 * 1024

export function createUploader(config: UploadConfig = {}) {
  const threshold = config.multipartThreshold ?? DEFAULT_MULTIPART_THRESHOLD
  const useMultipart = config.multipart === true

  const uppy = new Uppy({
    restrictions: {
      allowedFileTypes: config.accept ?? null,
      maxFileSize: config.maxFileSize ?? null,
    },
    autoProceed: false,
  })

  uppy.use(AwsS3, {
    shouldUseMultipart: (file) => useMultipart && (file.size ?? 0) >= threshold,

    async getUploadParameters(file) {
      const result = await presignApi.upload({
        key: file.meta["objectKey"] as string,
        contentType: file.type,
      })
      return {
        method: "PUT" as const,
        url: result.url,
        headers: {
          "Content-Type": file.type ?? "application/octet-stream",
        },
      }
    },

    async createMultipartUpload(file) {
      const result = await presignApi.multipart.init({
        key: file.meta["objectKey"] as string,
        contentType: file.type,
      })
      return { uploadId: result.uploadId, key: result.key }
    },

    async listParts(_file, opts) {
      void opts
      return []
    },

    async signPart(_file, opts) {
      const result = await presignApi.multipart.signPart({
        key: opts.key!,
        uploadId: opts.uploadId!,
        partNumber: opts.partNumber,
      })
      return { url: result.presignedUrl }
    },

    async completeMultipartUpload(_file, opts) {
      const result = await presignApi.multipart.complete({
        key: opts.key!,
        uploadId: opts.uploadId!,
        parts: opts.parts.map((p) => ({
          partNumber: p.PartNumber!,
          eTag: p.ETag!,
        })),
      })
      return { location: result.key }
    },

    async abortMultipartUpload(_file, opts) {
      await presignApi.multipart.abort({
        key: opts.key!,
        uploadId: opts.uploadId!,
      })
    },
  })

  return uppy
}
