// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

export type PresignResponse = {
  key: string
  bucket: string
  url: string
  expiresIn: number
}

export type MultipartInitResponse = {
  key: string
  bucket: string
  uploadId: string
}

export type MultipartPartResponse = {
  presignedUrl: string
  partNumber: number
  uploadId: string
  bucket: string
  expiresIn: number
}

// ---------------------------------------------------------------------------
// Upload
// ---------------------------------------------------------------------------

export type UploadResult = {
  key: string
  url?: string
  eTag?: string
}

export type UploadProgress = {
  loaded: number
  total: number
  percent: number
}

export type UploadPhase =
  | "idle"
  | "validating"
  | "presigning"
  | "uploading"
  | "finalizing"
  | "success"
  | "error"

export type UploadHooks = {
  beforeUpload?: (file: File) => Promise<boolean> | boolean
  onUploadStart?: (file: File, key: string) => void
  onProgress?: (file: File, progress: UploadProgress) => void
  onSuccess?: (file: File, result: UploadResult) => Promise<void> | void
  onError?: (file: File | null, error: unknown, phase: UploadPhase) => void
  onCancel?: (file: File | null) => void
}

export type UploadConfig = {
  multipart?: boolean
  accept?: string[]
  maxFileSize?: number
  maxFiles?: number
  multipartThreshold?: number
}

// ---------------------------------------------------------------------------
// Multi-Upload
// ---------------------------------------------------------------------------

export type MultiUploadPhase =
  | "idle"
  | "validating"
  | "uploading"
  | "success"
  | "error"

export type MultiUploadFileState = {
  id: string
  fileName: string
  fileSize: number
  status: "pending" | "uploading" | "success" | "error"
  progress: UploadProgress
  error: string | null
}

export type MultiUploadHooks = {
  beforeUpload?: (files: File[]) => Promise<boolean> | boolean
  onUploadStart?: (files: File[]) => void
  onFileProgress?: (file: File, progress: UploadProgress) => void
  onFileSuccess?: (file: File, result: UploadResult) => void
  onFileError?: (file: File, error: string) => void
  onProgress?: (progress: UploadProgress) => void
  onSuccess?: (results: UploadResult[]) => Promise<void> | void
  onError?: (error: unknown) => void
  onCancel?: () => void
}

// ---------------------------------------------------------------------------
// Download
// ---------------------------------------------------------------------------

export type DownloadPhase =
  | "idle"
  | "presigning"
  | "downloading"
  | "success"
  | "error"

export type DownloadProgress = {
  loaded: number
  total: number
  percent: number
}

export type DownloadHooks = {
  beforeDownload?: (key: string) => Promise<boolean> | boolean
  onDownloadStart?: (key: string) => void
  onProgress?: (key: string, progress: DownloadProgress) => void
  onSuccess?: (key: string) => Promise<void> | void
  onError?: (key: string, error: unknown, phase: DownloadPhase) => void
  onCancel?: (key: string) => void
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export type DeletePhase =
  | "idle"
  | "confirming"
  | "deleting"
  | "success"
  | "error"

export type DeleteHooks = {
  beforeDelete?: (key: string) => Promise<boolean> | boolean
  onDeleteStart?: (key: string) => void
  onSuccess?: (key: string) => Promise<void> | void
  onError?: (key: string, error: unknown, phase: DeletePhase) => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const units = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = bytes / Math.pow(1024, i)
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}
