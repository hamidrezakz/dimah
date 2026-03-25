"use client"

import { useRef, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { useUploadContext } from "@/components/upload/upload-context"
import { UploadProvider } from "@/components/upload/upload-context"
import type { UseUploadOptions } from "@/hooks/use-upload"
import type { UploadPhase, UploadProgress } from "@/lib/s3/types"

export type UploadVariantType = "button" | "dropzone" | "custom"

type UploadProps = UseUploadOptions & {
  variant?: UploadVariantType
  objectKey: string | ((file: File) => string)
  children?: ReactNode
  className?: string
  label?: string
  disabled?: boolean
}

export function Upload(props: UploadProps) {
  const {
    variant = "button",
    objectKey,
    children,
    className,
    label,
    disabled,
    ...options
  } = props
  return (
    <UploadProvider {...options}>
      <UploadInner
        variant={variant}
        objectKey={objectKey}
        className={className}
        label={label}
        disabled={disabled}
      >
        {children}
      </UploadInner>
    </UploadProvider>
  )
}

function UploadInner({
  variant,
  objectKey,
  children,
  className,
  label,
  disabled,
}: {
  variant: UploadVariantType
  objectKey: string | ((file: File) => string)
  children?: ReactNode
  className?: string
  label?: string
  disabled?: boolean
}) {
  const ctx = useUploadContext()
  const inputRef = useRef<HTMLInputElement>(null)

  const isDisabled = disabled || ctx.phase === "uploading"

  const resolveKey = (file: File): string =>
    typeof objectKey === "function" ? objectKey(file) : objectKey

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    const key = resolveKey(file)
    await ctx.upload(file, key)
  }

  const openFilePicker = () => inputRef.current?.click()

  const acceptAttr = ctx.options.accept?.join(",")

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept={acceptAttr}
      className="hidden"
      disabled={isDisabled}
      onChange={(e) => handleFiles(e.target.files)}
    />
  )

  if (variant === "button") {
    return (
      <div className={cn("inline-flex flex-col gap-2", className)}>
        {fileInput}
        <button
          type="button"
          disabled={isDisabled}
          onClick={openFilePicker}
          className="inline-flex h-8 items-center justify-center gap-2 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/80 disabled:pointer-events-none disabled:opacity-50"
        >
          {label ?? "Upload file"}
        </button>
        <UploadStatus
          phase={ctx.phase}
          progress={ctx.progress}
          error={ctx.error}
        />
      </div>
    )
  }

  if (variant === "dropzone") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors",
          isDisabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer border-muted-foreground/25 hover:border-primary/50",
          className
        )}
        onClick={openFilePicker}
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (!isDisabled) handleFiles(e.dataTransfer.files)
        }}
      >
        {fileInput}
        <p className="text-sm text-muted-foreground">
          {label ?? "Click or drag & drop to upload"}
        </p>
        <UploadStatus
          phase={ctx.phase}
          progress={ctx.progress}
          error={ctx.error}
        />
      </div>
    )
  }

  // variant === "custom"
  return (
    <div
      className={cn("relative", className)}
      onClick={openFilePicker}
      onDragOver={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onDrop={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!isDisabled) handleFiles(e.dataTransfer.files)
      }}
    >
      {fileInput}
      {children}
      <UploadStatus
        phase={ctx.phase}
        progress={ctx.progress}
        error={ctx.error}
      />
    </div>
  )
}

function UploadStatus({
  phase,
  progress,
  error,
}: {
  phase: UploadPhase
  progress: UploadProgress
  error: string | null
}) {
  if (phase === "idle") return null

  if (phase === "uploading") {
    return (
      <div className="flex w-full flex-col gap-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {progress.percent}%
        </span>
      </div>
    )
  }

  if (phase === "success") {
    return <span className="text-xs text-green-600">Upload complete</span>
  }

  if (phase === "error") {
    return (
      <span className="text-xs text-destructive">
        {error ?? "Upload failed"}
      </span>
    )
  }

  if (phase === "validating" || phase === "presigning") {
    return <span className="text-xs text-muted-foreground">Preparing…</span>
  }

  return null
}
