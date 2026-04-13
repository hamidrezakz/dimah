import { UploadExamples } from "./_examples/upload-examples"
import { MultiUploadExamples } from "./_examples/multi-upload-examples"
import { HeadlessExamples } from "./_examples/headless-examples"
import { DownloadExamples } from "./_examples/download-examples"
import { DeleteExamples } from "./_examples/delete-examples"

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

        <UploadExamples />
        <MultiUploadExamples />
        <HeadlessExamples />
        <DownloadExamples />
        <DeleteExamples />
      </div>
    </div>
  )
}
