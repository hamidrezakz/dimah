import { toEnglishDigits, toPersianDigits } from "../digits/convert";
import type { FormatIranPhoneOptions } from "../types/phone";

function normalizeIranMobileCore(value: string | number): string {
  const normalized = toEnglishDigits(value).replace(/\D/g, "");

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

export function formatIranPhone(
  value: string | number,
  options: FormatIranPhoneOptions = {},
): string {
  const target = options.target ?? "ui";
  const digits = options.digits ?? options.uiDigits ?? "en";
  const mobileCore = normalizeIranMobileCore(value);

  if (target === "db") {
    return `+98${mobileCore}`;
  }

  const uiPhone = `0${mobileCore}`;
  return digits === "fa" ? toPersianDigits(uiPhone) : uiPhone;
}
