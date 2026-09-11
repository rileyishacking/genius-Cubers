# قوالب رسائل GENIUS

تنلصق بلوحة Supabase: **Authentication ← Emails ← Templates**.
كل قالب له خانة **Subject** (العنوان) وخانة **Message body** (نص HTML).

`{{ .ConfirmationURL }}` متغيّر من Supabase: يتبدّل تلقائياً برابط شخصي لكل مستخدم. لا تغيّره.

---

## 1) Confirm signup — تأكيد الحساب

**Subject**

```text
أكّد حسابك في GENIUS
```

**Message body**

```html
<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;max-width:520px;margin:0 auto;padding:28px 24px;background:#ffffff;color:#171310;text-align:right">
  <h1 style="margin:0 0 6px;font-size:24px;color:#8A5D0C">GENIUS</h1>
  <p style="margin:0 0 22px;font-size:13px;color:#8C8275">مكعبات السرعة والأكاديمية</p>

  <h2 style="margin:0 0 12px;font-size:20px">أهلاً بيك بالحلبة</h2>
  <p style="margin:0 0 22px;font-size:15px;line-height:1.9">
    ضغطة وحدة وحسابك يصير جاهز، وتبدي تسجّل أوقاتك بلوحة الصدارة.
  </p>

  <p style="margin:0 0 26px">
    <a href="{{ .ConfirmationURL }}"
       style="display:inline-block;background:#F0B23C;color:#3A2600;text-decoration:none;font-weight:bold;font-size:16px;padding:14px 28px;border-radius:10px">
      أكّد حسابي
    </a>
  </p>

  <p style="margin:0 0 6px;font-size:13px;color:#665C50;line-height:1.8">
    إذا الزر ما اشتغل، انسخ هذا الرابط وافتحه بالمتصفح:
  </p>
  <p style="margin:0 0 24px;font-size:12px;color:#8C8275;word-break:break-all;direction:ltr;text-align:left">{{ .ConfirmationURL }}</p>

  <p style="margin:0;padding-top:16px;border-top:1px solid #E4DFD5;font-size:12px;color:#8C8275;line-height:1.8">
    ما سوّيت حساب؟ تجاهل هذي الرسالة وما راح يصير شي.
  </p>
</div>
```

---

## 2) Reset Password — تغيير كلمة المرور

**Subject**

```text
رابط تغيير كلمة المرور في GENIUS
```

**Message body**

```html
<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;max-width:520px;margin:0 auto;padding:28px 24px;background:#ffffff;color:#171310;text-align:right">
  <h1 style="margin:0 0 6px;font-size:24px;color:#8A5D0C">GENIUS</h1>
  <p style="margin:0 0 22px;font-size:13px;color:#8C8275">مكعبات السرعة والأكاديمية</p>

  <h2 style="margin:0 0 12px;font-size:20px">نسيت كلمة المرور؟</h2>
  <p style="margin:0 0 22px;font-size:15px;line-height:1.9">
    وصلنا طلب لتغيير كلمة مرور حسابك. اضغط الزر واختار كلمة مرور جديدة.
  </p>

  <p style="margin:0 0 26px">
    <a href="{{ .ConfirmationURL }}"
       style="display:inline-block;background:#F0B23C;color:#3A2600;text-decoration:none;font-weight:bold;font-size:16px;padding:14px 28px;border-radius:10px">
      غيّر كلمة المرور
    </a>
  </p>

  <p style="margin:0 0 6px;font-size:13px;color:#665C50;line-height:1.8">
    إذا الزر ما اشتغل، انسخ هذا الرابط وافتحه بالمتصفح:
  </p>
  <p style="margin:0 0 24px;font-size:12px;color:#8C8275;word-break:break-all;direction:ltr;text-align:left">{{ .ConfirmationURL }}</p>

  <p style="margin:0;padding-top:16px;border-top:1px solid #E4DFD5;font-size:12px;color:#8C8275;line-height:1.8">
    ما طلبت تغيير كلمة المرور؟ تجاهل هذي الرسالة، وكلمة مرورك الحالية تبقى مثل ما هي.
  </p>
</div>
```
