import type { UploadProgress, UploadResult, UploadConfig } from "@/lib/s3/types"
import { presignApi } from "@/lib/s3/presign-api"

const DEFAULT_MULTIPART_THRESHOLD = 50 * 1024 * 1024
const DEFAULT_PART_SIZE = 10 * 1024 * 1024

// ---------------------------------------------------------------------------
// Simple upload (PUT to presigned URL with XHR progress)
// ---------------------------------------------------------------------------

function uploadSimple(
  file: File,
  presignedUrl: string,
  onProgress?: (progress: UploadProgress) => void,
  signal?: AbortSignal
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    const onAbort = () => {
      xhr.abort()
      reject(new DOMException("Upload aborted", "AbortError"))
    }
    signal?.addEventListener("abort", onAbort, { once: true })

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress?.({
          loaded: e.loaded,
          total: e.total,
          percent: Math.round((e.loaded / e.total) * 100),
        })
      }
    })

    xhr.addEventListener("load", () => {
      signal?.removeEventListener("abort", onAbort)
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.({ loaded: file.size, total: file.size, percent: 100 })
        resolve()
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`))
      }
    })

    xhr.addEventListener("error", () => {
      signal?.removeEventListener("abort", onAbort)
      reject(new Error("Upload failed: network error"))
    })

    xhr.addEventListener("abort", () => {
      signal?.removeEventListener("abort", onAbort)
      reject(new DOMException("Upload aborted", "AbortError"))
    })

    xhr.open("PUT", presignedUrl)
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream"
    )
    xhr.send(file)
  })
}

// ---------------------------------------------------------------------------
// Multipart upload (per-part XHR with cumulative progress)
// ---------------------------------------------------------------------------

function uploadPart(
  blob: Blob,
  presignedUrl: string,
  partOffset: number,
  totalSize: number,
  onProgress?: (progress: UploadProgress) => void,
  signal?: AbortSignal
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    const onAbort = () => {
      xhr.abort()
      reject(new DOMException("Upload aborted", "AbortError"))
    }
    signal?.addEventListener("abort", onAbort, { once: true })

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const loaded = partOffset + e.loaded
        onProgress?.({
          loaded,
          total: totalSize,
          percent: Math.round((loaded / totalSize) * 100),
        })
      }
    })

    xhr.addEventListener("load", () => {
      signal?.removeEventListener("abort", onAbort)
      if (xhr.status >= 200 && xhr.status < 300) {
        const eTag = xhr.getResponseHeader("ETag") ?? ""
        resolve(eTag)
      } else {
        reject(new Error(`Part upload failed: ${xhr.status}`))
      }
    })

    xhr.addEventListener("error", () => {
      signal?.removeEventListener("abort", onAbort)
      reject(new Error("Part upload failed: network error"))
    })

    xhr.addEventListener("abort", () => {
      signal?.removeEventListener("abort", onAbort)
      reject(new DOMException("Upload aborted", "AbortError"))
    })

    xhr.open("PUT", presignedUrl)
    xhr.send(blob)
  })
}

async function uploadMultipart(
  file: File,
  objectKey: string,
  partSize: number,
  onProgress?: (progress: UploadProgress) => void,
  signal?: AbortSignal
): Promise<void> {
  const { uploadId, key } = await presignApi.multipart.init({
    key: objectKey,
    contentType: file.type,
  })

  const totalParts = Math.ceil(file.size / partSize)
  const parts: Array<{ partNumber: number; eTag: string }> = []
  let uploadedBytes = 0

  try {
    for (let i = 0; i < totalParts; i++) {
      if (signal?.aborted) {
        throw new DOMException("Upload aborted", "AbortError")
      }

      const start = i * partSize
      const end = Math.min(start + partSize, file.size)
      const blob = file.slice(start, end)
      const partNumber = i + 1

      const { presignedUrl } = await presignApi.multipart.signPart({
        key,
        uploadId,
        partNumber,
      })

      const eTag = await uploadPart(
        blob,
        presignedUrl,
        uploadedBytes,
        file.size,
        onProgress,
        signal
      )

      parts.push({ partNumber, eTag: eTag.replace(/"/g, "") })
      uploadedBytes += blob.size
    }

    await presignApi.multipart.complete({ key, uploadId, parts })
    onProgress?.({ loaded: file.size, total: file.size, percent: 100 })
  } catch (err) {
    // Abort the multipart upload on failure (best-effort)
    presignApi.multipart.abort({ key, uploadId }).catch(() => {})
    throw err
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type UploadEngineCallbacks = {
  onProgress?: (progress: UploadProgress) => void
}

export async function uploadFile(
  file: File,
  objectKey: string,
  config: UploadConfig = {},
  callbacks: UploadEngineCallbacks = {},
  signal?: AbortSignal
): Promise<UploadResult> {
  const threshold = config.multipartThreshold ?? DEFAULT_MULTIPART_THRESHOLD
  const useMultipart = config.multipart === true && file.size >= threshold

  // Get presigned URL and upload
  if (useMultipart) {
    await uploadMultipart(
      file,
      objectKey,
      DEFAULT_PART_SIZE,
      callbacks.onProgress,
      signal
    )
  } else {
    const presign = await presignApi.upload({
      key: objectKey,
      contentType: file.type,
    })
    await uploadSimple(file, presign.url, callbacks.onProgress, signal)
  }

  return { key: objectKey }
}
