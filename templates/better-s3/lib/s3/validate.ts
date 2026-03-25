export function validateFile(
  file: File,
  options: { accept?: string[]; maxFileSize?: number }
): string | null {
  if (options.accept?.length) {
    const allowed = options.accept.some((type) => {
      if (type.endsWith("/*")) {
        return file.type.startsWith(type.replace("/*", "/"))
      }
      return file.type === type
    })
    if (!allowed) {
      return `File type "${file.type}" is not allowed`
    }
  }

  if (options.maxFileSize && file.size > options.maxFileSize) {
    const maxMB = (options.maxFileSize / (1024 * 1024)).toFixed(1)
    return `File size exceeds ${maxMB} MB limit`
  }

  return null
}
