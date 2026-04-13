import type { UploadProgress, UploadResult, UploadConfig } from "@/lib/s3/types"
import { presignApi } from "@/lib/s3/presign-api"

const DEFAULT_MULTIPART_THRESHOLD = 50 * 1024 * 1024
const DEFAULT_PART_SIZE = 10 * 1024 * 1024
const MAX_RETRIES = 3
const RETRY_BASE_DELAY = 1000
const DEFAULT_CONCURRENT_PARTS = 3
const DEFAULT_CONCURRENT_FILES = 2

// ---------------------------------------------------------------------------
// Retry helper — exponential backoff, skips AbortError
// ---------------------------------------------------------------------------

async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number,
  signal?: AbortSignal
): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if ((err as Error).name === "AbortError") throw err
      lastError = err
      if (attempt < retries) {
        const delay = RETRY_BASE_DELAY * 2 ** attempt
        await new Promise((r) => setTimeout(r, delay))
        if (signal?.aborted)
          throw new DOMException("Upload aborted", "AbortError")
      }
    }
  }
  throw lastError
}

// ---------------------------------------------------------------------------
// Simple upload (PUT to presigned URL with XHR progress)
// ---------------------------------------------------------------------------

function uploadSimple(
  file: File,
  presignedUrl: string,
  onProgress?: (progress: UploadProgress) => void,
  signal?: AbortSignal
): Promise<string | undefined> {
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
        const eTag = xhr.getResponseHeader("ETag")?.replace(/"/g, "")
        resolve(eTag ?? undefined)
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
// Multipart upload (per-part XHR with concurrent progress tracking)
// ---------------------------------------------------------------------------

function uploadPart(
  blob: Blob,
  presignedUrl: string,
  partLoaded: { bytes: number },
  totalSize: number,
  reportProgress: () => void,
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
        partLoaded.bytes = e.loaded
        reportProgress()
      }
    })

    xhr.addEventListener("load", () => {
      signal?.removeEventListener("abort", onAbort)
      if (xhr.status >= 200 && xhr.status < 300) {
        partLoaded.bytes = blob.size
        reportProgress()
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
  concurrentParts: number,
  onProgress?: (progress: UploadProgress) => void,
  signal?: AbortSignal
): Promise<void> {
  const { uploadId, key } = await presignApi.multipart.init({
    key: objectKey,
    contentType: file.type,
  })

  const totalParts = Math.ceil(file.size / partSize)
  const parts: Array<{ partNumber: number; eTag: string }> = []

  // Track per-part loaded bytes for accurate concurrent progress
  const partProgress: Array<{ bytes: number }> = Array.from(
    { length: totalParts },
    () => ({ bytes: 0 })
  )

  const reportProgress = () => {
    const loaded = partProgress.reduce((sum, p) => sum + p.bytes, 0)
    onProgress?.({
      loaded,
      total: file.size,
      percent: Math.round((loaded / file.size) * 100),
    })
  }

  try {
    // Process parts in concurrent batches
    for (
      let batchStart = 0;
      batchStart < totalParts;
      batchStart += concurrentParts
    ) {
      if (signal?.aborted) {
        throw new DOMException("Upload aborted", "AbortError")
      }

      const batchEnd = Math.min(batchStart + concurrentParts, totalParts)
      const batch: Array<Promise<{ partNumber: number; eTag: string }>> = []

      for (let i = batchStart; i < batchEnd; i++) {
        const start = i * partSize
        const end = Math.min(start + partSize, file.size)
        const blob = file.slice(start, end)
        const partNumber = i + 1

        batch.push(
          withRetry(
            async () => {
              const { presignedUrl } = await presignApi.multipart.signPart({
                key,
                uploadId,
                partNumber,
              })

              // Reset progress for this part on retry
              partProgress[i].bytes = 0

              const eTag = await uploadPart(
                blob,
                presignedUrl,
                partProgress[i],
                file.size,
                reportProgress,
                signal
              )

              return { partNumber, eTag: eTag.replace(/"/g, "") }
            },
            MAX_RETRIES,
            signal
          )
        )
      }

      const batchResults = await Promise.all(batch)
      parts.push(...batchResults)
    }

    // Parts must be sorted by partNumber for S3 completion
    parts.sort((a, b) => a.partNumber - b.partNumber)

    await presignApi.multipart.complete({ key, uploadId, parts })
    onProgress?.({ loaded: file.size, total: file.size, percent: 100 })
  } catch (err) {
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
  const concurrentParts = config.concurrentParts ?? DEFAULT_CONCURRENT_PARTS

  let eTag: string | undefined

  if (useMultipart) {
    await uploadMultipart(
      file,
      objectKey,
      DEFAULT_PART_SIZE,
      concurrentParts,
      callbacks.onProgress,
      signal
    )
  } else {
    eTag = await withRetry(
      async () => {
        const presign = await presignApi.upload({
          key: objectKey,
          contentType: file.type,
        })
        return uploadSimple(file, presign.url, callbacks.onProgress, signal)
      },
      MAX_RETRIES,
      signal
    )
  }

  return { key: objectKey, eTag }
}

// ---------------------------------------------------------------------------
// Multi-file upload with per-file tracking and concurrency
// ---------------------------------------------------------------------------

export type FileItemStatus = "pending" | "uploading" | "success" | "error"

export type FileItem = {
  id: string
  file: File
  objectKey: string
  status: FileItemStatus
  progress: UploadProgress
  result: UploadResult | null
  error: string | null
}

export type MultiUploadCallbacks = {
  onFileProgress?: (id: string, progress: UploadProgress) => void
  onFileSuccess?: (id: string, result: UploadResult) => void
  onFileError?: (id: string, error: string) => void
  onTotalProgress?: (progress: UploadProgress) => void
}

export async function uploadFiles(
  items: Array<{ id: string; file: File; objectKey: string }>,
  config: UploadConfig = {},
  callbacks: MultiUploadCallbacks = {},
  signal?: AbortSignal
): Promise<FileItem[]> {
  const results: FileItem[] = items.map((item) => ({
    ...item,
    status: "pending" as FileItemStatus,
    progress: { loaded: 0, total: item.file.size, percent: 0 },
    result: null,
    error: null,
  }))

  const reportTotalProgress = () => {
    const loaded = results.reduce((sum, r) => sum + r.progress.loaded, 0)
    const total = results.reduce((sum, r) => sum + r.progress.total, 0)
    callbacks.onTotalProgress?.({
      loaded,
      total,
      percent: total > 0 ? Math.round((loaded / total) * 100) : 0,
    })
  }

  // Process files with concurrency limit
  let nextIndex = 0

  const processNext = async (): Promise<void> => {
    while (nextIndex < results.length) {
      if (signal?.aborted) return
      const idx = nextIndex++
      const item = results[idx]

      item.status = "uploading"

      try {
        const result = await uploadFile(
          item.file,
          item.objectKey,
          config,
          {
            onProgress: (progress) => {
              item.progress = progress
              callbacks.onFileProgress?.(item.id, progress)
              reportTotalProgress()
            },
          },
          signal
        )
        item.status = "success"
        item.result = result
        item.progress = {
          loaded: item.file.size,
          total: item.file.size,
          percent: 100,
        }
        callbacks.onFileSuccess?.(item.id, result)
        reportTotalProgress()
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          item.status = "error"
          item.error = "Upload cancelled"
          return
        }
        const message = err instanceof Error ? err.message : "Upload failed"
        item.status = "error"
        item.error = message
        callbacks.onFileError?.(item.id, message)
        reportTotalProgress()
      }
    }
  }

  const concurrentFiles = config.concurrentFiles ?? DEFAULT_CONCURRENT_FILES
  const workers = Array.from(
    { length: Math.min(concurrentFiles, items.length) },
    () => processNext()
  )
  await Promise.all(workers)

  return results
}
