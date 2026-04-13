"use client"

import {
  useUploadControls,
  useMultiUploadControls,
  useDownload,
  useDelete,
} from "@better-s3/react"
import { UploadIcon, DownloadIcon, Trash2Icon, XIcon } from "lucide-react"
import { presignApi } from "@/lib/s3/presign-api"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"

export function HeadlessExamples() {
  return (
    <div className="flex flex-col gap-8">
      <h2 className="border-b pb-2 text-base font-medium">Headless Hooks</h2>

      {/* useUploadControls */}
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          useUploadControls
        </h3>
        <p className="text-xs text-muted-foreground">
          Build your own upload UI from scratch with a single hook.
        </p>
        <div className="mt-1">
          <HeadlessUploadDemo />
        </div>
      </section>

      {/* useMultiUploadControls */}
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          useMultiUploadControls
        </h3>
        <p className="text-xs text-muted-foreground">
          Same headless approach for multi-file uploads with per-file tracking.
        </p>
        <div className="mt-1">
          <HeadlessMultiUploadDemo />
        </div>
      </section>

      {/* useDownload */}
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          useDownload
        </h3>
        <p className="text-xs text-muted-foreground">
          Download files with progress tracking using fetch mode.
        </p>
        <div className="mt-1">
          <HeadlessDownloadDemo />
        </div>
      </section>

      {/* useDelete */}
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">useDelete</h3>
        <p className="text-xs text-muted-foreground">
          Delete files with a confirm/execute flow.
        </p>
        <div className="mt-1">
          <HeadlessDeleteDemo />
        </div>
      </section>
    </div>
  )
}

// ─── Headless Hook Demos ────────────────────────────────────────────────

function HeadlessUploadDemo() {
  const upload = useUploadControls({
    presignApi,
    objectKey: (file) => `headless/${Date.now()}-${file.name}`,
    accept: ["image/*"],
    maxFileSize: 10 * 1024 * 1024,
    onSuccess: (file) => console.log("Headless upload done:", file.name),
  })

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <input {...upload.inputProps} />
      <div className="flex items-center gap-3">
        <Button disabled={upload.isUploading} onClick={upload.openFilePicker}>
          <UploadIcon data-icon="inline-start" />
          {upload.isUploading ? "Uploading…" : "Pick a File"}
        </Button>
        {upload.isUploading && (
          <Button variant="ghost" size="sm" onClick={upload.cancel}>
            <XIcon data-icon="inline-start" />
            Cancel
          </Button>
        )}
        {upload.phase !== "idle" && !upload.isUploading && (
          <Button variant="ghost" size="sm" onClick={upload.reset}>
            Reset
          </Button>
        )}
      </div>
      {upload.isUploading && (
        <Progress value={upload.progress.percent}>
          {upload.progress.percent}%
        </Progress>
      )}
      {upload.phase === "success" && upload.fileInfo && (
        <p className="text-xs text-green-600">
          ✓ {upload.fileInfo.name} uploaded
        </p>
      )}
      {upload.error && (
        <p className="text-xs text-destructive">{upload.error}</p>
      )}
    </div>
  )
}

function HeadlessMultiUploadDemo() {
  const upload = useMultiUploadControls({
    presignApi,
    objectKey: (file) => `headless-multi/${Date.now()}-${file.name}`,
    accept: ["image/*"],
    maxFileSize: 10 * 1024 * 1024,
    maxFiles: 5,
    onSuccess: (results) => console.log("Headless multi done:", results),
  })

  return (
    <div
      className="flex flex-col gap-3 rounded-lg border p-4"
      {...upload.dropHandlers}
    >
      <input {...upload.inputProps} />
      <div className="flex items-center gap-3">
        <Button disabled={upload.isUploading} onClick={upload.openFilePicker}>
          <UploadIcon data-icon="inline-start" />
          {upload.isUploading ? "Uploading…" : "Pick Files"}
        </Button>
        {upload.isUploading && (
          <Button variant="ghost" size="sm" onClick={upload.cancel}>
            <XIcon data-icon="inline-start" />
            Cancel
          </Button>
        )}
      </div>
      {upload.isUploading && (
        <Progress value={upload.totalProgress.percent}>
          {upload.totalProgress.percent}%
        </Progress>
      )}
      {upload.files.length > 0 && (
        <ul className="flex flex-col gap-0.5 text-xs">
          {upload.files.map((f) => (
            <li key={f.id} className="flex items-center gap-1.5">
              <span
                className={
                  f.status === "success"
                    ? "text-green-600"
                    : f.status === "error"
                      ? "text-destructive"
                      : "text-muted-foreground"
                }
              >
                {f.status === "success"
                  ? "✓"
                  : f.status === "error"
                    ? "✕"
                    : `${f.progress.percent}%`}
              </span>
              <span className="truncate">{f.fileName}</span>
            </li>
          ))}
        </ul>
      )}
      {upload.error && (
        <p className="text-xs text-destructive">{upload.error}</p>
      )}
    </div>
  )
}

function HeadlessDownloadDemo() {
  const dl = useDownload({
    presignApi,
    mode: "fetch",
    onSuccess: (key) => console.log("Downloaded:", key),
  })

  const isBusy = dl.phase === "downloading" || dl.phase === "presigning"

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <Button
          disabled={isBusy}
          onClick={() => dl.download("uploads/example.pdf")}
        >
          <DownloadIcon data-icon="inline-start" />
          {dl.phase === "downloading"
            ? `${dl.progress.percent}%`
            : dl.phase === "presigning"
              ? "Preparing…"
              : "Download"}
        </Button>
        {dl.phase === "downloading" && (
          <Button variant="ghost" size="sm" onClick={dl.cancel}>
            <XIcon data-icon="inline-start" />
            Cancel
          </Button>
        )}
        {!isBusy && dl.phase !== "idle" && (
          <Button variant="ghost" size="sm" onClick={dl.reset}>
            Reset
          </Button>
        )}
      </div>
      {dl.phase === "downloading" && (
        <Progress value={dl.progress.percent}>{dl.progress.percent}%</Progress>
      )}
      {dl.phase === "success" && (
        <p className="text-xs text-green-600">✓ Download complete</p>
      )}
      {dl.error && <p className="text-xs text-destructive">{dl.error}</p>}
    </div>
  )
}

function HeadlessDeleteDemo() {
  const del = useDelete({
    presignApi,
    onSuccess: (key) => console.log("Deleted:", key),
  })

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <AlertDialog open={del.phase === "confirming"}>
        <AlertDialogTrigger
          render={
            <Button
              variant="destructive"
              disabled={del.phase === "deleting"}
              onClick={() => del.requestDelete("uploads/example.pdf")}
            />
          }
        >
          <Trash2Icon data-icon="inline-start" />
          {del.phase === "deleting" ? "Deleting…" : "Delete File"}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &ldquo;{del.pendingKey}&rdquo;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={del.cancelDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => del.confirmDelete()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {del.phase === "success" && (
        <p className="text-xs text-green-600">✓ File deleted</p>
      )}
      {del.error && <p className="text-xs text-destructive">{del.error}</p>}
    </div>
  )
}
