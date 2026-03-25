"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { UseUploadReturn, UseUploadOptions } from "@/hooks/use-upload"
import { useUpload } from "@/hooks/use-upload"

type UploadContextValue = UseUploadReturn & {
  options: UseUploadOptions
}

const UploadContext = createContext<UploadContextValue | null>(null)

export function useUploadContext() {
  const ctx = useContext(UploadContext)
  if (!ctx) {
    throw new Error("useUploadContext must be used within <UploadProvider>")
  }
  return ctx
}

export function UploadProvider({
  children,
  ...options
}: UseUploadOptions & { children: ReactNode }) {
  const upload = useUpload(options)

  return (
    <UploadContext.Provider value={{ ...upload, options }}>
      {children}
    </UploadContext.Provider>
  )
}
