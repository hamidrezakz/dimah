export const parseExpiresIn = (value: string | null): number => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 300
  }
  return parsed
}
