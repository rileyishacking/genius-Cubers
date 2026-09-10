/* بيانات التواصل في مكان واحد: الرقم مذكور في أكثر من صفحة،
   وتغييره لاحقاً يجب أن يكون تعديلاً واحداً لا مطاردة. */

/* +964 773 735 9910 — واتساب يريد الرقم بلا + وبلا فراغات */
const WA_NUMBER = '9647737359910';

export const WHATSAPP_DISPLAY = '+964 773 735 9910';

/** رابط واتساب مع رسالة جاهزة تفتح المحادثة بسياقها */
export const waLink = (text: string) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
