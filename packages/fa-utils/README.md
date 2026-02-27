# @dimah/fa-utils

A tiny helper package for Persian formatting with built-in JavaScript Intl APIs.

## Install

```bash
pnpm add @dimah/fa-utils
```

## Usage

```ts
import { formatFaDate, formatFaNumber, toPersianDigits } from "@dimah/fa-utils";

formatFaDate(new Date());
// e.g. ۱۴۰۴/۱۲/۸

formatFaDate("2026-02-27", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});
// e.g. جمعه ۸ اسفند ۱۴۰۴

formatFaNumber(1234567);
// ۱٬۲۳۴٬۵۶۷

toPersianDigits("Order #2026");
// Order #۲۰۲۶
```
