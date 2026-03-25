"use client"

import { DownloadIcon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { formatFileSize } from "@/lib/s3/types"
import type { DownloadHooks } from "@/lib/s3/types"
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
import { useDownload } from "@/hooks/use-download"

type DownloadButtonProps = DownloadHooks & {
  objectKey: string
  fileName?: string
  fileSize?: number
  label?: string
  className?: string
  disabled?: boolean
  tooltipText?: string
}

export function DownloadButton({
  objectKey,
  fileName,
  fileSize,
  label,
  className,
  disabled,
  tooltipText = "Download file",
  beforeDownload,
  onDownloadStart,
  onProgress,
  onSuccess,
  onError,
  afterDownload,
}: DownloadButtonProps) {
  const displayName = fileName ?? objectKey.split("/").pop() ?? objectKey

  const dl = useDownload({
    beforeDownload,
    onDownloadStart,
    onProgress,
    onSuccess: (key) => {
      toast.success("Download complete", { description: displayName })
      onSuccess?.(key)
    },
    onError: (key, error, phase) => {
      toast.error("Download failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
      onError?.(key, error, phase)
    },
    afterDownload,
  })

  const isDisabled =
    disabled || dl.phase === "downloading" || dl.phase === "presigning"

  const handleClick = () => {
    toast.loading("Downloading…", {
      id: `dl-${objectKey}`,
      description: `${displayName}${fileSize != null ? ` · ${formatFileSize(fileSize)}` : ""}`,
    })
    dl.download(objectKey, displayName).finally(() => {
      toast.dismiss(`dl-${objectKey}`)
    })
  }

  return (
    <div className={cn("inline-flex flex-col gap-1.5", className)}>
      <div className="inline-flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  size="default"
                  variant="outline"
                  disabled={isDisabled}
                  onClick={handleClick}
                />
              }
            >
              <DownloadIcon data-icon="inline-start" />
              {label ?? "Download"}
            </TooltipTrigger>
            <TooltipContent>{tooltipText}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {(dl.phase === "idle" || dl.phase === "presigning") &&
          fileSize != null && (
            <span className="text-xs text-muted-foreground">
              {displayName} · {formatFileSize(fileSize)}
            </span>
          )}
      </div>

      {dl.phase === "downloading" && (
        <Progress value={dl.progress.percent}>
          <ProgressLabel>
            {dl.fileName ?? displayName}
            {dl.fileSize != null && (
              <span className="text-muted-foreground">
                {" "}
                · {formatFileSize(dl.fileSize)}
              </span>
            )}
          </ProgressLabel>
          <ProgressValue />
        </Progress>
      )}
    </div>
  )
}
