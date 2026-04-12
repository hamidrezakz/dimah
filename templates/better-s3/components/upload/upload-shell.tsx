"use client"

import { useRef, type ReactNode } from "react"
import { UploadIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type UploadVariantType = "button" | "dropzone" | "custom"

export function UploadShell({
  variant,
  children,
  className,
  label,
  defaultLabel,
  defaultDropLabel,
  disabled,
  tooltipText,
  multiple,
  accept,
  isUploading,
  onFiles,
  status,
}: {
  variant: UploadVariantType
  children?: ReactNode
  className?: string
  label?: string
  defaultLabel: string
  defaultDropLabel: string
  disabled?: boolean
  tooltipText?: string
  multiple?: boolean
  accept?: string
  isUploading: boolean
  onFiles: (files: FileList | null) => void
  status: ReactNode
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const isDisabled = disabled || isUploading
  const openFilePicker = () => inputRef.current?.click()

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      multiple={multiple}
      accept={accept}
      className="hidden"
      disabled={isDisabled}
      onChange={(e) => {
        onFiles(e.target.files)
        e.target.value = ""
      }}
    />
  )

  const dropHandlers = {
    onClick: openFilePicker,
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!isDisabled) onFiles(e.dataTransfer.files)
    },
  }

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
                {label ?? defaultLabel}
              </TooltipTrigger>
              <TooltipContent>{tooltipText}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {status}
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
        {...dropHandlers}
      >
        {fileInput}
        <UploadIcon className="size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {label ?? defaultDropLabel}
        </p>
        <div className="w-full text-left">{status}</div>
      </div>
    )
  }

  // custom
  return (
    <div className={cn("relative", className)} {...dropHandlers}>
      {fileInput}
      {children}
      {status}
    </div>
  )
}
