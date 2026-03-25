"use client"

import { Trash2Icon, LoaderIcon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { formatFileSize } from "@/lib/s3/types"
import type { DeleteHooks } from "@/lib/s3/types"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useDelete } from "@/hooks/use-delete"

type DeleteButtonProps = DeleteHooks & {
  objectKey: string
  fileName?: string
  fileSize?: number
  label?: string
  className?: string
  disabled?: boolean
  tooltipText?: string
  confirmTitle?: string
  confirmDescription?: string
}

export function DeleteButton({
  objectKey,
  fileName,
  fileSize,
  label,
  className,
  disabled,
  tooltipText = "Delete file",
  confirmTitle = "Delete file?",
  confirmDescription,
  beforeDelete,
  onDeleteStart,
  onSuccess,
  onError,
  afterDelete,
}: DeleteButtonProps) {
  const displayName = fileName ?? objectKey.split("/").pop() ?? objectKey

  const del = useDelete({
    beforeDelete,
    onDeleteStart,
    onSuccess: (key) => {
      toast.success("File deleted", { description: displayName })
      onSuccess?.(key)
    },
    onError: (key, error, phase) => {
      toast.error("Delete failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
      onError?.(key, error, phase)
    },
    afterDelete,
  })

  const isDeleting = del.phase === "deleting"
  const isDisabled = disabled || isDeleting

  const description =
    confirmDescription ??
    `Are you sure you want to delete "${displayName}"${fileSize != null ? ` (${formatFileSize(fileSize)})` : ""}? This action cannot be undone.`

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <AlertDialog
        open={del.phase === "confirming"}
        onOpenChange={(open) => {
          if (!open) del.cancelDelete()
        }}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              render={
                <AlertDialogTrigger
                  disabled={isDisabled}
                  onClick={() => del.requestDelete(objectKey)}
                  render={
                    <Button
                      size="default"
                      variant="destructive"
                      disabled={isDisabled}
                    />
                  }
                />
              }
            >
              {isDeleting ? (
                <LoaderIcon className="animate-spin" data-icon="inline-start" />
              ) : (
                <Trash2Icon data-icon="inline-start" />
              )}
              {label ?? "Delete"}
            </TooltipTrigger>
            <TooltipContent>{tooltipText}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => del.confirmDelete()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
