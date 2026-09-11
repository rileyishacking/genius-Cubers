import { lazy, Suspense, type ComponentType } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import AuthModal from './auth/AuthModal';
import { CartProvider } from './cart/CartContext';
import CartPanel from './cart/CartPanel';
import FallingCubes from './components/FallingCubes';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Intro from './components/Intro';
import Story from './components/Story';
import Footer from './components/Footer';

/* الصفحة الرئيسية تُحمَّل فوراً، وباقي الصفحات عند فتحها.
   three.js وحده أكثر من نصف حجم الموقع ولا تستعمله إلا المنتجات
   والحلبة، فزائر الرئيسية كان ينزّله بلا فائدة. */

/* بعد كل نشر تتغيّر أسماء ملفات الصفحات ويُحذف القديم. زائر فاتح
   الموقع من قبل النشر ويضغط رابطاً سيطلب ملفاً لم يعد موجوداً،
   فنعيد تحميل الصفحة مرة واحدة ليأخذ النسخة الجديدة. العلامة في
   sessionStorage تمنع حلقة إعادة تحميل لو كان الخلل حقيقياً. */
const RELOADED = 'genius-chunk-reload';
function page<T extends ComponentType>(load: () => Promise<{ default: T }>) {
  return lazy(() =>
    load()
      .then(m => { try { sessionStorage.removeItem(RELOADED); } catch { /* لا شيء */ } return m; })
      .catch(err => {
        let tried = false;
        try { tried = sessionStorage.getItem(RELOADED) === '1'; sessionStorage.setItem(RELOADED, '1'); } catch { /* لا شيء */ }
        if (!tried) { window.location.reload(); return new Promise<never>(() => {}); }
        throw err;
      }),
  );
}

const Store = page(() => import('./pages/Store'));
const Arena = page(() => import('./pages/Arena'));
const Account = page(() => import('./pages/Account'));
const Academy = page(() => import('./pages/Academy'));
const Privacy = page(() => import('./pages/Privacy'));

function Home() {
  return (
    <>
      <Hero />
      <Intro />
      <Story />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <CartProvider>
      <FallingCubes />
      <div className="page">
        <Nav />
        <Suspense fallback={<div className="route-wait" role="status" aria-label="جاري التحميل" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/store" element={<Store />} />
            <Route path="/arena" element={<Arena />} />
            <Route path="/account" element={<Account />} />
            <Route path="/academy" element={<Academy />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
        <Footer />
        <CartPanel />
        <AuthModal />
      </div>
      </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
