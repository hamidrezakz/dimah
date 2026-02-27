# @dimah/fa-utils

A tiny helper package for Persian formatting with built-in JavaScript Intl APIs.

## Install

```bash
pnpm add @dimah/fa-utils
```

## Usage

```ts
import {
  formatFaCurrency,
  formatFaDate,
  formatFaNumber,
  formatIranPhone,
  toPersianDigits,
} from "@dimah/fa-utils";

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

formatFaCurrency(1250000);
// ‎ریال ۱٬۲۵۰٬۰۰۰

formatFaCurrency(49.99, "USD");
// ‎$۴۹٫۹۹

toPersianDigits("Order #2026");
// Order #۲۰۲۶

formatIranPhone("+989305138169");
// ۰۹۳۰۵۱۳۸۱۶۹

formatIranPhone("+989305138169", { uiDigits: "en" });
// 09305138169

formatIranPhone("09305138169", { target: "db" });
// +989305138169
```
