import { createClient } from '@supabase/supabase-js';

/* =========================================================
   عميل Supabase.

   المفتاح هنا قابل للنشر (publishable) ويصل متصفّح الزائر
   بطبيعته: حمايته من سياسات RLS في قاعدة البيانات، لا من
   إخفائه. مفتاح service_role لا يدخل هذا الملف ولا أي ملف
   يصل المتصفح، لأنه يتجاوز RLS بالكامل.
   ========================================================= */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

/* الموقع يجب أن يشتغل حتى لو نسي أحدهم ملف .env: الحلبة تلعب
   والمتجر يتصفّح، وما يسقط إلا حفظ الأوقات وتسجيل الدخول. */
export const supabaseReady = Boolean(url && key);

if (!supabaseReady && import.meta.env.DEV) {
  console.warn('[GENIUS] لا توجد إعدادات Supabase. انسخ .env.example إلى .env.');
}

export const supabase = supabaseReady
  ? createClient(url!, key!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
