# @dimah/fa-utils

A tiny helper package for Persian formatting with built-in JavaScript Intl APIs.

## Features

- Date formatting with Persian calendar via Intl.
- Number and currency formatting for Persian locale.
- Digit conversion helpers for UI and normalization.
- Iran mobile phone normalization for UI and DB targets.

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
  toEnglishDigits,
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

toEnglishDigits("Order #۲۰۲۶");
// Order #2026

formatIranPhone("+989305138169");
// 09305138169

formatIranPhone("+989305138169", { digits: "fa" });
// ۰۹۳۰۵۱۳۸۱۶۹

formatIranPhone("09305138169", { target: "db" });
// +989305138169
```

## API

- formatFaDate(value, options?)
- formatFaNumber(value)
- formatFaCurrency(value, currency?, options?)
- toPersianDigits(value)
- toEnglishDigits(value)
- formatIranPhone(value, options?)

## Internal Structure

Source is organized by domain for long-term maintainability:

- src/date
- src/digits
- src/number
- src/phone
- src/types
