# Google OAuth Setup Guide

## مراحل راه‌اندازی Google OAuth

### 1. ایجاد Google Cloud Project

1. به [Google Cloud Console](https://console.developers.google.com/) بروید
2. یک پروژه جدید ایجاد کنید یا پروژه موجود را انتخاب کنید
3. نام پروژه را `D&D-Bolt` یا نام دلخواه خود قرار دهید

### 2. فعال‌سازی Google+ API

1. در Google Cloud Console، به **APIs & Services** > **Library** بروید
2. "Google+ API" را جستجو کنید
3. روی آن کلیک کرده و **Enable** را انتخاب کنید

### 3. ایجاد OAuth 2.0 Credentials

1. به **APIs & Services** > **Credentials** بروید
2. روی **+ CREATE CREDENTIALS** کلیک کنید
3. **OAuth 2.0 Client ID** را انتخاب کنید
4. **Application type** را **Web application** انتخاب کنید
5. **Name** را `D&D-Bolt-Web` قرار دهید

### 4. تنظیم Authorized JavaScript Origins

1. در بخش **Authorized JavaScript origins**، این URL ها را اضافه کنید:
   - `http://localhost:3000` (برای development)
   - `https://yourdomain.com` (برای production)

2. در بخش **Authorized redirect URIs**، این URL ها را اضافه کنید:
   - `http://localhost:3000` (برای development)
   - `https://yourdomain.com` (برای production)

### 5. کپی کردن Client ID

1. پس از ایجاد credentials، **Client ID** را کپی کنید
2. فایل `src/config/google.ts` را باز کنید
3. `YOUR_GOOGLE_CLIENT_ID` را با Client ID کپی شده جایگزین کنید

### 6. تست کردن

1. سرور development را اجرا کنید: `yarn dev`
2. به `http://localhost:3000` بروید
3. روی دکمه "ورود با Google" کلیک کنید
4. با اکانت Google خود وارد شوید

## نکات مهم

- **Client ID** را در public repository قرار ندهید
- برای production، حتماً domain خود را به Authorized origins اضافه کنید
- اگر خطای CORS دریافت کردید، مطمئن شوید که domain در Authorized origins قرار دارد

## عیب‌یابی

### خطای "This app isn't verified"
- این خطا طبیعی است و می‌توانید "Advanced" > "Go to D&D-Bolt (unsafe)" را انتخاب کنید

### خطای CORS
- مطمئن شوید که `http://localhost:3000` در Authorized JavaScript origins قرار دارد

### خطای "Invalid client"
- Client ID را دوباره بررسی کنید
- مطمئن شوید که Google+ API فعال است

### خطای "NetworkError: Error retrieving a token" و "Not signed in with the identity provider"
این خطا معمولاً به دلایل زیر رخ می‌دهد:

1. **مشکل در تنظیمات Google Cloud Console:**
   - مطمئن شوید که در Google Cloud Console، OAuth consent screen تنظیم شده باشد
   - در OAuth consent screen، User Type را "External" انتخاب کنید
   - حداقل یک scope (مثل email, profile) اضافه کنید

2. **مشکل در Authorized Origins:**
   - مطمئن شوید که `http://localhost:3000` (یا domain فعلی شما) در "Authorized JavaScript origins" قرار دارد
   - URL باید دقیقاً مطابق با آدرس فعلی باشد (با یا بدون www)

3. **مشکل در Client ID:**
   - Client ID را دوباره کپی کنید
   - مطمئن شوید که از OAuth 2.0 Client ID استفاده می‌کنید، نه Service Account

4. **راه‌حل‌های اضافی:**
   - مرورگر را refresh کنید
   - Cache مرورگر را پاک کنید
   - از حالت Incognito/Private استفاده کنید
   - مطمئن شوید که JavaScript فعال است

### خطای FedCM
- اگر خطای FedCM دریافت می‌کنید، این مشکل در کد حل شده است
- `use_fedcm_for_prompt: false` اضافه شده تا از FedCM استفاده نشود