const ENGLISH_DIGITS = /\d/g;
const PERSIAN_DIGITS = [
  "۰",
  "۱",
  "۲",
  "۳",
  "۴",
  "۵",
  "۶",
  "۷",
  "۸",
  "۹",
] as const;

export function toPersianDigits(value: string | number): string {
  return String(value).replace(
    ENGLISH_DIGITS,
    (digit) => PERSIAN_DIGITS[Number(digit)],
  );
}

export function formatFaNumber(value: number): string {
  return new Intl.NumberFormat("fa-IR").format(value);
}

export function formatFaDate(
  value: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date value");
  }

  return new Intl.DateTimeFormat("fa-IR", options).format(date);
}
