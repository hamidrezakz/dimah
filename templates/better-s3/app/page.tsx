"use client"

import { Upload } from "@/components/upload"
import { DownloadButton } from "@/components/download"
import { DeleteButton } from "@/components/delete"

export default function Page() {
  return (
    <div className="flex min-h-svh p-6">
      <div className="flex w-full max-w-lg flex-col gap-8">
        <h1 className="text-lg font-medium">S3 File Operations</h1>

        {/* ── Upload ── */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium">Upload — Button</h2>
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
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium">Upload — Dropzone</h2>
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
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium">Upload — Multipart</h2>
          <Upload
            variant="button"
            label="Upload large file"
            objectKey={(file) => `large/${file.name}`}
            multipart
            multipartThreshold={20 * 1024 * 1024}
          />
        </section>

        {/* ── Download ── */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium">Download</h2>
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
            afterDownload={async (key) => console.log("After download:", key)}
          />
        </section>

        {/* ── Delete ── */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium">Delete</h2>
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
            onError={(key, error) => console.error("Delete error:", key, error)}
            afterDelete={async (key) => console.log("After delete:", key)}
          />
        </section>
      </div>
    </div>
  )
}
