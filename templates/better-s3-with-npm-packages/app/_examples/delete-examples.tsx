"use client"

import { DeleteButton } from "@better-s3/ui"
import { presignApi } from "@/lib/s3/presign-api"

export function DeleteExamples() {
  return (
    <div className="flex flex-col gap-8">
      <h2 className="border-b pb-2 text-base font-medium">Delete</h2>

      {/* Basic */}
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">Basic</h3>
        <p className="text-xs text-muted-foreground">
          Minimal delete button with a confirmation dialog.
        </p>
        <div className="mt-1">
          <DeleteButton
            presignApi={presignApi}
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
          Shows file info in the confirmation dialog with all lifecycle
          callbacks.
        </p>
        <div className="mt-1">
          <DeleteButton
            presignApi={presignApi}
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
          />
        </div>
      </section>
    </div>
  )
}
