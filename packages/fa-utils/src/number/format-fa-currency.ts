export function formatFaCurrency(
  value: number,
  currency: string = "IRR",
  options?: Omit<Intl.NumberFormatOptions, "style" | "currency">,
): string {
  return new Intl.NumberFormat("fa-IR", {
    style: "currency",
    currency,
    ...options,
  }).format(value);
}
