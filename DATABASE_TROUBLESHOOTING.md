# 🔧 عیب‌یابی مشکلات دیتابیس

## مشکل: "دیتابیس برای من کار نمی‌کند"

### ✅ چک‌لیست بررسی:

#### 1. بررسی اتصال Supabase
```bash
# در Console مرورگر:
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Has Anon Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
```

#### 2. بررسی Errors در Console
- بازکردن Developer Tools (F12)
- رفتن به تب Console
- جستجو برای خطاهای Supabase یا RLS

#### 3. مشکلات متداول و راه‌حل:

##### ❌ خطا: "new row violates row-level security policy"
**علت:** RLS فعال است اما policy مناسب وجود ندارد
**راه‌حل:**
```sql
-- برای هر جدول که مشکل دارد:
DROP POLICY IF EXISTS [table_name]_select_anon ON [table_name];
CREATE POLICY [table_name]_select_anon ON [table_name]
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS [table_name]_insert_anon ON [table_name];
CREATE POLICY [table_name]_insert_anon ON [table_name]
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS [table_name]_update_anon ON [table_name];
CREATE POLICY [table_name]_update_anon ON [table_name]
  FOR UPDATE TO anon USING (true) WITH CHECK (true);
```

##### ❌ خطا: "relation does not exist"
**علت:** جدول در دیتابیس وجود ندارد
**راه‌حل:** اجرای schema.sql در Supabase

##### ❌ خطا: "Invalid API key"
**علت:** کلید Supabase اشتباه است
**راه‌حل:** بررسی و بروزرسانی کلیدها در `src/database/supabaseGameDatabase.ts`

##### ❌ داده‌ها خوانده می‌شوند اما ذخیره نمی‌شوند
**علت:** فقط policy SELECT وجود دارد
**راه‌حل:** اضافه کردن policies برای INSERT و UPDATE

#### 4. تست دستی در Supabase Dashboard

1. رفتن به https://supabase.com/dashboard
2. انتخاب پروژه
3. Table Editor → rooms
4. دکمه "Insert row" را بزنید
5. اگر خطا دریافت کردید، RLS مشکل دارد

#### 5. غیرفعال کردن موقت RLS (فقط برای تست!)

```sql
-- ⚠️ فقط برای تست - در production استفاده نکنید!
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE players DISABLE ROW LEVEL SECURITY;
-- ... برای بقیه جداول
```

#### 6. بررسی Network Requests

در Developer Tools → Network:
- فیلتر کردن به "supabase"
- بررسی Response هر درخواست
- اگر 403 Forbidden دریافت کردید → مشکل RLS
- اگر 401 Unauthorized → مشکل Authentication
- اگر 400 Bad Request → مشکل در داده‌های ارسالی

## 🧪 تست سریع

### روش 1: استفاده از فایل test-database.html
1. مرورگر را باز کنید
2. به `http://localhost:3000/test-database.html` بروید
3. روی دکمه‌ها کلیک کنید

### روش 2: تست در Console
```javascript
// کپی و paste در Console مرورگر:
const { createClient } = supabase;
const client = createClient(
  'https://fxumrywaxagueiqlovgg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4dW1yeXdheGFndWVpcWxvdmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNzQyODksImV4cCI6MjA3NDc1MDI4OX0.zVfqMUk2vhQnWhufG7biVwos1S785Xak4kr1zmXAK-4'
);

// تست خواندن
const { data, error } = await client.from('rooms').select('*').limit(3);
console.log('Data:', data);
console.log('Error:', error);

// تست ایجاد
const { data: newRoom, error: createError } = await client
  .from('rooms')
  .insert([{
    id: 'test_' + Date.now(),
    code: 'TEST999',
    status: 'waiting',
    max_players: 6,
    selected_genre: 'fantasy'
  }])
  .select();
console.log('Created:', newRoom);
console.log('Error:', createError);
```

## 📝 گزارش مشکل

اگر همچنان مشکل دارید، این اطلاعات را جمع‌آوری کنید:

1. پیام خطای دقیق از Console
2. جدولی که مشکل دارد
3. عملیاتی که انجام می‌دهید (SELECT, INSERT, UPDATE)
4. آیا در test-database.html کار می‌کند؟
5. آیا در Supabase Dashboard کار می‌کند؟

## 🎯 بهترین راه‌حل (توصیه می‌شود)

اگر می‌خواهید همه چیز بدون دردسر کار کند:

```sql
-- اجرا در SQL Editor سوپابیس:
-- این همه جداول را برای دسترسی عمومی (anon) باز می‌کند

DO $$ 
DECLARE 
    tbl text;
BEGIN
    FOR tbl IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
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
        
        RAISE NOTICE 'Updated policies for table: %', tbl;
    END LOOP;
END $$;
```

این اسکریپت به طور خودکار برای **تمام جداول** policies مناسب ایجاد می‌کند.

