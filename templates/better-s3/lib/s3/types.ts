export type UploadPayload = {
  fileName: string
  contentType?: string
  fileSize?: number
}

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
  onSuccess?: (file: File, result: UploadResult) => void
  onError?: (file: File | null, error: unknown, phase: UploadPhase) => void
  afterUpload?: (file: File, result: UploadResult) => Promise<void> | void
}

export type UploadConfig = {
  multipart?: boolean
  accept?: string[]
  maxFileSize?: number
  multipartThreshold?: number
}
