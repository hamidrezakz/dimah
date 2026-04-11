"use client"

import { Upload, MultiUpload } from "@/components/upload"
import { DownloadButton } from "@/components/download"
import { DeleteButton } from "@/components/delete"

export default function Page() {
  return (
    <div className="flex min-h-svh justify-center p-6 md:p-10">
      <div className="flex w-full max-w-2xl flex-col gap-12">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            S3 File Operations
          </h1>
          <p className="text-sm text-muted-foreground">
            Upload, download, and delete files from S3.
          </p>
        </div>

        {/* ── Upload ── */}
        <div className="flex flex-col gap-8">
          <h2 className="border-b pb-2 text-base font-medium">Upload</h2>

          {/* Button variant */}
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Button
            </h3>
            <p className="text-xs text-muted-foreground">
              Simple button that opens a file picker on click.
            </p>
            <div className="mt-1">
              <Upload
                variant="button"
                objectKey={(file) => `uploads/${Date.now()}-${file.name}`}
                accept={["image/*"]}
                maxFileSize={10 * 1024 * 1024}
                tooltipText="Select an image to upload"
                onSuccess={(file, result) =>
                  console.log("Uploaded:", file.name, result)
                }
              />
            </div>
          </section>

          {/* Button variant — custom label */}
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Button — Custom Label
            </h3>
            <p className="text-xs text-muted-foreground">
              Button with a custom label and PDF-only filter.
            </p>
            <div className="mt-1">
              <Upload
                variant="button"
                label="Upload PDF"
                objectKey={(file) => `pdfs/${file.name}`}
                accept={["application/pdf"]}
                maxFileSize={25 * 1024 * 1024}
                tooltipText="Select a PDF file"
              />
            </div>
          </section>

          {/* Dropzone variant */}
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Dropzone
            </h3>
            <p className="text-xs text-muted-foreground">
              Drag-and-drop area that also supports click to browse.
            </p>
            <div className="mt-1">
              <Upload
                variant="dropzone"
                objectKey={(file) => `documents/${file.name}`}
                accept={["application/pdf", "image/*"]}
                maxFileSize={50 * 1024 * 1024}
                tooltipText="Drop files here"
                beforeUpload={async (file) => {
                  console.log("Validating:", file.name)
                  return true
                }}
              />
            </div>
          </section>

          {/* Dropzone variant — custom label */}
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Dropzone — Custom Label
            </h3>
            <p className="text-xs text-muted-foreground">
              Dropzone with a custom label and image-only filter.
            </p>
            <div className="mt-1">
              <Upload
                variant="dropzone"
                label="Drop your images here"
                objectKey={(file) => `images/${file.name}`}
                accept={["image/png", "image/jpeg", "image/webp"]}
                maxFileSize={5 * 1024 * 1024}
              />
            </div>
          </section>

          {/* Custom variant */}
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Custom
            </h3>
            <p className="text-xs text-muted-foreground">
              Fully custom UI with drag-and-drop support — bring your own
              children.
            </p>
            <div className="mt-1">
              <Upload
                variant="custom"
                objectKey={(file) => `custom/${Date.now()}-${file.name}`}
                accept={["image/*", "application/pdf"]}
                maxFileSize={20 * 1024 * 1024}
              >
                <div className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed bg-muted/50 p-8 transition-colors hover:bg-muted">
                  <p className="text-sm text-muted-foreground">
                    ✨ Drag a file here or click to upload
                  </p>
                </div>
              </Upload>
            </div>
          </section>

          {/* Multipart upload */}
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Multipart Upload
            </h3>
            <p className="text-xs text-muted-foreground">
              Uses multipart upload for large files above the threshold.
            </p>
            <div className="mt-1">
              <Upload
                variant="button"
                label="Upload large file"
                objectKey={(file) => `large/${file.name}`}
                multipart
                multipartThreshold={20 * 1024 * 1024}
                onSuccess={(file, result) =>
                  console.log("Large file uploaded:", file.name, result)
                }
              />
            </div>
          </section>

          {/* Multipart + Dropzone */}
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Multipart + Dropzone
            </h3>
            <p className="text-xs text-muted-foreground">
              Combines dropzone with multipart for large file drag-and-drop.
            </p>
            <div className="mt-1">
              <Upload
                variant="dropzone"
                label="Drop large files here"
                objectKey={(file) => `large-drop/${file.name}`}
                multipart
                multipartThreshold={10 * 1024 * 1024}
              />
            </div>
          </section>

          {/* Multi-file — Button */}
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Multi-File — Button
            </h3>
            <p className="text-xs text-muted-foreground">
              Select multiple files at once. Uploads concurrently with per-file
              progress.
            </p>
            <div className="mt-1">
              <MultiUpload
                variant="button"
                objectKey={(file) => `multi/${Date.now()}-${file.name}`}
                accept={["image/*"]}
                maxFileSize={10 * 1024 * 1024}
                maxFiles={5}
                tooltipText="Select up to 5 images"
                onSuccess={(results) => console.log("All uploaded:", results)}
              />
            </div>
          </section>

          {/* Multi-file — Dropzone */}
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Multi-File — Dropzone
            </h3>
            <p className="text-xs text-muted-foreground">
              Drag and drop multiple files. Shows per-file status list.
            </p>
            <div className="mt-1">
              <MultiUpload
                variant="dropzone"
                label="Drop multiple files here"
                objectKey={(file) => `batch/${file.name}`}
                accept={["image/*", "application/pdf"]}
                maxFileSize={25 * 1024 * 1024}
                maxFiles={10}
              />
            </div>
          </section>

          {/* Multi-file + Multipart */}
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Multi-File + Multipart
            </h3>
            <p className="text-xs text-muted-foreground">
              Multiple large files with multipart upload for each.
            </p>
            <div className="mt-1">
              <MultiUpload
                variant="dropzone"
                label="Drop large files here"
                objectKey={(file) => `multi-large/${file.name}`}
                multipart
                multipartThreshold={20 * 1024 * 1024}
                maxFiles={5}
              />
            </div>
          </section>
        </div>

        {/* ── Download ── */}
        <div className="flex flex-col gap-8">
          <h2 className="border-b pb-2 text-base font-medium">Download</h2>

          {/* Basic */}
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">Basic</h3>
            <p className="text-xs text-muted-foreground">
              Minimal download button with just an object key.
            </p>
            <div className="mt-1">
              <DownloadButton objectKey="uploads/example.pdf" />
            </div>
          </section>

          {/* With metadata + callbacks */}
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              With Metadata &amp; Callbacks
            </h3>
            <p className="text-xs text-muted-foreground">
              Shows file name, size, tooltip, and all lifecycle callbacks.
            </p>
            <div className="mt-1">
              <DownloadButton
                objectKey="uploads/example.pdf"
                fileName="example.pdf"
                fileSize={2_400_000}
                tooltipText="Download the example PDF"
                beforeDownload={async (key) => {
                  console.log("Before download:", key)
                  return true
                }}
                onDownloadStart={(key) => console.log("Download started:", key)}
                onProgress={(key, progress) =>
                  console.log(`Download ${key}: ${progress.percent}%`)
                }
                onSuccess={(key) => console.log("Downloaded:", key)}
                onError={(key, error) =>
                  console.error("Download error:", key, error)
                }
              />
            </div>
          </section>

          {/* Custom label */}
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Custom Label
            </h3>
            <p className="text-xs text-muted-foreground">
              Download button with a custom label.
            </p>
            <div className="mt-1">
              <DownloadButton
                objectKey="reports/annual-2025.xlsx"
                fileName="annual-report-2025.xlsx"
                label="Get Report"
                fileSize={5_600_000}
                tooltipText="Download the annual report"
              />
            </div>
          </section>
        </div>

        {/* ── Delete ── */}
        <div className="flex flex-col gap-8">
          <h2 className="border-b pb-2 text-base font-medium">Delete</h2>

          {/* Basic */}
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">Basic</h3>
            <p className="text-xs text-muted-foreground">
              Minimal delete button with a confirmation dialog.
            </p>
            <div className="mt-1">
              <DeleteButton objectKey="uploads/old-file.txt" />
            </div>
          </section>

          {/* With metadata + callbacks */}
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              With Metadata &amp; Callbacks
            </h3>
            <p className="text-xs text-muted-foreground">
              Shows file info in the confirmation dialog with all lifecycle
              callbacks.
            </p>
            <div className="mt-1">
              <DeleteButton
                objectKey="uploads/example.pdf"
                fileName="example.pdf"
                fileSize={2_400_000}
                tooltipText="Remove this file permanently"
                beforeDelete={async (key) => {
                  console.log("Before delete:", key)
                  return true
                }}
                onDeleteStart={(key) => console.log("Delete started:", key)}
                onSuccess={(key) => console.log("Deleted:", key)}
                onError={(key, error) =>
                  console.error("Delete error:", key, error)
                }
              />
            </div>
          </section>

          {/* Custom confirmation */}
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Custom Confirmation
            </h3>
            <p className="text-xs text-muted-foreground">
              Delete button with customized confirmation dialog text.
            </p>
            <div className="mt-1">
              <DeleteButton
                objectKey="archives/backup-2024.zip"
                fileName="backup-2024.zip"
                fileSize={104_857_600}
                label="Remove backup"
                tooltipText="Delete this backup"
                confirmTitle="Remove backup archive?"
                confirmDescription="This will permanently delete the 2024 backup archive. This action cannot be undone."
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
