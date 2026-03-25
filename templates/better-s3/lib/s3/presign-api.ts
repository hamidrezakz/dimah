import type {
  PresignResponse,
  MultipartInitResponse,
  MultipartPartResponse,
} from "@/lib/s3/types"

const json = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(url, init)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { message?: string }).message ?? res.statusText)
  }
  return res.json() as Promise<T>
}

const post = <T>(url: string, body: unknown): Promise<T> =>
  json<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

export const presignApi = {
  upload(payload: {
    key: string
    contentType?: string
    metadata?: Record<string, string>
  }) {
    return post<PresignResponse>("/api/s3/presign/upload", payload)
  },

  download(key: string) {
    return json<PresignResponse>(
      `/api/s3/presign/download?key=${encodeURIComponent(key)}`
    )
  },

  delete(key: string) {
    return json<PresignResponse>(
      `/api/s3/presign/delete?key=${encodeURIComponent(key)}`,
      { method: "DELETE" }
    )
  },

  multipart: {
    init(payload: {
      key: string
      contentType?: string
      metadata?: Record<string, string>
    }) {
      return post<MultipartInitResponse>(
        "/api/s3/presign/multipart/init",
        payload
      )
    },

    signPart(payload: { key: string; uploadId: string; partNumber: number }) {
      return post<MultipartPartResponse>(
        "/api/s3/presign/multipart/part",
        payload
      )
    },

    complete(payload: {
      key: string
      uploadId: string
      parts: Array<{ partNumber: number; eTag: string }>
    }) {
      return post<{ key: string; bucket: string; uploadId: string }>(
        "/api/s3/presign/multipart/complete",
        payload
      )
    },

    abort(payload: { key: string; uploadId: string }) {
      return post<{ aborted: boolean }>(
        "/api/s3/presign/multipart/abort",
        payload
      )
    },
  },
}
