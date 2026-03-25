"use client"

import { Upload } from "@/components/upload"

export default function Page() {
  return (
    <div className="flex min-h-svh p-6">
      <div className="flex w-full max-w-lg flex-col gap-8">
        <h1 className="text-lg font-medium">Upload Demo</h1>

        {/* ۱. دکمه ساده */}
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium">Button variant</h2>
          <Upload
            variant="button"
            objectKey={(file) => `uploads/${Date.now()}-${file.name}`}
            accept={["image/*"]}
            maxFileSize={10 * 1024 * 1024}
            onSuccess={(file, result) =>
              console.log("Uploaded:", file.name, result)
            }
          />
        </section>

        {/* ۲. باکس drag & drop */}
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium">Dropzone variant</h2>
          <Upload
            variant="dropzone"
            objectKey={(file) => `documents/${file.name}`}
            accept={["application/pdf", "image/*"]}
            maxFileSize={50 * 1024 * 1024}
            beforeUpload={async (file) => {
              console.log("Validating:", file.name)
              return true
            }}
            onProgress={(file, progress) =>
              console.log(`${file.name}: ${progress.percent}%`)
            }
            onError={(_file, error) => console.error("Upload error:", error)}
          />
        </section>

        {/* ۳. multipart با دکمه */}
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium">Multipart upload</h2>
          <Upload
            variant="button"
            label="Upload large file"
            objectKey={(file) => `large/${file.name}`}
            multipart
            multipartThreshold={20 * 1024 * 1024}
            onSuccess={(_file, result) =>
              console.log("Multipart done:", result)
            }
          />
        </section>

        {/* ۴. custom variant */}
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium">Custom variant</h2>
          <Upload
            variant="custom"
            objectKey="avatar.png"
            accept={["image/png", "image/jpeg"]}
            maxFileSize={5 * 1024 * 1024}
          >
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
              Click to upload avatar
            </div>
          </Upload>
        </section>
      </div>
    </div>
  )
}
