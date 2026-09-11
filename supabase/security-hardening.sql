-- =========================================================
-- GENIUS — تقوية أمان قاعدة البيانات
-- 2026-09-11
--
-- كل الخطوات داخل معاملة واحدة: إذا فشل سطر، لا يتغيّر شيء.
-- لا يحذف أي بيانات. القيود الجديدة تُضاف NOT VALID حتى لا ترفض
-- الصفوف الموجودة، وتسري على كل صف جديد.
-- =========================================================
begin;

-- ---------------------------------------------------------
-- 1) الصلاحيات: أقل ما يحتاجه الموقع فعلاً
--    Supabase يمنح anon و authenticated كل الصلاحيات افتراضياً،
--    و RLS هي التي تمنع. نزيل الصلاحيات غير المستعملة كطبقة ثانية،
--    فلو خُطئ في سياسة يوماً لا تنفتح الكتابة.
-- ---------------------------------------------------------

-- الزائر المجهول: قراءة فقط
revoke insert, update, delete, truncate, references, trigger
  on public.profiles, public.solves from anon;

-- المستخدم المسجّل: solves إضافة وقراءة فقط (الوقت لا يُعدَّل ولا يُحذف)
revoke update, delete, truncate, references, trigger
  on public.solves from authenticated;

-- المستخدم المسجّل: profiles قراءة وإضافة وتعديل اسمه فقط
revoke delete, truncate, references, trigger
  on public.profiles from authenticated;

-- العرض leaderboard: قراءة فقط للجميع
revoke insert, update, delete, truncate, references, trigger
  on public.leaderboard from anon, authenticated;

-- ---------------------------------------------------------
-- 2) حدود منطقية للمحاولات على الخادم
--    الواجهة صارت تسجّل الحل فقط بعد خلطة التطبيق، لكن أي شخص
--    مسجّل يقدر يرسل طلباً مباشراً للـ API بزمن مزيّف. هذي القيود
--    ترفض ما لا يمكن أن يكون حلاً حقيقياً لمكعب مخلوط بـ 22 حركة.
-- ---------------------------------------------------------
alter table public.solves
  add constraint solves_min_moves check (moves >= 20) not valid;

alter table public.solves
  add constraint solves_min_time check (ms >= 3000) not valid;

-- الاسم المعروض: بلا رموز تحكم غير مرئية
alter table public.profiles
  add constraint profiles_name_printable check (name !~ '[[:cntrl:]]') not valid;

-- ---------------------------------------------------------
-- 3) حد معدّل: محاولة واحدة لكل لاعب كل 10 ثوانٍ
--    يمنع إغراق الجدول بآلاف الصفوف من حساب واحد.
--    الدالة في مخطط خاص غير مكشوف للـ API، و SECURITY INVOKER.
-- ---------------------------------------------------------
create schema if not exists private;
revoke all on schema private from anon, authenticated;

create or replace function private.solves_rate_limit()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if exists (
    select 1 from public.solves s
    where s.user_id = new.user_id
      and s.created_at > now() - interval '10 seconds'
  ) then
    raise exception 'rate limit: one solve per 10 seconds'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

revoke all on function private.solves_rate_limit() from public, anon, authenticated;

drop trigger if exists solves_rate_limit on public.solves;
create trigger solves_rate_limit
  before insert on public.solves
  for each row execute function private.solves_rate_limit();

-- ---------------------------------------------------------
-- 4) لوحة الصدارة تعرض المحاولات المعقولة فقط
--    الصفوف القديمة غير المنطقية (مثل حل بثانيتين وأربع حركات)
--    تبقى محفوظة في الجدول لكنها لا تظهر في اللوحة.
-- ---------------------------------------------------------
create or replace view public.leaderboard
  with (security_invoker = true) as
select distinct on (s.user_id)
  s.id, s.user_id, p.name, s.ms, s.moves, s.created_at
from public.solves s
join public.profiles p on p.id = s.user_id
where s.moves >= 20 and s.ms >= 3000
order by s.user_id, s.ms asc, s.created_at asc;

revoke insert, update, delete, truncate, references, trigger
  on public.leaderboard from anon, authenticated;
grant select on public.leaderboard to anon, authenticated;

commit;

-- ---------------------------------------------------------
-- تحقق: يجب أن تظهر anon بصلاحية SELECT فقط، و authenticated
-- بـ INSERT,SELECT على solves و INSERT,SELECT,UPDATE على profiles.
-- ---------------------------------------------------------
select table_name, grantee,
       string_agg(privilege_type, ',' order by privilege_type) as privileges
from information_schema.role_table_grants
where table_schema = 'public' and grantee in ('anon', 'authenticated')
group by table_name, grantee
order by table_name, grantee;
