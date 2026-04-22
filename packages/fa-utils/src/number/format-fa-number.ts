export function formatFaNumber(value: number): string {
  return new Intl.NumberFormat("fa-IR").format(value);
}
