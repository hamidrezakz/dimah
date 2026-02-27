const ENGLISH_DIGITS = /\d/g;
const PERSIAN_AND_ARABIC_DIGITS = /[۰-۹٠-٩]/g;
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
const ARABIC_TO_ENGLISH_DIGITS: Record<string, string> = {
  "۰": "0",
  "۱": "1",
  "۲": "2",
  "۳": "3",
  "۴": "4",
  "۵": "5",
  "۶": "6",
  "۷": "7",
  "۸": "8",
  "۹": "9",
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
};

type IranPhoneTarget = "ui" | "db";
type UiDigits = "fa" | "en";

export type FormatIranPhoneOptions = {
  target?: IranPhoneTarget;
  uiDigits?: UiDigits;
};

function toEnglishDigits(value: string): string {
  return value.replace(
    PERSIAN_AND_ARABIC_DIGITS,
    (digit) => ARABIC_TO_ENGLISH_DIGITS[digit] ?? digit,
  );
}

function toIranMobileCore(value: string | number): string {
  const normalized = toEnglishDigits(String(value)).replace(/\D/g, "");

  let mobile = normalized;
  if (mobile.startsWith("0098")) {
    mobile = mobile.slice(4);
  } else if (mobile.startsWith("98")) {
    mobile = mobile.slice(2);
  }

  if (mobile.startsWith("0")) {
    mobile = mobile.slice(1);
  }

  if (!/^9\d{9}$/.test(mobile)) {
    throw new Error("Invalid Iran mobile phone number");
  }

  return mobile;
}

export function toPersianDigits(value: string | number): string {
  return String(value).replace(
    ENGLISH_DIGITS,
    (digit) => PERSIAN_DIGITS[Number(digit)],
  );
}

export function formatFaNumber(value: number): string {
  return new Intl.NumberFormat("fa-IR").format(value);
}

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

export function formatIranPhone(
  value: string | number,
  options: FormatIranPhoneOptions = {},
): string {
  const target = options.target ?? "ui";
  const uiDigits = options.uiDigits ?? "fa";
  const mobileCore = toIranMobileCore(value);

  if (target === "db") {
    return `+98${mobileCore}`;
  }

  const uiPhone = `0${mobileCore}`;
  return uiDigits === "fa" ? toPersianDigits(uiPhone) : uiPhone;
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
