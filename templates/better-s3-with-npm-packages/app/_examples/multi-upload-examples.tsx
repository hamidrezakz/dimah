"use client"

import { MultiUpload } from "@better-s3/ui"
import { presignApi } from "@/lib/s3/presign-api"

export function MultiUploadExamples() {
  return (
    <div className="flex flex-col gap-8">
      <h2 className="border-b pb-2 text-base font-medium">Multi-File Upload</h2>

      {/* Multi-file — Button */}
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">Button</h3>
        <p className="text-xs text-muted-foreground">
          Select multiple files at once. Uploads concurrently with per-file
          progress.
        </p>
        <div className="mt-1">
          <MultiUpload
            presignApi={presignApi}
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

      {/* Multi-file + Multipart */}
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">Multipart</h3>
        <p className="text-xs text-muted-foreground">
          Multiple large files with multipart upload for each.
        </p>
        <div className="mt-1">
          <MultiUpload
            presignApi={presignApi}
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
  )
}
