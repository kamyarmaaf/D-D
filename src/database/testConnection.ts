/**
 * اسکریپت تست اتصال دیتابیس Supabase
 * برای اجرا: در console مرورگر از این function استفاده کنید
 */

import { supabaseGameDatabase } from './supabaseGameDatabase';

export async function testDatabaseConnection() {
  console.log('🔍 شروع تست اتصال دیتابیس...\n');

  try {
    // 1. تست مقداردهی اولیه
    console.log('1️⃣ تست Initialize...');
    await supabaseGameDatabase.initialize();
    console.log('✅ Initialize موفق\n');

    // 2. تست خواندن rooms
    console.log('2️⃣ تست خواندن اتاق‌ها...');
    const { data: rooms, error: roomsError } = await (supabaseGameDatabase as any).supabase
      .from('rooms')
      .select('*')
      .limit(5);
    
    if (roomsError) throw roomsError;
    console.log(`✅ ${rooms?.length || 0} اتاق یافت شد`);
    console.log('اتاق‌ها:', rooms);
    console.log('');

    // 3. تست ایجاد اتاق
    console.log('3️⃣ تست ایجاد اتاق...');
    const testCode = 'TEST' + Math.floor(Math.random() * 1000);
    const testPlayer = {
      id: 'test_player_' + Date.now(),
      nickname: 'تست پلیر',
      age: 25,
      genre: 'Fantasy' as const,
      score: 0,
      titles: [],
      isHost: true,
      level: 1,
      experience: 0
    };

    const room = await supabaseGameDatabase.createRoomWithGenre(
      testCode,
      'fantasy',
      testPlayer
    );
    
    console.log('✅ اتاق ساخته شد:', room);
    console.log('');

    // 4. تست خواندن اتاق
    console.log('4️⃣ تست خواندن اتاق با کد...');
    const foundRoom = await supabaseGameDatabase.getRoomByCode(testCode);
    console.log('✅ اتاق پیدا شد:', foundRoom);
    console.log('');

    // 5. تست ایجاد بازیکن
    console.log('5️⃣ تست ایجاد بازیکن دوم...');
    const player2 = {
      id: 'test_player2_' + Date.now(),
      nickname: 'بازیکن دوم',
      age: 28,
      genre: 'Mystery' as const,
      score: 0,
      titles: [],
      isHost: false,
      level: 1,
      experience: 0
    };

    const joinedRoom = await supabaseGameDatabase.joinRoom(testCode, player2);
    console.log('✅ بازیکن به اتاق پیوست:', joinedRoom);
    console.log('');

    // 6. تست بروزرسانی
    console.log('6️⃣ تست بروزرسانی وضعیت اتاق...');
    await supabaseGameDatabase.updateRoomStatus(room.id, 'playing');
    console.log('✅ وضعیت اتاق به playing تغییر کرد\n');

    // 7. تست پیام
    console.log('7️⃣ تست ایجاد پیام...');
    await supabaseGameDatabase.addGameMessage(room.id, {
      id: 'msg_test_' + Date.now(),
      type: 'system',
      sender: 'System',
      content: 'این یک پیام تست است',
      timestamp: new Date()
    });
    console.log('✅ پیام ساخته شد\n');

    // 8. تست خواندن پیام‌ها
    console.log('8️⃣ تست خواندن پیام‌ها...');
    const messages = await supabaseGameDatabase.getMessagesByRoomId(room.id);
    console.log(`✅ ${messages.length} پیام یافت شد:`, messages);
    console.log('');

    // 9. پاکسازی
    console.log('9️⃣ پاکسازی داده‌های تست...');
    const { error: deleteError } = await (supabaseGameDatabase as any).supabase
      .from('rooms')
      .delete()
      .eq('id', room.id);
    
    if (deleteError) {
      console.warn('⚠️ خطا در پاکسازی (ممکن است به دلیل foreign keys باشد):', deleteError);
    } else {
      console.log('✅ داده‌های تست پاک شدند\n');
    }

    console.log('🎉 همه تست‌ها با موفقیت انجام شدند!');
    console.log('\n📊 نتیجه: دیتابیس کاملاً کار می‌کند! ✅');

    return {
      success: true,
      message: 'همه تست‌ها موفق بودند',
      testRoom: room,
      testMessages: messages
    };

  } catch (error: any) {
    console.error('\n❌ خطا در تست دیتابیس:');
    console.error('پیام خطا:', error.message);
    console.error('جزئیات:', error);
    
    console.log('\n🔍 راهنمای عیب‌یابی:');
    console.log('1. بررسی کنید که RLS policies برای جداول تنظیم شده باشد');
    console.log('2. Console مرورگر را چک کنید (F12)');
    console.log('3. فایل DATABASE_TROUBLESHOOTING.md را مطالعه کنید');
    console.log('4. فایل test-database.html را باز کنید: http://localhost:3000/test-database.html');

    return {
      success: false,
      error: error.message,
      details: error
    };
  }
}

// Export برای استفاده در console
if (typeof window !== 'undefined') {
  (window as any).testDatabaseConnection = testDatabaseConnection;
  console.log('✅ تابع testDatabaseConnection در window قرار گرفت');
  console.log('💡 برای تست کافی است در console تایپ کنید: testDatabaseConnection()');
}

