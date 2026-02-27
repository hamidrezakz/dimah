# راهنمای انتشار پکیج‌ها روی npm

این راهنمای گام‌به‌گام برای انتشار پکیج‌های این monorepo روی npmjs.com است.

## یکبار اولیه: تنظیمات npm

### ۱. ساخت حساب کاربری npm

- برو به https://www.npmjs.com/signup
- یک حساب کاربری رایگان بساز
- ایمیلت را verify کن

### ۲. دریافت Access Token از npm

1. برو به https://www.npmjs.com/settings/[username]/tokens
2. روی **Generate New Token** کلیک کن
3. نوع **Automation** را انتخاب کن (برای CI/CD)
4. توکن را کپی کن و در جای امنی نگهدار

### ۳. اضافه کردن توکن به GitHub Secrets

1. برو به: https://github.com/hamidrezakz/hrk/settings/secrets/actions
2. روی **New repository secret** کلیک کن
3. نام: `NPM_TOKEN`
4. مقدار: توکنی که از npm گرفتی را paste کن
5. **Add secret** را بزن

### ۴. لاگین محلی (برای publish دستی)

```bash
npm login
```

اطلاعات حساب npm را وارد کن. ✅ الان آماده‌ای!

---

## انتشار پکیج جدید

### روش ۱: انتشار خودکار با GitHub Actions (توصیه می‌شود)

**گام ۱:** نسخه را افزایش بده

```bash
# برای تغییرات ریز (0.1.0 → 0.1.1)
pnpm --filter @hrk/fa-utils version patch

# برای ویژگی جدید (0.1.0 → 0.2.0)
pnpm --filter @hrk/fa-utils version minor

# برای تغییرات بزرگ (0.1.0 → 1.0.0)
pnpm --filter @hrk/fa-utils version major
```

**گام ۲:** تغییرات را commit و push کن

```bash
git add .
git commit -m "chore: bump @hrk/fa-utils to v0.1.1"
git push origin master
```

**گام ۳:** GitHub Action خودکار اجرا می‌شود

- می‌رود به: https://github.com/hamidrezakz/hrk/actions
- workflow ای با نام **Publish @hrk/fa-utils** اجرا می‌شود
- پکیج را build و روی npm منتشر می‌کند
- اگر نسخه قبلاً publish شده باشد، skip می‌کند

---

### روش ۲: انتشار دستی (برای تست)

```bash
# مطمئن شو که لاگین کردی
npm whoami

# build کن
pnpm --filter @hrk/fa-utils build

# publish کن
pnpm --filter @hrk/fa-utils publish --access public
```

---

## بررسی پکیج منتشر شده

بعد از publish موفق:

- صفحه پکیج: https://www.npmjs.com/package/@hrk/fa-utils
- نصب: `pnpm add @hrk/fa-utils` یا `npm install @hrk/fa-utils`

---

## افزودن پکیج جدید

برای هر پکیج جدید در `packages/`:

**۱. مطمئن شو `package.json` این تنظیمات را دارد:**

```json
{
  "name": "@hrk/package-name",
  "version": "0.1.0",
  "publishConfig": {
    "access": "public"
  }
}
```

**۲. یک GitHub workflow جدید بساز:**
کپی کن از `.github/workflows/publish-fa-utils.yml` و اسم پکیج را عوض کن.

**۳. اولین انتشار:**

```bash
pnpm --filter @hrk/package-name build
pnpm --filter @hrk/package-name publish --access public
```

---

## نکات مهم

✅ **همیشه قبل از push، build کن و تست کن**

```bash
pnpm --filter @hrk/fa-utils build
pnpm --filter @hrk/fa-utils check-types
```

✅ **هیچ‌وقت نسخه تکراری publish نکن**
npm اجازه نمی‌دهد همان نسخه دوباره publish شود. همیشه `version` را بالا ببر.

✅ **برای انتشار چند پکیج هم‌زمان**
در آینده می‌توانی از [Changesets](https://github.com/changesets/changesets) استفاده کنی.

✅ **بررسی قبل از publish**

```bash
# ببین چه فایل‌هایی publish می‌شوند
pnpm --filter @hrk/fa-utils pack --dry-run
```

---

## عیب‌یابی

### خطا: 403 Forbidden

- توکن npm را چک کن (ممکن است expire شده باشد)
- مطمئن شو scope `@hrk` مال توست یا public است

### خطا: 402 Payment Required (Private packages)

- `publishConfig.access` را روی `"public"` بگذار

### خطا: Version already exists

- نسخه را با `pnpm version patch` افزایش بده

### GitHub Action fail می‌شود

- چک کن که `NPM_TOKEN` در Secrets وجود دارد
- لاگ‌های action را در GitHub Actions بررسی کن
