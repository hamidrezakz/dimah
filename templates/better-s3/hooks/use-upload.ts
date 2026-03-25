"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type {
  UploadConfig,
  UploadHooks,
  UploadPhase,
  UploadProgress,
  UploadResult,
} from "@/lib/s3/types"

import { createUploader } from "@/lib/s3/create-uploader"
import { validateFile } from "@/lib/s3/validate"

export type UseUploadOptions = UploadConfig & UploadHooks

export type UseUploadState = {
  phase: UploadPhase
  progress: UploadProgress
  error: string | null
  result: UploadResult | null
}

export type UseUploadReturn = UseUploadState & {
  upload: (file: File, objectKey: string) => Promise<void>
  cancel: () => void
  reset: () => void
}

const INITIAL_PROGRESS: UploadProgress = { loaded: 0, total: 0, percent: 0 }

const INITIAL_STATE: UseUploadState = {
  phase: "idle",
  progress: INITIAL_PROGRESS,
  error: null,
  result: null,
}

export function useUpload(options: UseUploadOptions = {}): UseUploadReturn {
  const [state, setState] = useState<UseUploadState>(INITIAL_STATE)
  const optionsRef = useRef(options)
  optionsRef.current = options

  const uppy = useMemo(
    () => createUploader(options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options.multipart, options.accept?.join(","), options.maxFileSize]
  )

  useEffect(() => {
    const onProgress = (
      _file: unknown,
      progress: { bytesUploaded: number; bytesTotal: number | null }
    ) => {
      const total = progress.bytesTotal ?? 0
      const p: UploadProgress = {
        loaded: progress.bytesUploaded,
        total,
        percent:
          total > 0 ? Math.round((progress.bytesUploaded / total) * 100) : 0,
      }
      setState((s) => ({ ...s, phase: "uploading", progress: p }))
    }

    const onComplete = () => {
      const files = uppy.getFiles()
      const first = files[0]
      if (first) {
        const result: UploadResult = {
          key: (first.meta["objectKey"] as string) ?? "",
          url: first.uploadURL ?? undefined,
        }
        setState((s) => ({ ...s, phase: "success", result }))
        optionsRef.current.onSuccess?.(first.data as File, result)
        optionsRef.current.afterUpload?.(first.data as File, result)
      }
    }

    const onError = (error: { name: string; message: string }) => {
      setState((s) => ({
        ...s,
        phase: "error",
        error: error.message,
      }))
      optionsRef.current.onError?.(null, error, "uploading")
    }

    uppy.on(
      "upload-progress",
      onProgress as Parameters<typeof uppy.on<"upload-progress">>[1]
    )
    uppy.on("complete", onComplete)
    uppy.on("error", onError as Parameters<typeof uppy.on<"error">>[1])

    return () => {
      uppy.off(
        "upload-progress",
        onProgress as Parameters<typeof uppy.off<"upload-progress">>[1]
      )
      uppy.off("complete", onComplete)
      uppy.off("error", onError as Parameters<typeof uppy.off<"error">>[1])
      uppy.clear()
    }
  }, [uppy])

  const upload = useCallback(
    async (file: File, objectKey: string) => {
      setState({ ...INITIAL_STATE, phase: "validating" })
      const opts = optionsRef.current

      const validationError = validateFile(file, {
        accept: opts.accept,
        maxFileSize: opts.maxFileSize,
      })
      if (validationError) {
        setState((s) => ({ ...s, phase: "error", error: validationError }))
        opts.onError?.(file, new Error(validationError), "validating")
        return
      }

      if (opts.beforeUpload) {
        const allowed = await opts.beforeUpload(file)
        if (!allowed) {
          setState((s) => ({
            ...s,
            phase: "error",
            error: "Upload blocked by beforeUpload hook",
          }))
          opts.onError?.(file, new Error("blocked"), "validating")
          return
        }
      }

      uppy.clear()
      uppy.addFile({
        name: file.name,
        type: file.type,
        data: file,
        meta: { objectKey },
      })

      setState((s) => ({ ...s, phase: "uploading" }))
      opts.onUploadStart?.(file, objectKey)

      try {
        await uppy.upload()
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed"
        setState((s) => ({ ...s, phase: "error", error: message }))
        opts.onError?.(file, err, "uploading")
      }
    },
    [uppy]
  )

  const cancel = useCallback(() => {
    uppy.cancelAll()
    setState(INITIAL_STATE)
  }, [uppy])

  const reset = useCallback(() => {
    uppy.clear()
    setState(INITIAL_STATE)
  }, [uppy])

  return { ...state, upload, cancel, reset }
}
