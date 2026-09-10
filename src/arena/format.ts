/* تنسيق أزمنة الحل.

   الصفحة الرئيسية تعرض mm:ss وهذا يكفيها، أما المنافسة فتحتاج
   جزءاً من مئة من الثانية: الفرق بين المركز الأول والثاني في
   مسابقات السرعة يكون بأجزاء الثانية عادة. */

/** 83_450 → "01:23.45" — ويُقصّر إلى "23.45" تحت الدقيقة */
export function clockCs(ms: number): string {
  const safe = Math.max(0, Math.floor(ms));
  const cs = Math.floor(safe / 10) % 100;
  const s = Math.floor(safe / 1000) % 60;
  const m = Math.floor(safe / 60000);
  const cc = String(cs).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return m > 0 ? `${String(m).padStart(2, '0')}:${ss}.${cc}` : `${ss}.${cc}`;
}

/** تاريخ مختصر للعرض بجانب المحاولة */
export function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('ar-IQ', { day: 'numeric', month: 'short' });
}
