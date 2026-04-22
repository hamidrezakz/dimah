const LATIN_DIGIT_REGEX = /\d/g;

function createDigitTable(locale: string): string[] {
  return Array.from(
    new Intl.NumberFormat(locale, { useGrouping: false }).format(9876543210),
  ).reverse();
}

const LATIN_DIGITS = createDigitTable("en-u-nu-latn");
const PERSIAN_DIGITS = createDigitTable("fa-IR-u-nu-arabext");
const ARABIC_INDIC_DIGITS = createDigitTable("ar-u-nu-arab");

const PERSIAN_TO_LATIN_DIGIT_PAIRS: Array<[string, string]> =
  PERSIAN_DIGITS.map((digit, index) => [
    digit,
    LATIN_DIGITS[index] ?? String(index),
  ]);

const ARABIC_INDIC_TO_LATIN_DIGIT_PAIRS: Array<[string, string]> =
  ARABIC_INDIC_DIGITS.map((digit, index) => [
    digit,
    LATIN_DIGITS[index] ?? String(index),
  ]);

const NON_LATIN_TO_LATIN_DIGIT = new Map<string, string>([
  ...PERSIAN_TO_LATIN_DIGIT_PAIRS,
  ...ARABIC_INDIC_TO_LATIN_DIGIT_PAIRS,
]);

const NON_LATIN_DIGIT_REGEX = new RegExp(
  `[${Array.from(NON_LATIN_TO_LATIN_DIGIT.keys()).join("")}]`,
  "g",
);

export function toEnglishDigits(value: string | number): string {
  return String(value).replace(
    NON_LATIN_DIGIT_REGEX,
    (digit) => NON_LATIN_TO_LATIN_DIGIT.get(digit) ?? digit,
  );
}

export function toPersianDigits(value: string | number): string {
  return String(value).replace(
    LATIN_DIGIT_REGEX,
    (digit) => PERSIAN_DIGITS[Number(digit)] ?? digit,
  );
}
