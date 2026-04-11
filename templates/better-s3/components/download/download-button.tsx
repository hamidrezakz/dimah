"use client"

import { DownloadIcon, XIcon } from "lucide-react"
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
  onCancel,
}: DownloadButtonProps) {
  const displayName = fileName ?? objectKey.split("/").pop() ?? objectKey

  const dl = useDownload({
    beforeDownload,
    onDownloadStart,
    onProgress: (key, progress) => {
      toast.loading(`Downloading… (${progress.percent}%)`, {
        id: `dl-${objectKey}`,
        description: `${displayName}${fileSize != null ? ` · ${formatFileSize(fileSize)}` : ""}`,
        cancel: {
          label: "Cancel",
          onClick: () => dl.cancel(),
        },
      })
      onProgress?.(key, progress)
    },
    onSuccess: (key) => {
      toast.success("Download complete", {
        id: `dl-${objectKey}`,
        description: displayName,
      })
      onSuccess?.(key)
    },
  })

  const isDisabled =
    disabled || dl.phase === "downloading" || dl.phase === "presigning"

  const handleClick = () => {
    toast.loading("Downloading…", {
      id: `dl-${objectKey}`,
      description: `${displayName}${fileSize != null ? ` · ${formatFileSize(fileSize)}` : ""}`,
      cancel: {
        label: "Cancel",
        onClick: () => dl.cancel(),
      },
    })
    dl.download(objectKey, displayName)
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
        <div className="flex w-full items-center gap-1.5">
          <Progress value={dl.progress.percent} className="flex-1">
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
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            onClick={() => dl.cancel()}
          >
            <XIcon className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
