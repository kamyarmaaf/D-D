# 🧪 راهنمای تست دیتابیس

## ⚡ روش‌های مختلف تست

### 🎯 روش 1: تست سریع در Console (توصیه می‌شود!)

1. برنامه را اجرا کنید:
```bash
yarn dev
```

2. مرورگر را باز کنید: `http://localhost:3000`

3. Developer Tools را باز کنید (F12)

4. در تب Console تایپ کنید:
```javascript
testDB()
```

5. نتیجه را ببینید! اگر همه چیز سبز بود، دیتابیس کار می‌کند ✅

---

### 📄 روش 2: صفحه تست HTML

1. برنامه را اجرا کنید:
```bash
yarn dev
```

2. به این آدرس بروید:
```
http://localhost:3000/test-database.html
```

3. روی دکمه‌های مختلف کلیک کنید:
   - 🔌 تست اتصال
   - 📖 تست خواندن
   - ➕ تست ایجاد اتاق
   - 📊 نمایش آمار
   
---

### 🎮 روش 3: تست واقعی در بازی

1. برنامه را اجرا کنید

2. یک اتاق جدید بسازید

3. Developer Tools → Console را باز کنید

4. خطاها را چک کنید:
   - اگر پیغام "403 Forbidden" دیدید → مشکل RLS است
   - اگر پیغام "401 Unauthorized" دیدید → مشکل Authentication است
   - اگر پیغام "row-level security" دیدید → باید policies را تنظیم کنید

---

## 🔧 حل مشکلات متداول

### ❌ مشکل: "دیتابیس کار نمی‌کند"

**راه‌حل 1: بررسی RLS Policies**

در Supabase SQL Editor این کد را اجرا کنید:

```sql
-- نمایش همه policies
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

اگر برای جدولی که مشکل دارید policy نیست، این را اجرا کنید:

```sql
-- مثال برای جدول rooms
CREATE POLICY rooms_select_anon ON rooms
  FOR SELECT TO anon USING (true);

CREATE POLICY rooms_insert_anon ON rooms
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY rooms_update_anon ON rooms
  FOR UPDATE TO anon USING (true) WITH CHECK (true);
```

**راه‌حل 2: اجرای اسکریپت خودکار**

این اسکریپت همه چیز را یکجا درست می‌کند:

```sql
DO $$ 
DECLARE 
    tbl text;
BEGIN
    FOR tbl IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
          AND tablename NOT LIKE 'pg_%'
          AND tablename NOT LIKE 'sql_%'
    LOOP
        BEGIN
            -- حذف policies قدیمی
            EXECUTE format('DROP POLICY IF EXISTS %I_select_anon ON %I', tbl, tbl);
            EXECUTE format('DROP POLICY IF EXISTS %I_insert_anon ON %I', tbl, tbl);
            EXECUTE format('DROP POLICY IF EXISTS %I_update_anon ON %I', tbl, tbl);
            EXECUTE format('DROP POLICY IF EXISTS %I_delete_anon ON %I', tbl, tbl);
            
            -- ایجاد policies جدید
            EXECUTE format('CREATE POLICY %I_select_anon ON %I FOR SELECT TO anon USING (true)', tbl, tbl);
            EXECUTE format('CREATE POLICY %I_insert_anon ON %I FOR INSERT TO anon WITH CHECK (true)', tbl, tbl);
            EXECUTE format('CREATE POLICY %I_update_anon ON %I FOR UPDATE TO anon USING (true) WITH CHECK (true)', tbl, tbl);
            EXECUTE format('CREATE POLICY %I_delete_anon ON %I FOR DELETE TO anon USING (true)', tbl, tbl);
            
            RAISE NOTICE '✅ Updated policies for table: %', tbl;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '⚠️ Could not update table: % - Error: %', tbl, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE '🎉 همه policies بروزرسانی شدند!';
END $$;
```

---

### ❌ مشکل: "اتاق ساخته می‌شود اما بازیکن ذخیره نمی‌شود"

**علت:** جدول `players` مشکل RLS دارد

**راه‌حل:**
```sql
-- بررسی policies جدول players
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'players';

-- اگر خالی بود، اجرا کنید:
CREATE POLICY players_select_anon ON players FOR SELECT TO anon USING (true);
CREATE POLICY players_insert_anon ON players FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY players_update_anon ON players FOR UPDATE TO anon USING (true) WITH CHECK (true);
```

---

### ❌ مشکل: "پیام‌ها نمایش داده نمی‌شوند"

**راه‌حل:**
```sql
-- تست خواندن پیام‌ها
SELECT * FROM messages LIMIT 5;

-- اگر خطا داد:
CREATE POLICY messages_select_anon ON messages FOR SELECT TO anon USING (true);
CREATE POLICY messages_insert_anon ON messages FOR INSERT TO anon WITH CHECK (true);
```

---

## 📋 چک‌لیست کامل عیب‌یابی

- [ ] برنامه در حال اجراست (yarn dev)
- [ ] مرورگر به localhost:3000 متصل است
- [ ] Console باز است و خطایی ندارد
- [ ] تابع `testDB()` در console اجرا می‌شود
- [ ] صفحه test-database.html کار می‌کند
- [ ] همه جداول RLS policies دارند
- [ ] Supabase URL و Key درست است

---

## 🎯 تست نهایی

اگر همه چیز درست است، این تست باید موفق شود:

```javascript
// در Console مرورگر:
testDB().then(result => {
  if (result.success) {
    console.log('🎉 دیتابیس کاملاً کار می‌کند!');
  } else {
    console.error('❌ مشکل:', result.error);
    console.log('📖 فایل DATABASE_TROUBLESHOOTING.md را بخوانید');
  }
});
```

---

## 📞 نیاز به کمک؟

1. فایل `DATABASE_TROUBLESHOOTING.md` را مطالعه کنید
2. خطای دقیق از Console را کپی کنید
3. بررسی کنید که کدام جدول مشکل دارد
4. با استفاده از SQL Editor در Supabase، مستقیماً تست کنید

---

## ✅ وقتی همه چیز کار کرد

شما باید بتوانید:
- ✅ اتاق بسازید
- ✅ به اتاق بپیوندید
- ✅ کاراکتر بسازید
- ✅ پیام ارسال کنید
- ✅ امتیاز و سطح بروزرسانی شود
- ✅ آیتم‌ها و achievements ذخیره شوند

**اگر همه اینها کار می‌کند، تبریک! دیتابیس شما کاملاً آماده است! 🎉**

