"use client"

import { DownloadButton } from "@better-s3/ui"
import { presignApi } from "@/lib/s3/presign-api"

export function DownloadExamples() {
  return (
    <div className="flex flex-col gap-8">
      <h2 className="border-b pb-2 text-base font-medium">Download</h2>

      {/* Basic */}
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">Basic</h3>
        <p className="text-xs text-muted-foreground">
          Minimal download button with just an object key.
        </p>
        <div className="mt-1">
          <DownloadButton
            presignApi={presignApi}
            mode="fetch"
            objectKey="pdfs/chapter2-1.pdf"
          />
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
            presignApi={presignApi}
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
    </div>
  )
}
