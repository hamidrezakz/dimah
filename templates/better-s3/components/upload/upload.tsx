"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { UploadIcon, XIcon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { formatFileSize } from "@/lib/s3/types"
import type { UploadPhase, UploadProgress } from "@/lib/s3/types"
import { Button } from "@/components/ui/button"
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useUploadContext } from "@/components/upload/upload-context"
import { UploadProvider } from "@/components/upload/upload-context"
import type { UseUploadOptions } from "@/hooks/use-upload"

export type UploadVariantType = "button" | "dropzone" | "custom"

type UploadProps = UseUploadOptions & {
  variant?: UploadVariantType
  objectKey: string | ((file: File) => string)
  children?: ReactNode
  className?: string
  label?: string
  disabled?: boolean
  tooltipText?: string
}

export function Upload(props: UploadProps) {
  const {
    variant = "button",
    objectKey,
    children,
    className,
    label,
    disabled,
    tooltipText,
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
        tooltipText={tooltipText}
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
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileInfo, setFileInfo] = useState<{
    name: string
    size: number
  } | null>(null)
  const toastIdRef = useRef<string | null>(null)

  const isDisabled = disabled || ctx.phase === "uploading"

  const resolveKey = (file: File): string =>
    typeof objectKey === "function" ? objectKey(file) : objectKey

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    setFileInfo({ name: file.name, size: file.size })
    const key = resolveKey(file)

    const toastId = `upload-${file.name}`
    toastIdRef.current = toastId
    toast.loading("Uploading…", {
      id: toastId,
      description: `${file.name} · ${formatFileSize(file.size)}`,
      cancel: {
        label: "Cancel",
        onClick: () => ctx.cancel(),
      },
    })

    await ctx.upload(file, key)

    if (ctx.phase === "error") {
      toast.error("Upload failed", {
        id: toastId,
        description: ctx.error ?? file.name,
      })
    }
  }

  // Show toast on phase transitions via effect-free check
  const prevPhaseRef = useRef(ctx.phase)
  if (prevPhaseRef.current !== ctx.phase) {
    prevPhaseRef.current = ctx.phase
    if (ctx.phase === "success" && fileInfo) {
      toast.success("Upload complete", {
        id: toastIdRef.current ?? undefined,
        description: `${fileInfo.name} · ${formatFileSize(fileInfo.size)}`,
      })
      toastIdRef.current = null
    }
    if (ctx.phase === "error" && fileInfo) {
      toast.error("Upload failed", {
        id: toastIdRef.current ?? undefined,
        description: ctx.error ?? fileInfo.name,
      })
      toastIdRef.current = null
    }
  }

  useEffect(() => {
    if (ctx.phase === "uploading" && toastIdRef.current && fileInfo) {
      toast.loading(`Uploading… (${ctx.progress.percent}%)`, {
        id: toastIdRef.current,
        description: `${fileInfo.name} · ${formatFileSize(fileInfo.size)}`,
        cancel: {
          label: "Cancel",
          onClick: () => ctx.cancel(),
        },
      })
    }
  }, [ctx.phase, ctx.progress.percent, fileInfo, ctx.cancel])

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
        <div className="inline-flex items-center gap-2">
          {fileInput}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    size="default"
                    disabled={isDisabled}
                    onClick={openFilePicker}
                  />
                }
              >
                <UploadIcon data-icon="inline-start" />
                {label ?? "Upload file"}
              </TooltipTrigger>
              <TooltipContent>{tooltipText}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <UploadStatus
          phase={ctx.phase}
          progress={ctx.progress}
          error={ctx.error}
          fileInfo={fileInfo}
          onCancel={ctx.cancel}
        />
      </div>
    )
  }

  if (variant === "dropzone") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 text-center transition-colors",
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
        <UploadIcon className="size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {label ?? "Click or drag & drop to upload"}
        </p>
        <UploadStatus
          phase={ctx.phase}
          progress={ctx.progress}
          error={ctx.error}
          fileInfo={fileInfo}
          onCancel={ctx.cancel}
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
        fileInfo={fileInfo}
        onCancel={ctx.cancel}
      />
    </div>
  )
}

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

  if (phase === "uploading") {
    return (
      <div className="flex w-full items-center gap-1.5">
        <Progress value={progress.percent} className="flex-1">
          <ProgressLabel>
            {fileInfo?.name ?? "Uploading…"}
            {fileInfo?.size != null && (
              <span className="text-muted-foreground">
                {" "}
                · {formatFileSize(fileInfo.size)}
              </span>
            )}
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
    )
  }

  if (phase === "success") {
    return (
      <span className="text-xs text-green-600">
        Upload complete
        {fileInfo && ` — ${fileInfo.name}`}
      </span>
    )
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
