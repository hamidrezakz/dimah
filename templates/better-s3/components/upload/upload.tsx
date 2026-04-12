"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { XIcon, CheckCircleIcon, AlertCircleIcon } from "lucide-react"
import { toast } from "sonner"
import { formatFileSize } from "@/lib/s3/types"
import type { UploadPhase, UploadProgress } from "@/lib/s3/types"
import { Button } from "@/components/ui/button"
import { CircleProgress } from "@/components/ui/circle-progress"
import {
  UploadShell,
  type UploadVariantType,
} from "@/components/upload/upload-shell"
import {
  useUploadContext,
  UploadProvider,
} from "@/components/upload/upload-context"
import type { UseUploadOptions } from "@/hooks/use-upload"

export type UploadProps = {
  variant?: UploadVariantType
  children?: ReactNode
  className?: string
  label?: string
  disabled?: boolean
  tooltipText?: string
  objectKey: string | ((file: File) => string)
} & UseUploadOptions

export function Upload({
  variant = "button",
  objectKey,
  children,
  className,
  label,
  disabled,
  tooltipText,
  ...options
}: UploadProps) {
  return (
    <UploadProvider {...options}>
      <UploadInner
        variant={variant}
        objectKey={objectKey}
        className={className}
        label={label}
        disabled={disabled}
        tooltipText={tooltipText}
      >
        {children}
      </UploadInner>
    </UploadProvider>
  )
}

// ─── Inner ──────────────────────────────────────────────────────────────

function UploadInner({
  variant,
  objectKey,
  children,
  className,
  label,
  disabled,
  tooltipText = "Upload file",
}: {
  variant: UploadVariantType
  objectKey: string | ((file: File) => string)
  children?: ReactNode
  className?: string
  label?: string
  disabled?: boolean
  tooltipText?: string
}) {
  const ctx = useUploadContext()
  const [fileInfo, setFileInfo] = useState<{
    name: string
    size: number
  } | null>(null)
  const toastIdRef = useRef<string | null>(null)

  const resolveKey = (file: File): string =>
    typeof objectKey === "function" ? objectKey(file) : objectKey

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    setFileInfo({ name: file.name, size: file.size })
    const key = resolveKey(file)

    const toastId = `upload-${Date.now()}`
    toastIdRef.current = toastId
    toast.loading("Uploading…", {
      id: toastId,
      description: formatFileSize(file.size),
      cancel: {
        label: "Cancel",
        onClick: () => ctx.cancel(),
      },
    })

    await ctx.upload(file, key)
  }

  const prevPhaseRef = useRef(ctx.phase)
  if (prevPhaseRef.current !== ctx.phase) {
    prevPhaseRef.current = ctx.phase
    if (ctx.phase === "idle" && toastIdRef.current) {
      toast.dismiss(toastIdRef.current)
      toastIdRef.current = null
    }
    if (ctx.phase === "success" && fileInfo) {
      if (toastIdRef.current) toast.dismiss(toastIdRef.current)
      toast.success("Upload complete", {
        description: formatFileSize(fileInfo.size),
      })
      toastIdRef.current = null
    }
    if (ctx.phase === "error" && fileInfo) {
      if (toastIdRef.current) toast.dismiss(toastIdRef.current)
      toast.error("Upload failed", {
        description: ctx.error ?? "Unknown error",
      })
      toastIdRef.current = null
    }
  }

  useEffect(() => {
    if (ctx.phase === "uploading" && toastIdRef.current && fileInfo) {
      const tid = toastIdRef.current
      toast.loading("Uploading…", {
        id: tid,
        description: `${formatFileSize(ctx.progress.loaded)} / ${formatFileSize(fileInfo.size)} (${ctx.progress.percent}%)`,
        cancel: {
          label: "Cancel",
          onClick: () => ctx.cancel(),
        },
      })
    }
  }, [
    ctx.phase,
    ctx.progress.percent,
    ctx.progress.loaded,
    fileInfo,
    ctx.cancel,
  ])

  return (
    <UploadShell
      variant={variant}
      className={className}
      label={label}
      defaultLabel="Upload file"
      defaultDropLabel="Click or drag & drop to upload"
      disabled={disabled}
      tooltipText={tooltipText}
      accept={ctx.options.accept?.join(",")}
      isUploading={ctx.phase === "uploading"}
      onFiles={handleFiles}
      status={
        <UploadStatus
          phase={ctx.phase}
          progress={ctx.progress}
          error={ctx.error}
          fileInfo={fileInfo}
          onCancel={ctx.cancel}
        />
      }
    >
      {children}
    </UploadShell>
  )
}

// ─── Status ─────────────────────────────────────────────────────────────

function UploadStatus({
  phase,
  progress,
  error,
  fileInfo,
  onCancel,
}: {
  phase: UploadPhase
  progress: UploadProgress
  error: string | null
  fileInfo: { name: string; size: number } | null
  onCancel?: () => void
}) {
  if (phase === "idle") return null

  if (phase === "uploading" && fileInfo) {
    return (
      <div className="flex w-full items-center gap-1.5 text-xs">
        <CircleProgress percent={progress.percent} size={14} strokeWidth={2} />
        <span className="max-w-32 min-w-16 truncate sm:max-w-48">
          {fileInfo.name}
        </span>
        <span className="shrink-0 text-muted-foreground">
          {formatFileSize(progress.loaded)} / {formatFileSize(fileInfo.size)} (
          {progress.percent}%)
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto size-6 shrink-0"
          onClick={(e) => {
            e.stopPropagation()
            onCancel?.()
          }}
        >
          <XIcon className="size-3.5" />
        </Button>
      </div>
    )
  }

  if (phase === "success" && fileInfo) {
    return (
      <div className="flex items-center gap-1.5 text-xs">
        <CheckCircleIcon className="size-3.5 shrink-0 text-green-600" />
        <span className="max-w-32 min-w-16 truncate sm:max-w-48">
          {fileInfo.name}
        </span>
        <span className="shrink-0 text-muted-foreground">
          {formatFileSize(fileInfo.size)}
        </span>
      </div>
    )
  }

  if (phase === "error") {
    return (
      <div className="flex flex-col gap-1 text-xs">
        <div className="flex items-center gap-1.5">
          <AlertCircleIcon className="size-3.5 shrink-0 text-destructive" />
          {fileInfo && (
            <>
              <span className="max-w-32 min-w-16 truncate sm:max-w-48">
                {fileInfo.name}
              </span>
              <span className="shrink-0 text-muted-foreground">
                {formatFileSize(fileInfo.size)}
              </span>
            </>
          )}
        </div>
        <span className="text-destructive">{error ?? "Upload failed"}</span>
      </div>
    )
  }

  if (phase === "validating" || phase === "presigning") {
    return <span className="text-xs text-muted-foreground">Preparing…</span>
  }

  return null
}
