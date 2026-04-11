"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { XIcon, CheckCircleIcon, AlertCircleIcon } from "lucide-react"
import { toast } from "sonner"
import { formatFileSize } from "@/lib/s3/types"
import type { UploadProgress, MultiUploadFileState } from "@/lib/s3/types"
import { Button } from "@/components/ui/button"
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress"
import { CircleProgress } from "@/components/ui/circle-progress"
import {
  UploadShell,
  type UploadVariantType,
} from "@/components/upload/upload-shell"
import {
  useMultiUpload,
  type UseMultiUploadOptions,
} from "@/hooks/use-multi-upload"

export type MultiUploadProps = {
  variant?: UploadVariantType
  children?: ReactNode
  className?: string
  label?: string
  disabled?: boolean
  tooltipText?: string
  objectKey: (file: File) => string
} & UseMultiUploadOptions

export function MultiUpload({
  variant = "button",
  objectKey,
  children,
  className,
  label,
  disabled,
  tooltipText = "Upload files",
  ...options
}: MultiUploadProps) {
  return (
    <MultiUploadInner
      variant={variant}
      objectKey={objectKey}
      options={options}
      className={className}
      label={label}
      disabled={disabled}
      tooltipText={tooltipText}
    >
      {children}
    </MultiUploadInner>
  )
}

// ─── Inner ──────────────────────────────────────────────────────────────

function MultiUploadInner({
  variant,
  objectKey,
  options,
  children,
  className,
  label,
  disabled,
  tooltipText,
}: {
  variant: UploadVariantType
  objectKey: (file: File) => string
  options: UseMultiUploadOptions
  children?: ReactNode
  className?: string
  label?: string
  disabled?: boolean
  tooltipText?: string
}) {
  const ctx = useMultiUpload(options)
  const toastIdRef = useRef<string | null>(null)

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) return
    const files = Array.from(fileList)

    const toastId = `multi-upload-${Date.now()}`
    toastIdRef.current = toastId
    toast.loading(`Uploading ${files.length} file(s)…`, {
      id: toastId,
      description: formatFileSize(files.reduce((s, f) => s + f.size, 0)),
      cancel: { label: "Cancel", onClick: () => ctx.cancel() },
    })

    await ctx.upload(files, objectKey)
  }

  const prevPhaseRef = useRef(ctx.phase)
  if (prevPhaseRef.current !== ctx.phase) {
    prevPhaseRef.current = ctx.phase
    if (ctx.phase === "idle" && toastIdRef.current) {
      toast.dismiss(toastIdRef.current)
      toastIdRef.current = null
    }
    if (ctx.phase === "success") {
      if (toastIdRef.current) toast.dismiss(toastIdRef.current)
      toast.success(`${ctx.files.length} file(s) uploaded`, {
        description: formatFileSize(ctx.totalProgress.total),
      })
      toastIdRef.current = null
    }
    if (ctx.phase === "error" && ctx.files.length > 0) {
      const succeeded = ctx.files.filter((f) => f.status === "success").length
      const failed = ctx.files.filter((f) => f.status === "error").length
      if (toastIdRef.current) toast.dismiss(toastIdRef.current)
      toast.error("Upload finished with errors", {
        description: `${succeeded} succeeded, ${failed} failed`,
      })
      toastIdRef.current = null
    }
  }

  useEffect(() => {
    if (ctx.phase === "uploading" && toastIdRef.current) {
      const done = ctx.files.filter((f) => f.status === "success").length
      toast.loading(`Uploading… ${done}/${ctx.files.length}`, {
        id: toastIdRef.current,
        description: `${formatFileSize(ctx.totalProgress.loaded)} / ${formatFileSize(ctx.totalProgress.total)} (${ctx.totalProgress.percent}%)`,
        cancel: { label: "Cancel", onClick: () => ctx.cancel() },
      })
    }
  }, [
    ctx.phase,
    ctx.totalProgress.percent,
    ctx.totalProgress.loaded,
    ctx.files,
    ctx.cancel,
  ])

  return (
    <UploadShell
      variant={variant}
      className={className}
      label={label}
      defaultLabel="Upload files"
      defaultDropLabel="Click or drag & drop files to upload"
      disabled={disabled}
      tooltipText={tooltipText}
      multiple
      accept={options.accept?.join(",")}
      isUploading={ctx.phase === "uploading"}
      onFiles={handleFiles}
      status={
        <MultiUploadStatus
          phase={ctx.phase}
          files={ctx.files}
          totalProgress={ctx.totalProgress}
          error={ctx.error}
          onCancel={ctx.cancel}
        />
      }
    >
      {children}
    </UploadShell>
  )
}

// ─── Status ─────────────────────────────────────────────────────────────

function MultiUploadStatus({
  phase,
  files,
  totalProgress,
  error,
  onCancel,
}: {
  phase: string
  files: MultiUploadFileState[]
  totalProgress: UploadProgress
  error: string | null
  onCancel?: () => void
}) {
  if (phase === "idle") return null

  if (phase === "uploading") {
    return (
      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full items-center gap-1.5">
          <Progress value={totalProgress.percent} className="flex-1">
            <ProgressLabel>
              {files.filter((f) => f.status === "success").length}/
              {files.length} files
            </ProgressLabel>
            <ProgressValue />
          </Progress>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            onClick={(e) => {
              e.stopPropagation()
              onCancel?.()
            }}
          >
            <XIcon className="size-4" />
          </Button>
        </div>
        <FileList files={files} />
      </div>
    )
  }

  if (phase === "success") {
    return (
      <div className="flex w-full flex-col gap-1">
        <span className="text-xs text-green-600">
          All {files.length} file(s) uploaded
        </span>
        <FileList files={files} />
      </div>
    )
  }

  if (phase === "error") {
    return (
      <div className="flex w-full flex-col gap-1">
        <span className="text-xs text-destructive">
          {error ?? "Upload failed"}
        </span>
        {files.length > 0 && <FileList files={files} />}
      </div>
    )
  }

  if (phase === "validating") {
    return <span className="text-xs text-muted-foreground">Validating…</span>
  }

  return null
}

// ─── File List ──────────────────────────────────────────────────────────

function FileList({ files }: { files: MultiUploadFileState[] }) {
  return (
    <ul className="flex flex-col gap-1">
      {files.map((f) => (
        <li key={f.id} className="flex flex-col gap-0.5 text-xs">
          <div className="flex items-center gap-1.5">
            {f.status === "success" && (
              <CheckCircleIcon className="size-3.5 shrink-0 text-green-600" />
            )}
            {f.status === "error" && (
              <AlertCircleIcon className="size-3.5 shrink-0 text-destructive" />
            )}
            {(f.status === "pending" || f.status === "uploading") && (
              <CircleProgress
                percent={f.status === "uploading" ? f.progress.percent : 0}
                size={14}
                strokeWidth={2}
              />
            )}
            <span className="max-w-32 min-w-16 truncate sm:max-w-48">
              {f.fileName}
            </span>
            {f.status === "uploading" ? (
              <span className="shrink-0 text-muted-foreground">
                {formatFileSize(f.progress.loaded)} /{" "}
                {formatFileSize(f.fileSize)} ({f.progress.percent}%)
              </span>
            ) : (
              <span className="shrink-0 text-muted-foreground">
                {formatFileSize(f.fileSize)}
              </span>
            )}
          </div>
          {f.status === "error" && f.error && (
            <span className="pl-5 text-destructive">{f.error}</span>
          )}
        </li>
      ))}
    </ul>
  )
}
