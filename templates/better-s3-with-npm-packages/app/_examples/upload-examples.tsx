"use client"

import { Upload } from "@better-s3/ui"
import { presignApi } from "@/lib/s3/presign-api"

export function UploadExamples() {
  return (
    <div className="flex flex-col gap-8">
      <h2 className="border-b pb-2 text-base font-medium">Upload</h2>

      {/* Button variant */}
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">Button</h3>
        <p className="text-xs text-muted-foreground">
          Simple button that opens a file picker on click.
        </p>
        <div className="mt-1">
          <Upload
            presignApi={presignApi}
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

      {/* Dropzone variant */}
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">Dropzone</h3>
        <p className="text-xs text-muted-foreground">
          Drag-and-drop area that also supports click to browse.
        </p>
        <div className="mt-1">
          <Upload
            presignApi={presignApi}
            variant="dropzone"
            objectKey={(file) => `documents/${file.name}`}
            accept={["application/pdf", "image/*"]}
            maxFileSize={50 * 1024 * 1024}
            tooltipText="Drop files here"
          />
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
            presignApi={presignApi}
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
    </div>
  )
}
